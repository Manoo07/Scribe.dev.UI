import React, { useEffect, useMemo, useState } from 'react';
import api, { fetchSubmissions, fetchAssignments } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { SubmissionStatus } from '../../constants/submissionStatus';
import { StatusBadge } from '../ui/SubmissionStatusComponents';
import SubmissionReviewModal from './SubmissionReviewModal';

interface Props {
  assignmentId: string;
  open: boolean;
  onClose: () => void;
  asPage?: boolean; // when true, renders as page content instead of modal
}

interface AssignmentInfo {
  title?: string;
  deadline?: string;
}

const StatusPill = ({ status, deadline }: { status: string; deadline?: string }) => {
  return <StatusBadge status={status} isStudent={false} deadline={deadline} />;
};

const ReviewSubmissions: React.FC<Props> = ({ assignmentId, open, onClose, asPage = false }) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [assignmentInfo, setAssignmentInfo] = useState<AssignmentInfo>({});
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchSubmissions(assignmentId);
      setSubmissions(data || []);
      try {
        const all = await fetchAssignments();
        const found = (all || []).find((a: any) => a.id === assignmentId || String(a.id) === String(assignmentId));
        if (found) setAssignmentInfo({ title: found.title || '', deadline: found.deadline });
      } catch (e) {
        // ignore assignment info failure
      }
    } catch (err) {
      console.error('Failed to load submissions', err);
      toast.error('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if (user?.role !== 'FACULTY') return;
    load();
  }, [open, assignmentId]);


  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      const username = (s.student?.user?.username || s.student?.username || s.student?.user?.name || s.studentName || '').toLowerCase();
      const email = (s.student?.user?.email || s.student?.email || '').toLowerCase();
      return username.includes(q) || email.includes(q);
    });
  }, [submissions, query, statusFilter]);

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      await api.patch(`/assignments/submissions/${submissionId}/review`, { 
        status: newStatus
      });
      toast.success(`Status updated to ${newStatus.toLowerCase()}`);
      await load();
    } catch (err) {
      console.error('Status change failed', err);
      toast.error('Failed to update status');
    }
  };

  const handleAccept = (submissionId: string) => {
    handleStatusChange(submissionId, SubmissionStatus.ACCEPTED);
    setReviewModalOpen(false);
  };

  const handleReject = (submissionId: string) => {
    handleStatusChange(submissionId, SubmissionStatus.REJECTED);
    setReviewModalOpen(false);
  };

  const openReviewModal = (submission: any) => {
    setSelectedSubmission(submission);
    setReviewModalOpen(true);
  };

  if (!open) return null;

  if (user?.role !== 'FACULTY') {
    const content = (
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Submissions</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
      </div>
    );
    
    if (asPage) {
      return (
        <>
          <div className="bg-gray-900 border border-gray-700 rounded shadow-lg p-6">
            {content}
            <div className="text-gray-300">You do not have permission to view submissions. This area is restricted to faculty members.</div>
          </div>
          
          <SubmissionReviewModal
            submission={selectedSubmission}
            open={reviewModalOpen}
            onClose={() => {
              setReviewModalOpen(false);
              setSelectedSubmission(null);
            }}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        </>
      );
    }
    
    return (
      <>
        <div className="fixed inset-0 z-50 bg-black/60 p-6 overflow-auto">
          <div className="max-w-[600px] mx-auto bg-gray-900 border border-gray-700 rounded shadow-lg p-6">
            {content}
            <div className="text-gray-300">You do not have permission to view submissions. This area is restricted to faculty members.</div>
          </div>
        </div>
        
        <SubmissionReviewModal
          submission={selectedSubmission}
          open={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedSubmission(null);
          }}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </>
    );
  }

  const mainContent = (
    <div className="max-w-[1100px] mx-auto bg-gray-900 border border-gray-700 rounded shadow-lg">
      <div className="p-5 border-b border-gray-700">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Submissions</h2>
            <div className="text-sm text-gray-400">{assignmentInfo.title ? assignmentInfo.title : `Assignment ID: ${assignmentId}`}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-gray-400 hover:text-white">Close</button>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by username or email..." className="flex-1 bg-gray-800 border border-gray-700 rounded p-2 text-sm text-gray-200" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded p-2 text-sm text-gray-200">
            <option value="ALL">All Status</option>
            <option value={SubmissionStatus.PENDING}>Not Submitted</option>
            <option value={SubmissionStatus.SUBMITTED}>Submitted</option>
            <option value={SubmissionStatus.OVERDUE}>Late Submission</option>
            <option value={SubmissionStatus.ACCEPTED}>Accepted</option>
            <option value={SubmissionStatus.REJECTED}>Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-gray-300">
            <thead className="text-sm text-gray-400">
              <tr>
                <th className="p-2">Username</th>
                <th className="p-2">Email</th>
                <th className="p-2">Status</th>
                <th className="p-2">Submitted At</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="p-4 text-gray-400">Loading...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-gray-400">No submissions found.</td></tr>
              )}
              {filtered.map((s: any) => (
                <tr key={s.id} className="border-t border-gray-800">
                  <td className="p-2">{(s.student?.user?.username) || s.student?.username || s.student?.user?.name || s.studentName || '-'}</td>
                  <td className="p-2">{(s.student && s.student.user && s.student.user.email) || s.student?.email || '-'}</td>
                  <td className="p-2"><StatusPill status={s.status || 'PENDING'} deadline={assignmentInfo.deadline} /></td>
                  <td className="p-2">{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : 'Not submitted'}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {/* Review button - opens modal for all submissions with content */}
                      {(s.submissionFileUrl || s.content) ? (
                        <button 
                          onClick={() => openReviewModal(s)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Eye size={14} />
                          Review
                        </button>
                      ) : (
                        <span className="text-gray-500 text-sm">No submission</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (asPage) {
    return (
      <>
        {mainContent}
        <SubmissionReviewModal
          submission={selectedSubmission}
          open={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedSubmission(null);
          }}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 p-6 overflow-auto">
        {mainContent}
      </div>
      
      <SubmissionReviewModal
        submission={selectedSubmission}
        open={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedSubmission(null);
        }}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </>
  );
};

export default ReviewSubmissions;
