import React from 'react';
import { useParams } from 'react-router-dom';
import AssignmentsTab from '../components/classroom/Tabs/AssignmentsTab';

const ClassroomAssignmentsPage: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="px-3 py-4 sm:px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
      {id ? <AssignmentsTab classroomId={id} /> : <div className="text-gray-400">No classroom selected</div>}
    </div>
  );
};

export default ClassroomAssignmentsPage;
