import React, { useEffect, useState } from "react";
import FacultyAttendanceView from "./FacultyAttendanceView";
import StudentAttendanceView from "./StudentAttendanceView";
import { UserRole } from "../../types/attendance";

const AttendanceDashboard: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role") as UserRole;

    if (!role) {
      localStorage.setItem("role", "STUDENT");
      setUserRole("STUDENT");
    } else {
      setUserRole(role);
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Page header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-white">
            Attendance Dashboard
          </h1>

          {/* Demo role selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 whitespace-nowrap">
              Demo Mode:
            </span>
            <select
              value={userRole || "STUDENT"}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                localStorage.setItem("role", newRole);
                setUserRole(newRole);
              }}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="STUDENT">Student View</option>
              <option value="FACULTY">Faculty View</option>
              <option value="ADMIN">Admin View</option>
            </select>
          </div>
        </div>
      </header>

      {/* Conditional content */}
      <main className="flex-grow overflow-auto p-4 sm:p-6 md:p-8">
        {userRole === "FACULTY" || userRole === "ADMIN" ? (
          <FacultyAttendanceView facultyId="fac-001" />
        ) : (
          <StudentAttendanceView studentId="std-001" />
        )}
      </main>
    </div>
  );
};

export default AttendanceDashboard;
