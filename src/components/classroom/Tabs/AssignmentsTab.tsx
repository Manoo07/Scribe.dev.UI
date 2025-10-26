import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Eye, Edit, Trash2, FileText, Link, Link2 } from 'lucide-react';
import { marked } from 'marked';
import CreateAssignmentModal from '../../assignments/CreateAssignmentModal';
import { useToast } from '../../../hooks/use-toast';

const AssignmentsTab = ({ classroomId }: { classroomId: string }) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const navigate = useNavigate();
  const [previewingContent, setPreviewingContent] = useState<string | null>(null);

  const [mySubmissionsMap, setMySubmissionsMap] = useState<Record<string, any>>({});
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const isFaculty = user?.role === 'FACULTY';

  const statusClass = (status: string | undefined) => {
    switch ((status || '').toUpperCase()) {
      case 'SUBMITTED': return 'bg-sky-600';
      case 'PENDING': return 'bg-gray-600';
      case 'OVERDUE': return 'bg-orange-600';
      case 'ACCEPTED': return 'bg-green-600';
      case 'REJECTED': return 'bg-red-600';
      default: return 'bg-gray-700';
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments');
      const data = res.data || [];
      const cls = classroomId ? data.filter((d: any) => String(d.classroomId) === String(classroomId)) : data;
      setAssignments(cls || []);
      
      if (user?.role === 'STUDENT') {
        try {
          const submissionsRes = await api.get('/assignments/my');
          const arr = submissionsRes.data || [];
          const map: Record<string, any> = {};
          arr.forEach((s: any) => { if (s.assignmentId) map[s.assignmentId] = s; });
          setMySubmissionsMap(map);
        } catch (err) { 
          console.error('Failed to load student submissions', err); 
        }
      }
    } catch (err) {
      console.error('Failed to load assignments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [classroomId]);

  const handleCreate = async () => {
    setShowCreate(false);
    await load();
  };

  const handleEdit = async (payload: any) => {
    await api.put(`/assignments/${editingAssignment.id}`, payload);
    await load();
    setEditingAssignment(null);
  };

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
    toast({
      title: 'Confirm deletion',
      description: 'Click Confirm in the assignment row to permanently delete this assignment'
    });
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
    toast({
      title: 'Delete cancelled'
    });
  };

  const confirmDelete = async (id: string) => {
    try {
      await api.delete(`/assignments/${id}`);
      toast.success('Assignment deleted successfully');
      await load();
    } catch (err) {
      console.error('Failed to delete assignment', err);
      toast.error('Failed to delete assignment');
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Assignments</h2>
        {isFaculty && (
          <button
            onClick={() => setShowCreate(true)}
            className={`bg-indigo-600 px-3 py-1 rounded text-sm hover:bg-indigo-500`}
            title={'Create Assignment'}
          >
            + Create Assignment
          </button>
        )}
      </div>

      <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Description</th>
              <th className="p-2">Deadline</th>
              <th className="p-2">Status</th>
              <th className="p-2">Content Type</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-400">Loading...</td></tr>
            )}
            {!loading && assignments.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-400">No assignments found.</td></tr>
            )}

            {!loading && assignments.map(a => {
              const studentStatus = mySubmissionsMap[a.id]?.status || a.studentStatus || 'OPEN';
              return (
              <tr key={a.id} className="border-b border-gray-700">
                <td className="p-2 text-white">{a.title}</td>
                <td className="p-2">
                  <span className="max-w-[200px] truncate">
                    {a.description || 'No description'}
                  </span>
                </td>
                <td className="p-2">{a.deadline ? new Date(a.deadline).toLocaleDateString() : '-'}</td>
                <td className="p-2">
                  {user?.role === 'STUDENT' ? (
                    <span className={`px-2 py-1 ${statusClass(mySubmissionsMap[a.id]?.status || a.studentStatus)} text-white text-xs rounded`}>
                      {mySubmissionsMap[a.id]?.status || a.studentStatus || 'OPEN'}
                    </span>
                  ) : (
                    <span className={`px-2 py-1 ${statusClass(a.status)} text-white text-xs rounded`}>
                      {a.status || 'OPEN'}
                    </span>
                  )}
                </td>
                <td className="p-2">
                  {a.content === 'QUESTION_FILE' && a.questionFileUrl ? (
                    <a href={a.questionFileUrl} className="text-blue-400 hover:underline flex items-center gap-2" target="_blank" rel="noreferrer">
                      <Link2 size={16} />
                      <span>Question File</span>
                    </a>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-gray-400">
                          <FileText size={16} />
                          <span>Note</span>
                        </div>
                        {a.noteContent && (
                          <button
                            onClick={() => setPreviewingContent(previewingContent === a.id ? null : a.id)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Preview markdown"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                      </div>
                      {previewingContent === a.id && a.noteContent && (
                        <div className="mt-2 p-2 bg-gray-700 rounded border border-gray-600 max-h-32 overflow-y-auto">
                          <div
                            className="prose prose-invert prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: marked(a.noteContent)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    {user?.role === 'STUDENT' && (
                      <>
                        <button 
                          onClick={() => navigate(`/dashboard/classrooms/${classroomId}/assignments/${a.id}/submissions`)}
                          className="text-blue-400 p-1 hover:text-blue-300" 
                          title="View submissions"
                        >
                          View
                        </button>
                        {mySubmissionsMap[a.id] ? (
                          (() => {
                            const submissionStatus = (mySubmissionsMap[a.id]?.status || '').toUpperCase();
                            const deadline = new Date(a.deadline);
                            const now = new Date();
                            const isBeforeDeadline = deadline > now;
                            const isRejected = submissionStatus === 'REJECTED';
                            
                            if (isRejected && isBeforeDeadline) {
                              return (
                                <button 
                                  onClick={() => navigate(`/dashboard/classrooms/${classroomId}/assignments/${a.id}/submissions`)}
                                  className="text-orange-400 p-1 hover:text-orange-300" 
                                  title="Resubmit assignment"
                                >
                                  Resubmit
                                </button>
                              );
                            }
                            return (
                              <button 
                                onClick={() => navigate(`/dashboard/classrooms/${classroomId}/assignments/${a.id}/submissions`)}
                                className="text-yellow-400 p-1 hover:text-yellow-300" 
                                title="Edit my submission"
                              >
                                Edit
                              </button>
                            );
                          })()
                        ) : (
                          studentStatus === 'OPEN' && (
                            <button onClick={() => navigate(`/dashboard/classrooms/${classroomId}/assignments/${a.id}/submissions`)} className="text-green-400 p-1 hover:text-green-300" title="Submit assignment">
                              Submit
                            </button>
                          )
                        )}
                      </>
                    )}
                    {isFaculty && (
                      <>
                        <button
                          onClick={() => setEditingAssignment(a)}
                          className={`text-yellow-400 p-1 hover:text-yellow-300`}
                          title={'Edit assignment'}
                        >
                          <Edit size={16} />
                        </button>
                        {pendingDeleteId === a.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => confirmDelete(a.id)}
                              className="text-red-400 hover:text-red-300 px-2 py-1 text-xs bg-red-900/20 rounded"
                              title="Confirm delete"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="text-gray-400 hover:text-gray-300 px-2 py-1 text-xs bg-gray-700 rounded"
                              title="Cancel delete"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => requestDelete(a.id)}
                            className={`text-red-400 p-1 hover:text-red-300`}
                            title={'Delete assignment'}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>

      <CreateAssignmentModal 
        open={showCreate} 
        onClose={() => setShowCreate(false)} 
        onCreate={async () => { await load(); }} 
        classroomId={classroomId} 
      />

      {editingAssignment && (
        <CreateAssignmentModal 
          open={true} 
          onClose={() => setEditingAssignment(null)} 
          onCreate={async () => { await load(); }} 
          classroomId={classroomId}
          initialData={editingAssignment}
        />
      )}

    </div>
  );
};

export default AssignmentsTab;
