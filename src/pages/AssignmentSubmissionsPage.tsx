import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewSubmissions from '../components/assignments/ReviewSubmissions';
import StudentAssignmentSubmissions from '../components/assignments/StudentAssignmentSubmissions';
import { useAuth } from '../context/AuthContext';

const AssignmentSubmissionsPage: React.FC = () => {
  const { id: classroomId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClose = () => {
    if (classroomId) navigate(`/dashboard/classrooms/${classroomId}/assignments`);
    else navigate('/dashboard/assignments');
  };

  if (!assignmentId) return <div className="p-6 text-gray-400">No assignment selected</div>;

  return (
    <div className="px-3 py-6 max-w-6xl mx-auto">
      {user?.role === 'FACULTY' ? (
        <ReviewSubmissions assignmentId={assignmentId} open={true} onClose={handleClose} asPage={true} />
      ) : (
        <StudentAssignmentSubmissions
          assignmentId={assignmentId}
          classroomId={classroomId}
          open={true}
          onClose={handleClose}
          asPage={true}
        />
      )}
    </div>
  );
};

export default AssignmentSubmissionsPage;
