
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import ClassroomTabs from "../components/classroom/Tabs/ClassroomTabs";
import UnitsTab from "../components/classroom/Tabs/UnitsTab";
import ThreadsTab from "../components/classroom/Tabs/ThreadsTab";
import AssignmentsTab from "../components/classroom/Tabs/AssignmentsTab";
import StudentsTab from "../components/classroom/Tabs/StudentsTab";
import AttendanceTab from "../components/classroom/Tabs/AttendanceTab";

const ClassroomDetailPage = () => {
  const { id } = useParams();
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Units");

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/api/v1/classroom/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClassroom(response.data);
      } catch (error) {
        console.error("Error fetching classroom:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchClassroom();
  }, [id]);

  const renderTab = () => {
    switch (activeTab) {
      case "Units":
        return <UnitsTab classroomId={id!} />;
      case "Threads":
        return <ThreadsTab classroomId={id!} />;
      case "Assignments":
        return <AssignmentsTab classroomId={id!} />;
      case "Students":
        return <StudentsTab classroomId={id!} />;
      case "Attendance":
        return <AttendanceTab classroomId={id!} />;
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
    <div className="px-3 py-4 sm:px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white break-words">
          {classroom.name} {classroom.section?.name && `(${classroom.section.name})`}
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          {classroom.faculty?.specialization ? (
            <>Faculty: {classroom.faculty.specialization}</>
          ) : (
            "No faculty assigned"
          )}
        </p>
      </div>

      <ClassroomTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="mt-4 sm:mt-6">{renderTab()}</div>
    </div>
  );
};

export default ClassroomDetailPage;