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
    return <p className="text-gray-400">Loading classroom details...</p>;
  }

  if (!classroom) {
    return <p className="text-red-500">Failed to load classroom data.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-white">
        {classroom.name} ({classroom.section?.name})
      </h1>
      <p className="text-gray-400">
        Faculty: {classroom.faculty?.specialization}
      </p>
      <ClassroomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderTab()}
    </div>
  );
};

export default ClassroomDetailPage;
