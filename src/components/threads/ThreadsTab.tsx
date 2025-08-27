import React from "react";
import ThreadsManager from "./ThreadManager";

interface ThreadsTabProps {
  classroomId: string;
  classroomName?: string;
  units: Array<{ id: string; name: string }>;
}

const ThreadsTab: React.FC<ThreadsTabProps> = ({
  classroomId,
  classroomName = "Classroom",
  units,
}) => {
  // Prepare classroom data for the ThreadsManager
  const classroomData = {
    id: classroomId,
    name: classroomName,
    units: units,
  };

  return <ThreadsManager context="classroom" classroomData={classroomData} />;
};

export default ThreadsTab;
