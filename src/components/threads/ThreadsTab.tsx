import React, { useMemo } from "react";
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
  // Prepare classroom data for the ThreadsManager with useMemo to prevent unnecessary re-renders
  const classroomData = useMemo(
    () => ({
      id: classroomId,
      name: classroomName,
      units: units,
    }),
    [classroomId, classroomName, units]
  );

  return <ThreadsManager context="classroom" classroomData={classroomData} />;
};

export default ThreadsTab;
