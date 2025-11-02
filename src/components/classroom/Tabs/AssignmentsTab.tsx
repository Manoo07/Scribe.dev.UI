import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import ReviewSubmissions from '../../assignments/ReviewSubmissions';
import StudentAssignmentSubmissions from '../../assignments/StudentAssignmentSubmissions';
import { Eye, Edit, Trash2, FileText, Link, Link2, Loader2, Download } from 'lucide-react';
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
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [previewAssignment, setPreviewAssignment] = useState<any>(null);
  
  // Submission modal state
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const { user } = useAuth();
  const location = useLocation();
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

  // Handle automatic modal opening from navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state?.openSubmissionModal && state?.assignmentId) {
      // Clear the navigation state to prevent reopening on page refresh
      window.history.replaceState({}, document.title);
      
      // Open the modal with the provided assignment ID
      openSubmissionModal(state.assignmentId);
    }
  }, [location.state]);

  const handleCreate = async () => {
    setShowCreate(false);
    await load();
  };

  const handleEdit = async (payload: any) => {
    await api.put(`/assignments/${editingAssignment.id}`, payload);
    await load();
    setEditingAssignment(null);
  };

  const toggleSelectAssignment = (assignmentId: string) => {
    setSelectedAssignments(prev => 
      prev.includes(assignmentId) 
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAssignments.length === assignments.length) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(assignments.map(a => a.id));
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

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    const ids = [...selectedAssignments];
    setSelectedAssignments([]);

    (async () => {
      try {
        for (const assignmentId of ids) {
          await api.delete(`/assignments/${assignmentId}`);
        }
        toast.success(`${ids.length} assignment(s) deleted successfully`);
        await load();
      } catch (err) {
        console.error('Failed to delete assignments', err);
        toast.error('Failed to delete assignments');
      }
    })();
  };

  const openSubmissionModal = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setShowSubmissionModal(true);
  };

  const closeSubmissionModal = () => {
    setShowSubmissionModal(false);
    setSelectedAssignmentId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Assignments</h2>
        <div className="flex items-center gap-2">
          {isFaculty && selectedAssignments.length > 0 && (
            <select
              value={selectedAction}
              onChange={(e) => handleActionSelect(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
            >
              <option value="">Actions</option>
              <option value="delete">Delete</option>
            </select>
          )}
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
      </div>

      <div className="bg-gray-800 rounded border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-900">
            <tr>
              {isFaculty && (
                <th className="p-2 w-12">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={assignments.length > 0 && selectedAssignments.length === assignments.length}
                      onChange={toggleSelectAll}
                      className="sr-only"
                    />
                    <span className="h-4 w-4 inline-block rounded border border-gray-600 bg-gray-700 flex items-center justify-center">
                      {assignments.length > 0 && selectedAssignments.length === assignments.length && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3 w-3 text-gray-100">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </label>
                </th>
              )}
              <th className="p-2">Title</th>
              <th className="p-2">Description</th>
              <th className="p-2">Deadline</th>
              <th className="p-2">Status</th>
              <th className="p-2">Content Type</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={isFaculty ? 6 : 5} className="p-4 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            )}
            {!loading && assignments.length === 0 && (
              <tr><td colSpan={isFaculty ? 6 : 5} className="p-4 text-center text-gray-400">No assignments found.</td></tr>
            )}

            {!loading && assignments.map(a => {
              const studentStatus = mySubmissionsMap[a.id]?.status || a.studentStatus || 'OPEN';
              return (
              <tr 
                key={a.id} 
                className="border-b border-gray-700 hover:bg-gray-750 cursor-pointer"
                onClick={() => openSubmissionModal(a.id)}
              >
                {isFaculty && (
                  <td className="p-2 w-12" onClick={(e) => e.stopPropagation()}>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAssignments.includes(a.id)}
                        onChange={() => toggleSelectAssignment(a.id)}
                        className="sr-only"
                      />
                      <span className={`h-4 w-4 inline-block rounded border border-gray-600 bg-gray-700 flex items-center justify-center`}>
                        {selectedAssignments.includes(a.id) && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-3 w-3 text-gray-100">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    </label>
                  </td>
                )}
                <td className="p-2 text-white">
                  <div className="flex items-center gap-2">
                    <span>{a.title}</span>
                    {isFaculty && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingAssignment(a);
                        }}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit assignment"
                      >
                        <Edit size={14} />
                      </button>
                    )}
                  </div>
                </td>
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewAssignment(a);
                      }}
                      className="text-blue-400 hover:underline flex items-center gap-2"
                    >
                      <Link2 size={16} />
                      <span>Question File</span>
                    </button>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-gray-400">
                          <FileText size={16} />
                          <span>Note</span>
                        </div>
                        {a.noteContent && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewAssignment(a);
                            }}
                            className="text-blue-400 hover:text-blue-300"
                            title="Preview assignment"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
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

      {/* Assignment Preview Modal */}
      {previewAssignment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-20 backdrop-blur-sm">
          <div className="bg-gray-900/95 border border-gray-700/60 rounded-lg max-w-2xl mx-4 w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-700/60">
              <h3 className="text-lg font-semibold text-white">Assignment Details</h3>
              <button
                onClick={() => setPreviewAssignment(null)}
                className="text-gray-400 hover:text-white"
              >
                X
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Title</label>
                <p className="text-white">{previewAssignment.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300">Description</label>
                <p className="text-gray-200">{previewAssignment.description || 'No description'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Deadline</label>
                  <p className="text-gray-200">
                    {previewAssignment.deadline ? new Date(previewAssignment.deadline).toLocaleDateString() : '-'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <div className="mt-1">
                    {user?.role === 'STUDENT' ? (
                      <span className={`px-2 py-1 ${statusClass(mySubmissionsMap[previewAssignment.id]?.status || previewAssignment.studentStatus)} text-white text-xs rounded`}>
                        {mySubmissionsMap[previewAssignment.id]?.status || previewAssignment.studentStatus || 'OPEN'}
                      </span>
                    ) : (
                      <span className={`px-2 py-1 ${statusClass(previewAssignment.status)} text-white text-xs rounded`}>
                        {previewAssignment.status || 'OPEN'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300">Content Type</label>
                <div className="mt-2">
                  {previewAssignment.content === 'QUESTION_FILE' && previewAssignment.questionFileUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Link2 size={16} className="text-blue-400" />
                        <span className="text-gray-200">Question File</span>
                        <a
                          href={previewAssignment.questionFileUrl}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 inline-flex items-center gap-2"
                          target="_blank"
                          rel="noreferrer"
                          download
                          aria-label="Download assignment file"
                        >
                          <Download size={16} />
                          <span className="sr-only">Download</span>
                        </a>
                      </div>
                      {/* Image Preview */}
                      {previewAssignment.questionFileUrl && (
                        previewAssignment.questionFileUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                          <div className="mt-3">
                            <img 
                              src={previewAssignment.questionFileUrl} 
                              alt="Question file preview"
                              className="max-w-full h-auto rounded border border-gray-600 bg-gray-800"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="mt-3 p-4 bg-gray-800 border border-gray-600 rounded text-center text-gray-400">
                            <FileText size={24} className="mx-auto mb-2" />
                            <p className="text-sm">File preview not available</p>
                            <p className="text-xs">Use the download button to view the file</p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      <span className="text-gray-200">Note</span>
                    </div>
                  )}
                </div>
              </div>
              
              {previewAssignment.noteContent && (
                <div>
                  <label className="text-sm font-medium text-gray-300">Content</label>
                  <div className="mt-2 p-3 bg-gray-800 rounded border border-gray-600 max-h-48 overflow-y-auto">
                    <div
                      className="prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: marked(previewAssignment.noteContent)
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end p-6 pt-4 border-t border-gray-700/60">
              <button
                onClick={() => setPreviewAssignment(null)}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
              classroomId={classroomId}
              open={showSubmissionModal}
              onClose={closeSubmissionModal}
              asPage={false}
            />
          )}
        </>
      )}

    </div>
  );
};

export default AssignmentsTab;
