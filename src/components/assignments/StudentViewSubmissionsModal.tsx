import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import StudentSubmitModal from './StudentSubmitModal';

interface Props {
  assignmentId: string;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => Promise<void> | (() => void);
}

const StudentViewSubmissionsModal: React.FC<Props> = ({ assignmentId, open, onClose, onDeleted }) => {
  const [submission, setSubmission] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [assignmentMeta, setAssignmentMeta] = useState<{ deadline?: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments/my', { params: { assignmentId } });
      const arr = res.data || [];
      if (Array.isArray(arr)) {
        const found = arr.find((s: any) => String(s.assignmentId) === String(assignmentId));
        setSubmission(found || null);
      } else if (arr && typeof arr === 'object') {
        setSubmission(arr.assignmentId && String(arr.assignmentId) === String(assignmentId) ? arr : null);
      } else {
        setSubmission(null);
      }

      try {
        const allRes = await api.get('/assignments');
        const assignments = allRes.data || [];
        const assignment = assignments.find((a: any) => String(a.id) === String(assignmentId));
        if (assignment) {
          setAssignmentMeta({ deadline: assignment.deadline });
        }
      } catch (err) {
        console.error('Failed to load assignment metadata', err);
      }
    } catch (err) {
      console.error('Failed to load my submission', err);
      try {
        const res2 = await api.get('/assignments/my');
        const arr2 = res2.data || [];
        const found2 = (arr2 || []).find((s: any) => String(s.assignmentId) === String(assignmentId));
        setSubmission(found2 || null);
      } catch (err2) {
        console.error('Fallback fetch failed', err2);
        toast.error('Failed to load your submission');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    load();
  }, [open, assignmentId]);

  const requestDelete = () => {
    setPendingDelete(true);
    toast({
      title: 'Confirm deletion',
      description: 'Click Confirm below to permanently delete your submission'
    });
  };

  const cancelDelete = () => {
    setPendingDelete(false);
    toast({
      title: 'Delete cancelled'
    });
  };

  const confirmDelete = async (id: string) => {
    try {
      await api.delete(`/assignments/submissions/${id}`);
      toast.success('Submission deleted');
      setSubmission(null);
      if (onDeleted) {
        try {
          await onDeleted();
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error('Failed to delete submission', err);
      toast.error('Failed to delete submission');
    } finally {
      setPendingDelete(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">My Submission</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
        </div>

        <div className="p-4">
          {loading && <div className="text-gray-300">Loading...</div>}
          {!loading && !submission && (
            <div className="text-gray-300">You have not submitted this assignment yet.</div>
          )}

          {submission && (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400">Submitted At</div>
                <div className="text-white">{submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : '-'}</div>
              </div>
              {submission.submissionFileUrl && (
                <div className="flex items-center gap-3">
                  <a href={submission.submissionFileUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Open submitted file</a>
                  <button
                    onClick={() => { setPreviewUrl(submission.submissionFileUrl); setPreviewOpen(true); }}
                    className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-gray-200"
                  >
                    Preview
                  </button>
                </div>
              )}
              {submission.content && (
                <div>
                  <div className="text-sm text-gray-400">Text</div>
                  <div className="text-gray-200 whitespace-pre-wrap">{submission.content}</div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                {(() => {
                  const submissionStatus = (submission?.status || '').toUpperCase();
                  const deadline = assignmentMeta?.deadline ? new Date(assignmentMeta.deadline) : null;
                  const now = new Date();
                  const isBeforeDeadline = deadline ? deadline > now : true;
                  const isRejected = submissionStatus === 'REJECTED';
                  
                  // Show resubmit button if rejected and before deadline
                  if (isRejected && isBeforeDeadline) {
                    return (
                      <>
                        <button 
                          onClick={() => setEditing(true)} 
                          className="px-3 py-1 rounded bg-orange-600 text-white hover:bg-orange-700"
                        >
                          Resubmit
                        </button>
                        {pendingDelete ? (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => confirmDelete(submission.id)} 
                              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button 
                              onClick={cancelDelete} 
                              className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={requestDelete} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
                        )}
                      </>
                    );
                  }
                  
                  // Default edit/delete for other statuses
                  return (
                    <>
                      <button onClick={() => setEditing(true)} className="px-3 py-1 rounded bg-indigo-600 text-white">Edit</button>
                      {pendingDelete ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => confirmDelete(submission.id)} 
                            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={cancelDelete} 
                            className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={requestDelete} className="px-3 py-1 rounded bg-red-600 text-white">Delete</button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {editing && submission && (
          <StudentSubmitModal
            open={editing}
            onClose={() => { setEditing(false); load(); }}
            assignmentId={assignmentId}
            existingSubmission={submission}
            onSubmitted={async () => { setEditing(false); await load(); }}
          />
        )}
        {previewOpen && previewUrl && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-6">
            <div className="w-full max-w-4xl bg-gray-900 border border-gray-700 rounded shadow-lg overflow-hidden">
              <div className="p-3 border-b border-gray-700 flex items-center justify-between">
                <div className="text-white font-medium">Preview</div>
                <div>
                  <button onClick={() => setPreviewOpen(false)} className="text-gray-300 hover:text-white">Close</button>
                </div>
              </div>
              <div className="h-[80vh]">
                <iframe src={previewUrl} className="w-full h-full" title="submission-preview" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentViewSubmissionsModal;
