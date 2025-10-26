import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import StudentSubmitModal from './StudentSubmitModal';

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
  const [editing, setEditing] = useState(false);
  const [assignmentMeta, setAssignmentMeta] = useState<{ title?: string; classroomName?: string; classroomId?: string; deadline?: string } | null>(null);
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState(false);

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

  useEffect(() => { if (open) load(); }, [open, assignmentId, classroomId]);

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
    } catch (err) {
      console.error('Failed to delete submission', err);
      toast.error('Failed to delete submission');
    } finally {
      setPendingDelete(false);
    }
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
              <div className="text-gray-300">You have not submitted this assignment yet.</div>
              <div className="flex justify-end">
                <button 
                  onClick={() => setEditing(true)} 
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Submit Assignment
                </button>
              </div>
            </div>
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
                  const deadline = assignmentMeta && assignmentMeta.deadline ? new Date(assignmentMeta.deadline) : null;
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

      {editing && (
        <StudentSubmitModal
          open={editing}
          onClose={() => { setEditing(false); load(); }}
          assignmentId={assignmentId}
          existingSubmission={submission}
          onSubmitted={async () => { setEditing(false); await load(); }}
        />
      )}
    </div>
  );

  if (asPage) {
    return mainContent;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-6 flex items-center justify-center">
      {mainContent}
    </div>
  );
};

export default StudentAssignmentSubmissions;
