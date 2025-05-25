import React, { useState, useEffect } from "react";
import {
  getStudentClassrooms,
  getStudentDetailedAttendance,
} from "../../services/mockData";
import {
  StudentAttendance,
  StudentDetailedAttendance,
} from "../../types/attendance";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Shield,
  ChevronLeft,
} from "lucide-react";
import AttendanceStatusBadge from "./AttendanceStatusBadge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StudentAttendanceViewProps {
  studentId: string;
}

const StudentAttendanceView: React.FC<StudentAttendanceViewProps> = ({
  studentId,
}) => {
  const [classrooms, setClassrooms] = useState<StudentAttendance[]>([]);
  const [detailedAttendance, setDetailedAttendance] =
    useState<StudentDetailedAttendance | null>(null);
  const [selectedClassroom, setSelectedClassroom] =
    useState<StudentAttendance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const studentClassrooms = getStudentClassrooms(studentId);
    setClassrooms(studentClassrooms);
    const detailed = getStudentDetailedAttendance(studentId);
    setDetailedAttendance(detailed);
    setIsLoading(false);
  }, [studentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getBarColor = (percent: number) => {
    if (percent >= 90) return "#34D399";
    if (percent >= 75) return "#10B981";
    if (percent >= 50) return "#FBBF24";
    return "#F87171";
  };

  if (selectedClassroom) {
    const attendanceData =
      selectedClassroom.recentRecords?.map((record) => ({
        date: formatDate(record.date),
        status: record.status,
        value:
          record.status === "present" ? 100 : record.status === "late" ? 50 : 0,
      })) || [];

    return (
      <div className="bg-gray-900 min-h-screen p-4 md:p-6">
        <button
          onClick={() => setSelectedClassroom(null)}
          className="flex items-center text-blue-400 hover:text-blue-300 mb-6 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back to All Classrooms</span>
        </button>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 md:p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">
            {selectedClassroom.classroom.name}
          </h2>
          <p className="text-gray-400">
            {selectedClassroom.classroom.code} •{" "}
            {selectedClassroom.classroom.semester}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              {
                label: "Present",
                count: selectedClassroom.summary.present,
                icon: <CheckCircle className="h-8 w-8 text-green-400" />,
                color: "text-green-400",
              },
              {
                label: "Absent",
                count: selectedClassroom.summary.absent,
                icon: <XCircle className="h-8 w-8 text-red-400" />,
                color: "text-red-400",
              },
              {
                label: "Late",
                count: selectedClassroom.summary.late,
                icon: <Clock className="h-8 w-8 text-amber-400" />,
                color: "text-amber-400",
              },
              {
                label: "Excused",
                count: selectedClassroom.summary.excused,
                icon: <Shield className="h-8 w-8 text-blue-400" />,
                color: "text-blue-400",
              },
            ].map(({ label, count, icon, color }) => (
              <div
                key={label}
                className="bg-gray-700 p-4 rounded-lg border border-gray-600 flex justify-between items-center"
              >
                <div>
                  <p className="text-gray-400">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{count}</p>
                </div>
                {icon}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 md:p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Attendance Trend
          </h3>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={attendanceData}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#F3F4F6" }}
                />
                <Bar dataKey="value" name="Attendance">
                  {attendanceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.value)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen p-4 md:p-6">
      <div className="grid gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0">
              {detailedAttendance?.student.profileImage ? (
                <img
                  src={detailedAttendance.student.profileImage}
                  alt={detailedAttendance.student.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-gray-700"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center text-blue-400 text-2xl font-bold">
                  {detailedAttendance?.student.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">
                {detailedAttendance?.student.name}
              </h2>
              <p className="text-gray-400">
                {detailedAttendance?.student.email}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Roll No: {detailedAttendance?.student.rollNumber}
              </p>
            </div>
            <div className="flex-shrink-0">
              <AttendanceStatusBadge
                percentage={
                  detailedAttendance?.overallSummary.presentPercentage || 0
                }
                size="xlarge"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map((classroom) => (
            <div
              key={classroom.classroom.id}
              className="bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => setSelectedClassroom(classroom)}
            >
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {classroom.classroom.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {classroom.classroom.code}
                    </p>
                  </div>
                  <AttendanceStatusBadge
                    percentage={classroom.summary.presentPercentage}
                    size="large"
                  />
                </div>
                <div className="flex items-center text-gray-400 text-sm mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{classroom.classroom.schedule}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-700 p-3 rounded-lg text-center">
                    <p className="text-green-400 text-lg font-bold">
                      {classroom.summary.present}
                    </p>
                    <p className="text-gray-400 text-sm">Present</p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg text-center">
                    <p className="text-red-400 text-lg font-bold">
                      {classroom.summary.absent}
                    </p>
                    <p className="text-gray-400 text-sm">Absent</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Attendance Rate</span>
                    <span className="text-white font-medium">
                      {classroom.summary.presentPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{
                        width: `${classroom.summary.presentPercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default StudentAttendanceView;
