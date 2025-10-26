import React, { useEffect, useMemo, useState } from 'react';
import api, { fetchAssignments, deleteAssignment } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';

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

const statusBadgeClass = (status: Assignment['status']) => {
  const s = normalizeStatus(status);
  switch (s) {
    case 'SUBMITTED':
      return 'bg-green-600 text-white';
    case 'CLOSED':
      return 'bg-gray-600 text-white';
    case 'OPEN':
    case 'PENDING':
      return 'bg-teal-600 text-white';
    default:
      return 'bg-yellow-600 text-white';
  }
};

const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [mySubmissionsMap, setMySubmissionsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [classroomFilter, setClassroomFilter] = useState<string>('ALL');
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();


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
    let submitted = 0;

    if (user?.role === 'STUDENT') {
      for (const a of list) {
        const myStatusRaw = mySubmissionsMap[String(a.id)]?.status || (a as any).studentStatus || a.status;
        const myStatus = String(myStatusRaw || '').toUpperCase();
        if (myStatus === 'SUBMITTED' || myStatus === 'ACCEPTED') submitted++;
        else open++;
      }
    } else {
      open = list.filter((a) => {
        const s = normalizeStatus(a.status as any);
        return s === 'OPEN' || s === 'PENDING';
      }).length;
      submitted = list.filter((a: any) => (a?._count?.assignmentSubmissions || 0) > 0).length;
    }

    const dueThisWeek = list.filter((a) => {
      const d = daysUntil((a as any).deadline ?? (a as any).dueDate);
      return d !== null && d >= 0 && d <= 7;
    }).length;

    return { total, open, submitted, dueThisWeek };
  }, [filtered, mySubmissionsMap, user?.role]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAssignments();
        if (!mounted) return;
        setAssignments(Array.isArray(res) ? res : []);
      } catch (err: any) {
        console.error('Failed to load assignments', err);
        if (!mounted) return;
        setError(err?.message || 'Failed to load assignments');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleDelete = async (id: string | number) => {
    try {
      setLoading(true);
      await deleteAssignment(String(id));
      toast.success('Assignment deleted');
      const res = await fetchAssignments();
      setAssignments(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to delete assignment', err);
      toast.error('Failed to delete assignment');
    } finally {
      setLoading(false);
    }
  };

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const requestDelete = (id: string | number) => {
    if (user?.role !== 'FACULTY') {
      try { toast.error('Only faculty can delete assignments'); } catch {}
      return;
    }
    const sid = String(id);
    setPendingDeleteId(sid);
    try {
      toast({ title: 'Confirm delete', description: 'Click Confirm in the row to permanently delete this assignment' });
    } catch (e) {
      toast.success('Click Confirm to permanently delete this assignment');
    }
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  try { toast({ title: 'Delete cancelled' }); } catch (e) { toast.error('Delete cancelled'); }
  };

  const confirmDelete = async (id: string | number) => {
    if (user?.role !== 'FACULTY') {
      try { toast.error('Only faculty can delete assignments'); } catch {}
      return;
    }
    setLoading(true);
    try {
      await deleteAssignment(String(id));
      toast.success('Assignment deleted');
      const res = await fetchAssignments();
      setAssignments(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to delete assignment', err);
      toast.error('Failed to delete assignment');
    } finally {
      setLoading(false);
      setPendingDeleteId(null);
    }
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
          <div className="text-2xl font-bold mt-2">{stats.total}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <div className="text-sm text-gray-400">Open</div>
          <div className="text-2xl font-bold mt-2 text-emerald-400">{stats.open}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <div className="text-sm text-gray-400">Submitted</div>
          <div className="text-2xl font-bold mt-2">{stats.submitted}</div>
        </div>
        <div className="bg-gray-800 p-4 rounded border border-gray-700">
          <div className="text-sm text-gray-400">Due This Week</div>
          <div className="text-2xl font-bold mt-2 text-yellow-400">{stats.dueThisWeek}</div>
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

      <div className="bg-gray-900 rounded border border-gray-700 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="text-left p-4 text-sm text-gray-400">Assignment</th>
              <th className="text-left p-4 text-sm text-gray-400">Classroom</th>
              <th className="text-left p-4 text-sm text-gray-400">Deadline</th>
              {user?.role === 'FACULTY' && (
                <th className="text-left p-4 text-sm text-gray-400">Submissions</th>
              )}
              <th className="text-left p-4 text-sm text-gray-400">Status</th>
              {(user?.role === 'FACULTY' || user?.role === 'STUDENT') && (
                <th className="text-left p-4 text-sm text-gray-400">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={user?.role === 'FACULTY' ? 6 : 5} className="p-8 text-center text-gray-400">Loading...</td>
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
                <tr key={a.id} className="border-t border-gray-800 hover:bg-gray-850">
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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClass(a.status)}`}>
                        {a.status}
                      </span>
                    )}
                  </td>
                  {(user?.role === 'FACULTY' || user?.role === 'STUDENT') && (
                    <td className="p-4 align-top text-sm">
                      <div className="flex items-center gap-2">
                        {user?.role === 'FACULTY' ? (
                          <>
                            <button 
                              onClick={() => navigate(`/dashboard/assignments/${a.id}/submissions`)} 
                              className="text-blue-400 hover:text-blue-300"
                            >
                              View
                            </button>
                            {pendingDeleteId === String(a.id) ? (
                              <>
                                <button onClick={() => confirmDelete(a.id)} className="text-red-400 hover:text-red-300">Confirm</button>
                                <button onClick={cancelDelete} className="text-gray-300 hover:text-gray-200">Cancel</button>
                              </>
                            ) : (
                              <button onClick={() => requestDelete(a.id)} className="text-red-400 hover:text-red-300">Delete</button>
                            )}
                          </>
                        ) : (
                          <button 
                            onClick={() => {
                              const classroomId = (a as any)?.classroom?.id || (a as any)?.classroomId;
                              if (classroomId) {
                                navigate(`/dashboard/classrooms/${classroomId}/assignments/${a.id}/submissions`);
                              } else {
                                navigate(`/dashboard/assignments/${a.id}/submissions`);
                              }
                            }} 
                            className="text-blue-400 hover:text-blue-300"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </td>
                  )}
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
    </div>
  );
};

export default AssignmentsPage;
