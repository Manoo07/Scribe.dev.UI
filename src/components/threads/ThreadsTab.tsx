import React, { useMemo } from "react";
import ThreadsManager from "./ThreadManager";

interface ThreadsTabProps {
  // classroomId is optional here: when not provided we should render global threads
  classroomId?: string;
  classroomName?: string;
  units?: Array<{ id: string; name: string }>;
}

const ThreadsTab: React.FC<ThreadsTabProps> = ({
  classroomId,
  classroomName = "Classroom",
  units = [],
}) => {
  // If a classroomId is provided we operate in classroom context, otherwise global
  const isClassroomContext = Boolean(classroomId);

  // Prepare classroom data for the ThreadsManager with useMemo to prevent unnecessary re-renders
  const classroomData = useMemo(() => {
    if (!isClassroomContext) return undefined;
    return {
      id: classroomId as string,
      name: classroomName,
      units: units,
    };
  }, [isClassroomContext, classroomId, classroomName, units]);

  return (
    <ThreadsManager
      context={isClassroomContext ? "classroom" : "global"}
      classroomData={classroomData}
    />
  );
};

export default ThreadsTab;
