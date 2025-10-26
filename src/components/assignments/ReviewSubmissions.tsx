import React, { useEffect, useMemo, useState } from 'react';
import api, { fetchSubmissions, fetchAssignments } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import { Eye, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  assignmentId: string;
  open: boolean;
  onClose: () => void;
  asPage?: boolean; // when true, renders as page content instead of modal
}

const StatusPill = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    SUBMITTED: 'bg-sky-600 text-white',
    PENDING: 'bg-gray-600 text-white',
    OVERDUE: 'bg-orange-600 text-white',
    ACCEPTED: 'bg-green-600 text-white',
    REJECTED: 'bg-red-600 text-white',
  };
  const cls = map[status] || 'bg-gray-600 text-white';
  return <span className={`px-2 py-0.5 rounded text-xs ${cls}`}>{status}</span>;
};

const ReviewSubmissions: React.FC<Props> = ({ assignmentId, open, onClose, asPage = false }) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [assignmentTitle, setAssignmentTitle] = useState<string>('');
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
        if (found) setAssignmentTitle(found.title || '');
      } catch (e) {
        // ignore assignment title failure
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

  const handleReview = async (submissionId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.patch(`/assignments/submissions/${submissionId}/review`, { status });
      toast.success('Updated review');
      await load();
    } catch (err) {
      console.error('Review failed', err);
      toast.error('Failed to update review status');
    }
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
        <div className="bg-gray-900 border border-gray-700 rounded shadow-lg p-6">
          {content}
          <div className="text-gray-300">You do not have permission to view submissions. This area is restricted to faculty members.</div>
        </div>
      );
    }
    
    return (
      <div className="fixed inset-0 z-50 bg-black/60 p-6 overflow-auto">
        <div className="max-w-[600px] mx-auto bg-gray-900 border border-gray-700 rounded shadow-lg p-6">
          {content}
          <div className="text-gray-300">You do not have permission to view submissions. This area is restricted to faculty members.</div>
        </div>
      </div>
    );
  }

  const mainContent = (
    <div className="max-w-[1100px] mx-auto bg-gray-900 border border-gray-700 rounded shadow-lg">
      <div className="p-5 border-b border-gray-700">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">Submissions</h2>
            <div className="text-sm text-gray-400">{assignmentTitle ? assignmentTitle : `Assignment ID: ${assignmentId}`}</div>
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
            <option value="PENDING">Pending</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="OVERDUE">Overdue</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
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
                  <td className="p-2"><StatusPill status={s.status || 'PENDING'} /></td>
                  <td className="p-2">{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : 'Not submitted'}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      {s.submissionFileUrl && (
                        <a href={s.submissionFileUrl} target="_blank" rel="noreferrer" className="text-blue-400 p-1 rounded hover:bg-gray-800">
                          <Eye size={16} />
                        </a>
                      )}
                      {s.content && (
                        <button onClick={() => toast.success(s.content)} className="text-blue-400 p-1 rounded hover:bg-gray-800" title="View text">
                          <Eye size={16} />
                        </button>
                      )}
                      <button onClick={() => handleReview(s.id, 'ACCEPTED')} className="p-1 rounded bg-green-700 text-white" title="Accept">
                        <CheckCircle size={16} />
                      </button>
                      <button onClick={() => handleReview(s.id, 'REJECTED')} className="p-1 rounded bg-red-700 text-white" title="Reject">
                        <XCircle size={16} />
                      </button>
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
    return mainContent;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-6 overflow-auto">
      {mainContent}
    </div>
  );
};

export default ReviewSubmissions;
