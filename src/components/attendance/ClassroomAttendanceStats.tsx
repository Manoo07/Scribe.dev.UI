import React, { useState } from "react";
import { ClassroomDetailedAttendance } from "../../types/attendance";
import {
  ChevronLeft,
  Calendar,
  Users,
  Award,
  Search,
  Filter,
} from "lucide-react";
import AttendanceStatusBadge from "./AttendanceStatusBadge";
import AttendanceChart from "./AttendanceChart";

interface ClassroomAttendanceStatsProps {
  classroom: ClassroomDetailedAttendance;
  onBack: () => void;
}

const ClassroomAttendanceStats: React.FC<ClassroomAttendanceStatsProps> = ({
  classroom,
  onBack,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "attendance">("attendance");
  const [filterAttendance, setFilterAttendance] = useState<number | null>(null);

  const filteredStudents = classroom.students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else {
      const aAttendance = classroom.attendanceByStudent[a.id].presentPercentage;
      const bAttendance = classroom.attendanceByStudent[b.id].presentPercentage;
      return bAttendance - aAttendance;
    }
  });

  const displayStudents =
    filterAttendance !== null
      ? sortedStudents.filter((student) => {
          const percentage =
            classroom.attendanceByStudent[student.id].presentPercentage;
          if (filterAttendance === 90) return percentage >= 90;
          if (filterAttendance === 75)
            return percentage >= 75 && percentage < 90;
          if (filterAttendance === 60)
            return percentage >= 60 && percentage < 75;
          return percentage < 60;
        })
      : sortedStudents;

  const colorMap = {
    Present: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-800 dark:text-green-300",
      subText: "text-green-600 dark:text-green-400",
    },
    Absent: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-800 dark:text-red-300",
      subText: "text-red-600 dark:text-red-400",
    },
    Late: {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-800 dark:text-amber-300",
      subText: "text-amber-600 dark:text-amber-400",
    },
    Excused: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-800 dark:text-blue-300",
      subText: "text-blue-600 dark:text-blue-400",
    },
  };

  return (
    <div className="h-full overflow-auto dark:bg-gray-900 dark:text-gray-100">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 transition-colors"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span>Back to Classrooms</span>
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {classroom.classroom.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {classroom.classroom.code} • {classroom.classroom.semester}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-600" />
              <span>{classroom.classroom.schedule}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-teal-600" />
              <span>{classroom.students.length} students</span>
            </div>
            <div className="flex items-center">
              <Award className="h-4 w-4 mr-2 text-green-600" />
              <span>
                Overall Attendance: {classroom.overallSummary.presentPercentage}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Present",
            value: classroom.overallSummary.present,
          },
          {
            label: "Absent",
            value: classroom.overallSummary.absent,
          },
          {
            label: "Late",
            value: classroom.overallSummary.late,
          },
          {
            label: "Excused",
            value: classroom.overallSummary.excused,
          },
        ].map(({ label, value }) => {
          const color = colorMap[label as keyof typeof colorMap];
          return (
            <div key={label} className={`${color.bg} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <h3 className={`${color.text} font-medium`}>{label}</h3>
                <span className={`text-lg font-bold ${color.text}`}>
                  {value}
                </span>
              </div>
              <div className={`mt-2 text-sm ${color.subText}`}>
                {Math.round((value / classroom.overallSummary.total) * 100)}% of
                total
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Attendance Trend
          </h3>
          <div className="h-72">
            <AttendanceChart
              data={classroom.attendanceByDate.slice(0, 14).reverse()}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Student Attendance
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or roll number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "name" | "attendance")
                  }
                  className="pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="attendance">Sort by Attendance</option>
                  <option value="name">Sort by Name</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              <select
                value={
                  filterAttendance === null
                    ? "all"
                    : filterAttendance.toString()
                }
                onChange={(e) =>
                  setFilterAttendance(
                    e.target.value === "all" ? null : Number(e.target.value)
                  )
                }
                className="pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="90">≥ 90%</option>
                <option value="75">75-89%</option>
                <option value="60">60-74%</option>
                <option value="0">&lt; 60%</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {[
                    "Student",
                    "Roll Number",
                    "Present",
                    "Absent",
                    "Late",
                    "Excused",
                    "Attendance",
                  ].map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {displayStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No students found matching your search criteria
                    </td>
                  </tr>
                ) : (
                  displayStudents.map((student) => {
                    const stats = classroom.attendanceByStudent[student.id];
                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {student.profileImage ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={student.profileImage}
                                  alt=""
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-medium">
                                  {student.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {student.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {student.rollNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {stats.present}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {stats.absent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {stats.late}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {stats.excused}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <AttendanceStatusBadge
                            percentage={stats.presentPercentage}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomAttendanceStats;
