import React, { useState, useEffect } from "react";
import {
  getFacultyClassrooms,
  getClassroomDetailedAttendance,
} from "../../services/mockData";
import {
  ClassroomAttendance,
  ClassroomDetailedAttendance,
} from "../../types/attendance";
import ClassroomAttendanceStats from "./ClassroomAttendanceStats";
import { Calendar, Users, Clock, Award, AlertTriangle } from "lucide-react";
import AttendanceStatusBadge from "./AttendanceStatusBadge";

interface FacultyAttendanceViewProps {
  facultyId: string;
}

const FacultyAttendanceView: React.FC<FacultyAttendanceViewProps> = ({
  facultyId,
}) => {
  const [classrooms, setClassrooms] = useState<ClassroomAttendance[]>([]);
  const [selectedClassroom, setSelectedClassroom] =
    useState<ClassroomDetailedAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const facultyClassrooms = getFacultyClassrooms(facultyId);
    setClassrooms(facultyClassrooms);
    setIsLoading(false);
  }, [facultyId]);

  const handleClassroomSelect = (classroomId: string) => {
    setIsLoading(true);
    const detailedAttendance = getClassroomDetailedAttendance(classroomId);
    setSelectedClassroom(detailedAttendance);
    setIsLoading(false);
  };

  const handleBackToList = () => {
    setSelectedClassroom(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (selectedClassroom) {
    return (
      <ClassroomAttendanceStats
        classroom={selectedClassroom}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="h-full px-4 py-6 dark:bg-gray-900 transition-colors duration-300">
      <div className="grid grid-cols-1 gap-8">
        {/* Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Faculty Attendance Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <SummaryCard
                icon={<Calendar className="h-6 w-6 text-blue-600" />}
                title="Total Classes"
                value={classrooms.length}
                bg="blue"
              />
              <SummaryCard
                icon={<Users className="h-6 w-6 text-teal-600" />}
                title="Total Students"
                value={classrooms.reduce(
                  (sum, c) => sum + c.classroom.studentCount,
                  0
                )}
                bg="teal"
              />
              <SummaryCard
                icon={<Award className="h-6 w-6 text-green-600" />}
                title="Avg. Attendance"
                value={`${Math.round(
                  classrooms.reduce(
                    (sum, c) => sum + c.summary.presentPercentage,
                    0
                  ) / (classrooms.length || 1)
                )}%`}
                bg="green"
              />
              <SummaryCard
                icon={<AlertTriangle className="h-6 w-6 text-amber-600" />}
                title="Attention Needed"
                value={
                  classrooms.filter((c) => c.summary.presentPercentage < 70)
                    .length
                }
                bg="amber"
              />
            </div>
          </div>
        </div>

        {/* Classrooms */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Your Classrooms
            </h2>

            {classrooms.length === 0 ? (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                No classrooms found. Create a classroom to get started.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classrooms.map((classroom) => (
                  <div
                    key={classroom.classroom.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white dark:bg-gray-800"
                    onClick={() =>
                      handleClassroomSelect(classroom.classroom.id)
                    }
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            {classroom.classroom.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {classroom.classroom.code} •{" "}
                            {classroom.classroom.semester}
                          </p>
                        </div>
                        <AttendanceStatusBadge
                          percentage={classroom.summary.presentPercentage}
                          size="large"
                        />
                      </div>

                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{classroom.classroom.schedule}</span>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                          <Users className="h-4 w-4 mr-2" />
                          <span>
                            {classroom.classroom.studentCount} students
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-teal-600 dark:text-teal-400">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{classroom.summary.total} sessions</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1 text-gray-600 dark:text-gray-400">
                          <span>Attendance Rate</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {classroom.summary.presentPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressBarColor(
                              classroom.summary.presentPercentage
                            )}`}
                            style={{
                              width: `${classroom.summary.presentPercentage}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Recent Classes
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {classroom.recentDates?.map((date) => (
                            <div
                              key={date}
                              className="px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs rounded"
                            >
                              {formatDate(date)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3 border-t border-gray-200 dark:border-gray-600 text-sm text-blue-600 dark:text-blue-400 font-medium">
                      View detailed attendance →
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Summary card component
const SummaryCard = ({
  icon,
  title,
  value,
  bg,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  bg: "blue" | "teal" | "green" | "amber";
}) => {
  const bgClass = {
    blue: "bg-blue-50 dark:bg-blue-900",
    teal: "bg-teal-50 dark:bg-teal-900",
    green: "bg-green-50 dark:bg-green-900",
    amber: "bg-amber-50 dark:bg-amber-900",
  }[bg];

  const iconBgClass = {
    blue: "bg-blue-100 dark:bg-blue-800",
    teal: "bg-teal-100 dark:bg-teal-800",
    green: "bg-green-100 dark:bg-green-800",
    amber: "bg-amber-100 dark:bg-amber-800",
  }[bg];

  const textColor = {
    blue: "text-blue-600 dark:text-blue-300",
    teal: "text-teal-600 dark:text-teal-300",
    green: "text-green-600 dark:text-green-300",
    amber: "text-amber-600 dark:text-amber-300",
  }[bg];

  return (
    <div className={`${bgClass} rounded-lg p-4 flex items-center`}>
      <div className={`rounded-full ${iconBgClass} p-3 mr-4`}>{icon}</div>
      <div>
        <p className={`text-sm font-medium ${textColor}`}>{title}</p>
        <p className={`text-2xl font-bold text-gray-900 dark:text-white`}>
          {value}
        </p>
      </div>
    </div>
  );
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getProgressBarColor = (percentage: number): string => {
  if (percentage >= 90) return "bg-green-500";
  if (percentage >= 75) return "bg-blue-500";
  if (percentage >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

export default FacultyAttendanceView;
