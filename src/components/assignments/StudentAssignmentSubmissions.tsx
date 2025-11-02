import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { SubmissionStatus, getSubmissionStatusInfo } from '../../constants/submissionStatus';
import { StatusMessage } from '../ui/SubmissionStatusComponents';
import { Upload, FileText, X, Download, File } from 'lucide-react';

interface Props {
  assignmentId: string;
  classroomId?: string | null;
  open: boolean;
  onClose: () => void;
  asPage?: boolean;
}

const StudentAssignmentSubmissions: React.FC<Props> = ({ assignmentId, classroomId, open, onClose, asPage = false }) => {
  const [submission, setSubmission] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [assignmentMeta, setAssignmentMeta] = useState<{ title?: string; classroomName?: string; classroomId?: string; deadline?: string } | null>(null);
  const { toast } = useToast();
  
  // Inline upload states
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments/my', { params: { assignmentId } });
      const data = res.data;
      let found: any | null = null;
      if (Array.isArray(data)) {
        found = data.find((s: any) => String(s.assignmentId) === String(assignmentId)) || null;
      } else if (data && typeof data === 'object') {
        found = String(data.assignmentId) === String(assignmentId) ? data : null;
      }

      if (classroomId && found && found.assignment && found.assignment.classroomId) {
        if (String(found.assignment.classroomId) !== String(classroomId)) {
          found = null;
        }
      }

      setSubmission(found);

      try {
        const all = await api.get('/assignments');
        const arr = all.data || [];
        const match = (arr || []).find((a: any) => String(a.id) === String(assignmentId));
        if (match) {
          setAssignmentMeta({ 
            title: match.title, 
            classroomName: match.classroom?.name, 
            classroomId: match.classroomId || match.classroom?.id,
            deadline: match.deadline
          });
        }
      } catch {}
    } catch (err) {
      console.error('Failed to load my submission', err);
      toast.error('Failed to load your submission');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (open) {
      load(); 
      // Reset states when modal opens
      setShowUpload(false);
      setSelectedFile(null);
      setShowDeleteDialog(false);
    }
  }, [open, assignmentId, classroomId]);

  // Auto-show upload interface for students with no submission
  useEffect(() => {
    if (open && !loading && !submission) {
      setShowUpload(true);
    }
  }, [open, loading, submission]);

  const requestDelete = () => {
    setShowDeleteDialog(true);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const confirmDelete = async (id: string) => {
    try {
      await api.delete(`/assignments/submissions/${id}`);
      toast.success('Submission deleted successfully');
      setSubmission(null);
      setShowDeleteDialog(false);
    } catch (err) {
      console.error('Failed to delete submission', err);
      toast.error('Failed to delete submission');
      setShowDeleteDialog(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Automatically submit the file when selected
      await handleSubmitFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmitFile = async (fileToSubmit?: File) => {
    const file = fileToSubmit || selectedFile;
    if (!file) {
      toast.error('Please select a file to submit');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('submissionFile', file);

      if (submission?.id) {
        // Update existing submission
        await api.patch(`/assignments/submissions/${submission.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Submission updated successfully');
      } else {
        // Create new submission
        await api.post(`/assignments/${assignmentId}/submit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Assignment submitted successfully');
      }

      // Reset upload state and reload
      setShowUpload(false);
      setSelectedFile(null);
      await load();
    } catch (err) {
      console.error('Submit failed', err);
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelUpload = () => {
    setShowUpload(false);
    setSelectedFile(null);
  };

  // Helper function to get file type from URL
  const getFileType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'image';
      case 'txt':
        return 'text';
      case 'doc':
      case 'docx':
        return 'document';
      default:
        return 'unknown';
    }
  };

  // Helper function to get file name from URL
  const getFileName = (url: string): string => {
    return url.split('/').pop() || 'file';
  };

  if (!open) return null;

  const mainContent = (
    <div className="w-full max-w-[700px] max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded shadow-lg">
      <div className="p-4 border-b border-gray-700 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-white">My Submission</h3>
          {assignmentMeta && (
            <div className="text-sm text-gray-400">
              {assignmentMeta.title} {assignmentMeta.classroomName ? `• ${assignmentMeta.classroomName}` : ''}
            </div>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
      </div>

        <div className="p-4">
          {loading && <div className="text-gray-300">Loading...</div>}
          {!loading && !submission && (
            <div className="space-y-4">
              <StatusMessage 
                status={SubmissionStatus.PENDING}
                isStudent={true}
                deadline={assignmentMeta?.deadline}
                assignmentTitle={assignmentMeta?.title}
              />
              
              {!showUpload ? (
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowUpload(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Upload size={20} />
                    Upload Submission
                  </button>
                </div>
              ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">Submit Your Assignment</h4>
                    <button
                      onClick={cancelUpload}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select File to Upload
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="file-upload"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-600 hover:border-green-500 rounded-lg cursor-pointer transition-colors"
                        >
                          {submitting ? (
                            <>
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                              <div className="text-left">
                                <div className="text-green-400 font-medium">Submitting...</div>
                                <div className="text-gray-400 text-sm">Please wait</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <Upload className="text-gray-400" size={24} />
                              <div className="text-left">
                                <div className="text-gray-300">Choose file to submit</div>
                                <div className="text-gray-500 text-sm">PDF, DOC, DOCX, TXT, JPG, PNG - Auto-submits when selected</div>
                              </div>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={cancelUpload}
                        disabled={submitting}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {submission && (
            <div className="space-y-3">
              <StatusMessage 
                status={submission.status || SubmissionStatus.SUBMITTED}
                isStudent={true}
                deadline={assignmentMeta?.deadline}
                assignmentTitle={assignmentMeta?.title}
              />
              
              <div>
                <div className="text-sm text-gray-400">Submitted At</div>
                <div className="text-white">{submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : '-'}</div>
              </div>
              
              {submission.submissionFileUrl && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">Submitted File</div>
                    <div className="flex items-center gap-2">
                      <a
                        href={submission.submissionFileUrl}
                        download
                        className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    </div>
                  </div>
                  
                  {/* File Preview */}
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    {(() => {
                      const fileType = getFileType(submission.submissionFileUrl);
                      const fileName = getFileName(submission.submissionFileUrl);
                      
                      switch (fileType) {
                        case 'image':
                          return (
                            <div className="text-center">
                              <img
                                src={submission.submissionFileUrl}
                                alt="Submitted file"
                                className="max-w-full max-h-96 mx-auto rounded border border-gray-600"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden flex items-center justify-center gap-2 text-gray-400 py-8">
                                <File size={24} />
                                <span>Image preview not available</span>
                              </div>
                            </div>
                          );
                        
                        case 'pdf':
                          return (
                            <div className="text-center space-y-3">
                              <div className="flex items-center justify-center gap-2 text-blue-400">
                                <FileText size={32} />
                                <div>
                                  <div className="font-medium">PDF Document</div>
                                  <div className="text-sm text-gray-400">{fileName}</div>
                                </div>
                              </div>
                              <iframe
                                src={`${submission.submissionFileUrl}#view=FitH`}
                                className="w-full h-96 border border-gray-600 rounded"
                                title="PDF Preview"
                              />
                              <p className="text-gray-500 text-xs">
                                PDF preview - Use "Download" to save the file locally
                              </p>
                            </div>
                          );
                        
                        case 'text':
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-300">
                                <FileText size={20} />
                                <span className="font-medium">Text File: {fileName}</span>
                              </div>
                              <iframe
                                src={submission.submissionFileUrl}
                                className="w-full h-48 bg-white text-black p-2 rounded border border-gray-600"
                                title="Text File Preview"
                              />
                            </div>
                          );
                        
                        default:
                          return (
                            <div className="text-center space-y-3 py-8">
                              <div className="flex items-center justify-center gap-2 text-gray-400">
                                <File size={32} />
                                <div>
                                  <div className="font-medium">{fileName}</div>
                                  <div className="text-sm">
                                    {fileType === 'document' ? 'Document file' : 'File'} - Preview not available
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-500 text-sm">
                                Click "Download" to save the file to your device
                              </p>
                            </div>
                          );
                      }
                    })()}
                  </div>
                </div>
              )}
              
              {submission.content && (
                <div>
                  <div className="text-sm text-gray-400">Text Content</div>
                  <div className="text-gray-200 whitespace-pre-wrap bg-gray-800 p-3 rounded border">{submission.content}</div>
                </div>
              )}



              {/* Action buttons and upload section */}
              {!showUpload ? (
                <div className="flex gap-2 justify-end">
                  {getSubmissionStatusInfo(submission.status || SubmissionStatus.SUBMITTED, true, assignmentMeta?.deadline ? new Date(assignmentMeta.deadline) > new Date() : true).studentPermissions.canEdit && (
                    <button
                      onClick={() => setShowUpload(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Update Submission
                    </button>
                  )}
                  
                  {/* Delete button - only show if student can edit/resubmit */}
                  {getSubmissionStatusInfo(submission.status || SubmissionStatus.SUBMITTED, true, assignmentMeta?.deadline ? new Date(assignmentMeta.deadline) > new Date() : true).studentPermissions.canEdit && (
                    <button 
                      onClick={requestDelete} 
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium">Update Your Submission</h4>
                    <button
                      onClick={cancelUpload}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Select New File to Upload
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          id="file-upload-edit"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                        <label
                          htmlFor="file-upload-edit"
                          className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg cursor-pointer transition-colors"
                        >
                          {selectedFile ? (
                            <>
                              <FileText className="text-blue-400" size={24} />
                              <div className="text-left">
                                <div className="text-white font-medium">{selectedFile.name}</div>
                                <div className="text-gray-400 text-sm">
                                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <Upload className="text-gray-400" size={24} />
                              <div className="text-left">
                                <div className="text-gray-300">Choose new file to upload</div>
                                <div className="text-gray-500 text-sm">PDF, DOC, DOCX, TXT, JPG, PNG</div>
                              </div>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={cancelUpload}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitFile()}
                        disabled={!selectedFile || submitting}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                      >
                        {submitting ? 'Updating...' : 'Update Submission'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


    </div>
  );

  if (asPage) {
    return (
      <>
        {mainContent}
        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Delete Submission</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete your submission? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(submission?.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 p-6 flex items-center justify-center">
        {mainContent}
      </div>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Submission</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete your submission? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(submission?.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentAssignmentSubmissions;
