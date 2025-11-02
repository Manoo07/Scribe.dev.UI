import React, { useEffect, useMemo, useState } from 'react';
import api, { fetchAssignments, deleteAssignment } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useLocation } from 'react-router-dom';
import ReviewSubmissions from '../components/assignments/ReviewSubmissions';
import StudentAssignmentSubmissions from '../components/assignments/StudentAssignmentSubmissions';

type Assignment = {
  id: string | number;
  title: string;
  classroom?: string;
  dueDate?: string | null; // ISO or optional
  status: string;
  submissions?: { submitted: number; total: number };
};

const formatDate = (value?: string | number | Date | null) => {
  if (!value) return 'No deadline';
  const d = new Date(value as any);
  if (isNaN(d.getTime())) return 'No deadline';
  return d.toLocaleDateString();
};

const daysUntil = (value?: string | number | Date | null) => {
  if (!value) return null;
  const now = new Date();
  const d = new Date(value as any);
  if (isNaN(d.getTime())) return null;
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const normalizeStatus = (s: string | undefined | null) => String(s ?? '').trim().toUpperCase();

const calculateFacultyStatus = (assignment: any) => {
  const now = new Date();
  const deadline = assignment.deadline ? new Date(assignment.deadline) : null;
  const hasSubmissions = (assignment._count?.assignmentSubmissions || 0) > 0;
  const totalStudents = assignment.classroom?._count?.virtualClassroomStudents || 0;
  
  // Before deadline
  if (!deadline || deadline > now) {
    return 'OPEN';
  }
  
  // After deadline
  if (deadline <= now) {
    // If there are submissions that need review
    if (hasSubmissions && totalStudents > 0) {
      return 'PENDING';
    }
    // If no submissions or no students
    return 'OVERDUE';
  }
  
  return 'OPEN';
};

const statusBadgeClass = (status: string) => {
  const s = normalizeStatus(status);
  switch (s) {
    case 'SUBMITTED':
      return 'bg-green-600 text-white';
    case 'CLOSED':
      return 'bg-gray-600 text-white';
    case 'OPEN':
      return 'bg-teal-600 text-white';
    case 'PENDING':
    case 'PENDING REVIEW':
      return 'bg-yellow-600 text-white';
    case 'OVERDUE':
      return 'bg-orange-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};

const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mySubmissionsMap, setMySubmissionsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState('');
  const [classroomFilter, setClassroomFilter] = useState<string>('ALL');
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  
  // Submission modal state
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();


  const classrooms = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const a of assignments) {
      const cls = (a as any).classroom;
      if (!cls) continue;
      if (typeof cls === 'string') {
        map.set(cls, { id: cls, name: cls });
      } else {
        const id = cls.id ?? cls.classroomId ?? String(cls.name ?? '');
        const sid = String(id);
        if (!map.has(sid)) map.set(sid, { id: sid, name: String(cls.name ?? sid) });
      }
    }
    return Array.from(map.values());
  }, [assignments]);

  useEffect(() => {
    const cid = searchParams.get('classroomId');
    if (cid && user?.role === 'STUDENT') {
      setClassroomFilter(String(cid));
    }
  }, [searchParams, user?.role]);


  const submissionStatusClass = (status?: string) => {
    switch ((status || '').toUpperCase()) {
      case 'SUBMITTED': return 'bg-sky-600 text-white';
      case 'PENDING': return 'bg-gray-600 text-white';
      case 'OVERDUE': return 'bg-orange-600 text-white';
      case 'ACCEPTED': return 'bg-green-600 text-white';
      case 'REJECTED': return 'bg-red-600 text-white';
      default: return 'bg-gray-700 text-white';
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // if no query, return all assignments
    // if no query and no classroom filter, return all assignments
    if (!q && (classroomFilter === 'ALL' || !classroomFilter)) return assignments;

    return assignments.filter((a) => {
      // classroom filter check
      if (classroomFilter && classroomFilter !== 'ALL') {
        const cls = (a as any).classroom;
        const clsId = cls && (cls.id ?? cls.classroomId ?? cls._id) ? String(cls.id ?? cls.classroomId ?? cls._id) : (typeof cls === 'string' ? cls : '');
        // if classroom is stored as object with id or as name string, compare against selected
        if (String(classroomFilter) !== clsId && String(classroomFilter) !== String((cls && cls.name) || cls || '')) return false;
      }
      const title = (a.title || '').toString().toLowerCase();
      const classroomName = typeof (a as any).classroom === 'string'
        ? (a as any).classroom
        : ((a as any).classroom && (a as any).classroom.name) ? String((a as any).classroom.name) : '';
      const description = ((a as any).description ?? '').toString().toLowerCase();
      const idStr = String(a.id || '').toLowerCase();

     if (title.startsWith(q)) return true;
      if (classroomName.startsWith(q)) return true;
      if (idStr.startsWith(q)) return true;

      const descTokens = description.split(/\s+/).filter(Boolean);
      for (const t of descTokens) {
        if (t.startsWith(q)) return true;
      }

      return false;
    });
  }, [assignments, query, classroomFilter]);

  const stats = useMemo(() => {
    const list = filtered;
    const total = list.length;

    let open = 0;
    let pending = 0;

    if (user?.role === 'STUDENT') {
      for (const a of list) {
        const myStatusRaw = mySubmissionsMap[String(a.id)]?.status || (a as any).studentStatus || a.status;
        const myStatus = String(myStatusRaw || '').toUpperCase();
        if (myStatus === 'SUBMITTED' || myStatus === 'ACCEPTED') pending++;
        else open++;
      }
    } else {
      // Faculty view - calculate based on our new status logic
      for (const a of list) {
        const calculatedStatus = calculateFacultyStatus(a);
        if (calculatedStatus === 'OPEN') {
          open++;
        } else if (calculatedStatus === 'PENDING' || calculatedStatus === 'OVERDUE') {
          pending++;
        }
      }
    }

    const dueThisWeek = list.filter((a) => {
      const d = daysUntil((a as any).deadline ?? (a as any).dueDate);
      return d !== null && d >= 0 && d <= 7;
    }).length;

    return { total, open, pending, dueThisWeek };
  }, [filtered, mySubmissionsMap, user?.role]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchAssignments();
        if (!mounted) return;
        setAssignments(Array.isArray(res) ? res : []);
      } catch (err: any) {
        console.error('Failed to load assignments', err);
        if (!mounted) return;
        toast.error(err?.message || 'Failed to load assignments');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Handle automatic modal opening from navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state?.openSubmissionModal && state?.assignmentId) {
      // Clear the navigation state to prevent reopening on page refresh
      window.history.replaceState({}, document.title);
      
      // Open the modal with the provided assignment and classroom IDs
      openSubmissionModal(state.assignmentId, state.classroomId);
    }
  }, [location.state]);



  const toggleSelectAssignment = (assignmentId: string) => {
    setSelectedAssignments(prev => 
      prev.includes(assignmentId) 
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAssignments.length === filtered.length) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(filtered.map(a => String(a.id)));
    }
  };

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    if (action === 'delete') {
      if (selectedAssignments.length === 0) {
        toast.error('Please select assignments to delete');
        return;
      }
      setShowDeleteConfirm(true);
    }
    setSelectedAction('');
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    const ids = [...selectedAssignments];
    setSelectedAssignments([]);

    try {
      setLoading(true);
      for (const assignmentId of ids) {
        await deleteAssignment(assignmentId);
      }
      toast.success(`${ids.length} assignment(s) deleted successfully`);
      const res = await fetchAssignments();
      setAssignments(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to delete assignments', err);
      toast.error('Failed to delete assignments');
    } finally {
      setLoading(false);
    }
  };

  const openSubmissionModal = (assignmentId: string, classroomId?: string) => {
    setSelectedAssignmentId(assignmentId);
    setSelectedClassroomId(classroomId || null);
    setShowSubmissionModal(true);
  };

  const closeSubmissionModal = () => {
    setShowSubmissionModal(false);
    setSelectedAssignmentId(null);
    setSelectedClassroomId(null);
  };

  return (
    <div className="text-white px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">All Assignments</h1>
          <p className="text-gray-400 text-sm">Manage assignments across all your classrooms</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <div className="text-sm text-gray-400">Total Assignments</div>
          <div className="text-2xl font-bold mt-2">
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
            ) : (
              stats.total
            )}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <div className="text-sm text-gray-400">Open</div>
          <div className="text-2xl font-bold mt-2 text-emerald-400">
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
            ) : (
              stats.open
            )}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <div className="text-sm text-gray-400">{user?.role === 'STUDENT' ? 'Submitted' : 'Pending Review'}</div>
          <div className="text-2xl font-bold mt-2">
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
            ) : (
              stats.pending
            )}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <div className="text-sm text-gray-400">Due This Week</div>
          <div className="text-2xl font-bold mt-2 text-yellow-400">
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
            ) : (
              stats.dueThisWeek
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 p-4 rounded border border-gray-700 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assignments..."
              className="w-full bg-gray-800 text-white placeholder-gray-400 px-3 py-2 rounded border border-gray-700"
            />
          </div>
          <div className="w-56">
            <select
              value={classroomFilter}
              onChange={(e) => setClassroomFilter(e.target.value)}
              className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700"
            >
              <option value="ALL">All Classrooms</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      {user?.role === 'FACULTY' && selectedAssignments.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">{selectedAssignments.length}</span>
              </div>
              <div>
                <h3 className="text-white font-medium">
                  {selectedAssignments.length} assignment{selectedAssignments.length !== 1 ? 's' : ''} selected
                </h3>
                <p className="text-blue-300 text-sm">Choose an action to perform on selected items</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedAssignments([])}
                className="text-gray-400 hover:text-gray-300 text-sm px-3 py-1 rounded border border-gray-600 hover:border-gray-500 transition-colors"
              >
                Clear Selection
              </button>
              <select
                value={selectedAction}
                onChange={(e) => handleActionSelect(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white font-medium min-w-[140px] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              >
                <option value="">Select Action</option>
                <option value="delete">🗑️ Delete Selected</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded border border-gray-700 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              {user?.role === 'FACULTY' && (
                <th className="p-4 w-12">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedAssignments.length === filtered.length}
                      onChange={toggleSelectAll}
                      className="sr-only"
                    />
                    <span className="h-4 w-4 inline-block rounded border border-gray-600 bg-gray-700 flex items-center justify-center">
                      {filtered.length > 0 && selectedAssignments.length === filtered.length && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3 w-3 text-gray-100">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </label>
                </th>
              )}
              <th className="text-left p-4 text-sm text-gray-400">Assignment</th>
              <th className="text-left p-4 text-sm text-gray-400">Classroom</th>
              <th className="text-left p-4 text-sm text-gray-400">Deadline</th>
              {user?.role === 'FACULTY' && (
                <th className="text-left p-4 text-sm text-gray-400">Submissions</th>
              )}
              <th className="text-left p-4 text-sm text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={user?.role === 'FACULTY' ? 6 : 5} className="p-8 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                    <span>Loading assignments...</span>
                  </div>
                </td>
              </tr>
            )}
            {!loading && filtered.map((a) => {
              const submitted = (a as any)._count?.assignmentSubmissions ?? 0;
              const totalStudents = (a as any).classroom?._count?.virtualClassroomStudents ?? 0;
              const submissions = { submitted, total: totalStudents };
              const percent = submissions.total > 0 ? Math.round((submissions.submitted / submissions.total) * 100) : 0;
              const days = daysUntil((a as any).deadline ?? (a as any).dueDate);
              const deadlineNote = days === null ? '' : days < 0 ? 'Overdue' : `${days} days left`;
              const progressColor = percent >= 75 ? 'bg-emerald-400' : percent >= 40 ? 'bg-yellow-400' : 'bg-red-500';

              return (
                <tr 
                  key={a.id} 
                  className="border-t border-gray-800 hover:bg-gray-850 cursor-pointer"
                  onClick={() => {
                    const classroomId = (a as any)?.classroom?.id || (a as any)?.classroomId;
                    openSubmissionModal(String(a.id), classroomId);
                  }}
                >
                  {user?.role === 'FACULTY' && (
                    <td className="p-4 w-12" onClick={(e) => e.stopPropagation()}>
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAssignments.includes(String(a.id))}
                          onChange={() => toggleSelectAssignment(String(a.id))}
                          className="sr-only"
                        />
                        <span className="h-4 w-4 inline-block rounded border border-gray-600 bg-gray-700 flex items-center justify-center">
                          {selectedAssignments.includes(String(a.id)) && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3 w-3 text-gray-100">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                      </label>
                    </td>
                  )}
                  <td className="p-4 align-top">
                    <div className="font-medium">{a.title}</div>
                    <div className="text-sm text-gray-400">{(a.title + ' ').slice(0, 60)}</div>
                  </td>
                  <td className="p-4 align-top text-sm text-gray-300">{(a as any).classroom?.name ?? '—'}</td>
                  
                  <td className="p-4 align-top text-sm">
                    <div className="text-gray-300">{formatDate((a as any).deadline ?? (a as any).dueDate)}</div>
                    <div className="text-xs text-gray-400">{deadlineNote}</div>
                  </td>
                  {user?.role === 'FACULTY' && (
                    <td className="p-4 align-top text-sm w-48">
                      <div className="text-sm text-gray-300">{`${submissions.submitted}/${submissions.total}`}</div>
                      <div className="w-full bg-gray-800 h-2 rounded mt-2">
                        <div className={`h-2 rounded ${progressColor}`} style={{ width: `${percent}%` }} />
                      </div>
                    </td>
                  )}
                  <td className="p-4 align-top">
                    {user?.role === 'STUDENT' ? (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${submissionStatusClass(mySubmissionsMap[String(a.id)]?.status || (a as any).studentStatus)}`}>
                        {mySubmissionsMap[String(a.id)]?.status || (a as any).studentStatus || 'OPEN'}
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClass(calculateFacultyStatus(a))}`}>
                        {calculateFacultyStatus(a)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={user?.role === 'FACULTY' ? 6 : 5} className="p-8 text-center text-gray-400">No assignments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Submission Modal */}
      {showSubmissionModal && selectedAssignmentId && (
        <>
          {user?.role === 'FACULTY' ? (
            <ReviewSubmissions 
              assignmentId={selectedAssignmentId}
              open={showSubmissionModal}
              onClose={closeSubmissionModal}
              asPage={false}
            />
          ) : (
            <StudentAssignmentSubmissions
              assignmentId={selectedAssignmentId}
              classroomId={selectedClassroomId}
              open={showSubmissionModal}
              onClose={closeSubmissionModal}
              asPage={false}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20 backdrop-blur-sm">
          <div className="bg-gray-900/95 border border-gray-700/60 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete {selectedAssignments.length} assignment(s)? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
