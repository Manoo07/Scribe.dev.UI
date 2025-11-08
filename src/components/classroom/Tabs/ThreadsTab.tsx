import React from "react";
import ThreadsManager from "../../threads/ThreadManager";
import { TabContainer } from "../shared";

interface ThreadsTabProps {
  classroomId: string;
  classroomName?: string;
  units?: Array<{ id: string; name: string }>;
}

const ThreadsTab: React.FC<ThreadsTabProps> = ({
  classroomId,
  classroomName = "Classroom",
  units = [],
}) => {
  // Prepare classroom data for the ThreadsManager
  const classroomData = {
    id: classroomId,
    name: classroomName,
    units: units,
  };

  console.log("Threads Tab Units ", units);

  return (
    <TabContainer title="Threads" subtitle={classroomName}>
      <ThreadsManager context="classroom" classroomData={classroomData} />
    </TabContainer>
  );
};

export default ThreadsTab;
