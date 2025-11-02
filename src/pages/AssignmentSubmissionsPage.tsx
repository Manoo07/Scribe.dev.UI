import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AssignmentSubmissionsPage: React.FC = () => {
  const { id: classroomId, assignmentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to assignments page with modal trigger
    if (assignmentId) {
      if (classroomId) {
        // Redirect to classroom assignments page and let it handle the modal
        navigate(`/dashboard/classrooms/${classroomId}/assignments`, { 
          replace: true,
          state: { 
            openSubmissionModal: true, 
            assignmentId: assignmentId,
            classroomId: classroomId
          }
        });
      } else {
        // Redirect to general assignments page and let it handle the modal
        navigate('/dashboard/assignments', { 
          replace: true,
          state: { 
            openSubmissionModal: true, 
            assignmentId: assignmentId
          }
        });
      }
    } else {
      // No assignment ID, just redirect to assignments
      if (classroomId) {
        navigate(`/dashboard/classrooms/${classroomId}/assignments`, { replace: true });
      } else {
        navigate('/dashboard/assignments', { replace: true });
      }
    }
  }, [assignmentId, classroomId, navigate]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-gray-400">Redirecting...</div>
    </div>
  );
};

export default AssignmentSubmissionsPage;
