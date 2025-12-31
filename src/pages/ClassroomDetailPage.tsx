import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import AssignmentsTab from "../components/classroom/Tabs/AssignmentsTab";
import { useUserContext } from "../context/UserContext";
import AttendanceTab from "../components/classroom/Tabs/AttendanceTab";
import ClassroomTabs from "../components/classroom/Tabs/ClassroomTabs";
import StudentsTab from "../components/classroom/Tabs/StudentsTab";
import ThreadsTab from "../components/classroom/Tabs/ThreadsTab";
import UnitsTab from "../components/classroom/Tabs/UnitsTab";
import {
  useClassroomQuery,
  useClassroomUnitsQuery,
} from "../hooks/classroom/useClassroomQueries";

const ClassroomDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Units");
  const { userRole } = useUserContext();

  // TanStack Query hooks - automatic fetching, caching, and loading states
  const { data: classroom, isLoading: loading } = useClassroomQuery(id);
  const {
    data: units = [],
    isLoading: unitsLoading,
    refetch: refetchUnits,
  } = useClassroomUnitsQuery(id);

  // Memoize the units array to prevent unnecessary re-renders
  const memoizedUnits = useMemo(
    () => units.map((unit: any) => ({ id: unit.id, name: unit.name })),
    [units]
  );

  const handleUnitsRefresh = () => {
    refetchUnits();
  };

  // Helper function to safely render section/faculty values
  const renderValue = (value: any, key?: string): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value[key || "name"] || value.name || value.specialization || "";
    }
    return "";
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Units":
        return (
          <UnitsTab
            classroomId={id!}
            units={units}
            setUnits={() => {}} // No-op since TanStack Query manages state
            loading={unitsLoading}
            onUnitsRefresh={handleUnitsRefresh}
            userRole={userRole}
          />
        );
      case "Threads":
        return (
          <ThreadsTab
            classroomId={id!}
            classroomName={classroom?.name}
            units={memoizedUnits}
          />
        );
      case "Assignments":
        return (
          <AssignmentsTab classroomId={id!} classroomName={classroom?.name} />
        );
      case "Students":
        return <StudentsTab classroomId={id!} />;
      case "Attendance":
        return (
          <AttendanceTab classroomId={id!} userRole="faculty" userId="1" />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="p-4 text-gray-400 animate-pulse">
          Loading classroom details...
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="p-4 text-red-500 bg-gray-800 rounded-lg border border-red-700">
          Failed to load classroom data.
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 sm:px-4 md:px-5 lg:px-6 max-w-7xl mx-auto">
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white break-words">
          {classroom.name}{" "}
          {renderValue(classroom.section, "name") &&
            `(${renderValue(classroom.section, "name")})`}
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          {renderValue(classroom.faculty, "specialization") ? (
            <>Faculty: {renderValue(classroom.faculty, "specialization")}</>
          ) : (
            "No faculty assigned"
          )}
        </p>
      </div>

      <ClassroomTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-4">{renderTab()}</div>
    </div>
  );
};

export default ClassroomDetailPage;
