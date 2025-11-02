import React, { useState } from 'react';
import { X, Eye, Download, User, Mail, Calendar, FileText } from 'lucide-react';
import { SubmissionStatus } from '../../constants/submissionStatus';
import { useToast } from '../../hooks/use-toast';

interface Submission {
  id: string;
  content?: string;
  submissionFileUrl?: string;
  submittedAt?: string;
  status?: string;
  student?: {
    user?: {
      username?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    };
    username?: string;
    email?: string;
  };
  studentName?: string;
}

interface Props {
  submission: Submission | null;
  open: boolean;
  onClose: () => void;
  onAccept: (submissionId: string) => void;
  onReject: (submissionId: string) => void;
}

const SubmissionReviewModal: React.FC<Props> = ({
  submission,
  open,
  onClose,
  onAccept,
  onReject
}) => {
  const [imageError, setImageError] = useState(false);
  const [pendingAction, setPendingAction] = useState<'accept' | 'reject' | null>(null);
  const { toast } = useToast();
  
  if (!open || !submission) return null;

  const username = submission.student?.user?.username || submission.student?.username || submission.studentName || 'Unknown';
  const email = submission.student?.user?.email || submission.student?.email || 'No email';
  const fullName = submission.student?.user?.firstName && submission.student?.user?.lastName 
    ? `${submission.student.user.firstName} ${submission.student.user.lastName}`
    : username;

  const isImageFile = submission.submissionFileUrl && /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(submission.submissionFileUrl);

  const handleAccept = () => {
    if (pendingAction) return;
    
    setPendingAction('accept');
    toast({
      title: "Confirm Accept",
      description: "Click the Accept button again to confirm accepting this submission"
    });
  };

  const handleReject = () => {
    if (pendingAction) return;
    
    setPendingAction('reject');
    toast({
      title: "Confirm Reject", 
      description: "Click the Reject button again to confirm rejecting this submission"
    });
  };

  const confirmAccept = () => {
    onAccept(submission.id);
    setPendingAction(null);
  };

  const confirmReject = () => {
    onReject(submission.id);
    setPendingAction(null);
  };

  const cancelAction = () => {
    setPendingAction(null);
    toast({
      title: "Action Cancelled",
      description: "No changes were made to the submission"
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Review Submission</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            
            {/* Student Information - Top Section */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <User size={20} />
                Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Name</div>
                    <div className="text-sm white">{fullName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Email</div>
                    <div className="text-sm white">{email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-400">Submitted At</div>
                    <div className="text-sm white">
                      {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Not submitted'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content */}
            {submission.content && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Text Submission
                </h3>
                <div className="bg-gray-700 p-4 rounded border text-gray-200 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {submission.content}
                </div>
              </div>
            )}

            {/* File Preview - Bottom Section */}
            <div className="space-y-4">
              {submission.submissionFileUrl && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Eye size={20} />
                      File Preview
                    </h3>
                    <a
                      href={submission.submissionFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                  
                  <div className="border border-gray-600 rounded-lg overflow-hidden">
                    {isImageFile && !imageError ? (
                      <img
                        src={submission.submissionFileUrl}
                        alt="Submission preview"
                        className="w-full max-h-96 object-contain bg-gray-900"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-96 bg-gray-900 text-gray-400">
                        <Eye size={48} className="mb-4" />
                        <p className="text-center">
                          {isImageFile && imageError ? 'Failed to load image preview' : 'File preview not available'}
                        </p>
                        <p className="text-sm mt-2">Click download to view the file</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {!submission.submissionFileUrl && !submission.content && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <FileText size={48} className="mb-4" />
                  <p>No submission content available</p>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-700 p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded hover:border-gray-500"
            >
              Close
            </button>
            {(submission.status === 'SUBMITTED' || submission.status === 'OVERDUE') && (
              <>
                {pendingAction ? (
                  <>
                    <button
                      onClick={cancelAction}
                      className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded hover:border-gray-500"
                    >
                      Cancel
                    </button>
                    {pendingAction === 'reject' && (
                      <button
                        onClick={confirmReject}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Confirm Reject
                      </button>
                    )}
                    {pendingAction === 'accept' && (
                      <button
                        onClick={confirmAccept}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Confirm Accept
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleAccept}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionReviewModal;