
import React, { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { getStudentAttendanceStats, getAttendanceRecords } from "../../../services/attendanceService";
import { AttendanceStats } from "../../../types/index";
import { Check, X, AlertCircle, Calendar } from "lucide-react";
import YearlyAttendanceStreak from "./YearlyAttendaceStreak";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../ui/hover-card";

interface StudentAttendanceViewProps {
  classroomId: string;
  studentId: string;
}

const StudentAttendanceView = ({ classroomId, studentId }: StudentAttendanceViewProps) => {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<Array<{date: string; present: boolean}>>([]);

  useEffect(() => {
    const studentStats = getStudentAttendanceStats(classroomId, studentId);
    setStats(studentStats);
    
    // Get attendance history
    const records = getAttendanceRecords(classroomId);
    const history = Object.entries(records).map(([date, record]) => ({
      date,
      present: record.presentStudents.includes(studentId)
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by most recent
    
    setAttendanceHistory(history);
  }, [classroomId, studentId]);

  if (!stats) {
    return <div className="text-center text-gray-300 p-4">Loading...</div>;
  }

  // Get status level based on percentage
  const getStatusLevel = () => {
    if (stats.percentage >= 90) return { color: "green", text: "Excellent Standing" };
    if (stats.percentage >= 75) return { color: "green", text: "Good Standing" };
    if (stats.percentage >= 60) return { color: "yellow", text: "Needs Improvement" };
    return { color: "red", text: "Critical - At Risk" };
  };

  const statusInfo = getStatusLevel();

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Calendar className="mr-3 h-5 w-5 text-blue-400" />
        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Your Attendance</span>
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-gray-700/90 to-gray-800/90 p-5 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group border border-gray-600/50">
          <div className="text-gray-400 mb-1">Attendance Rate</div>
          <div className="text-2xl font-bold text-white group-hover:bg-gradient-to-r from-blue-400 to-indigo-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{stats.percentage}%</div>
          <div className={`text-sm mt-1 font-medium text-${statusInfo.color}-500`}>
            {statusInfo.text}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-700/90 to-gray-800/90 p-5 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group border border-gray-600/50">
          <div className="text-gray-400 mb-1">Total Classes</div>
          <div className="text-2xl font-bold text-white group-hover:bg-gradient-to-r from-blue-400 to-indigo-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{stats.totalDays}</div>
          <div className="text-sm mt-1 text-gray-400">This semester</div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-700/90 to-gray-800/90 p-5 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group border border-gray-600/50">
          <div className="text-gray-400 mb-1">Present</div>
          <div className="text-2xl font-bold text-green-400 group-hover:bg-gradient-to-r from-green-400 to-emerald-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{stats.presentDays}</div>
          <div className="text-sm mt-1 text-gray-400">Days attended</div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-700/90 to-gray-800/90 p-5 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group border border-gray-600/50">
          <div className="text-gray-400 mb-1">Absent</div>
          <div className="text-2xl font-bold text-red-400 group-hover:bg-gradient-to-r from-red-400 to-rose-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{stats.absentDays}</div>
          <div className="text-sm mt-1 text-gray-400">Days missed</div>
        </div>
      </div>
      
      {/* Yearly attendance streak (GitHub-style) */}
      <div className="mb-8">
        <YearlyAttendanceStreak attendanceHistory={attendanceHistory} />
      </div>
      
      {/* Visual attendance meter with hover tooltip */}
      <div className="mb-8 bg-gray-700/60 p-5 rounded-xl border border-gray-600/50">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-blue-400" />
          Attendance Progress
        </h4>
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner relative cursor-help">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${
                  stats.percentage >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-400" : 
                  stats.percentage >= 75 ? "bg-gradient-to-r from-green-500 to-lime-400" : 
                  stats.percentage >= 60 ? "bg-gradient-to-r from-yellow-500 to-amber-400" : 
                  "bg-gradient-to-r from-red-500 to-rose-400"
                }`}
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-52 bg-gray-800 border-gray-700 shadow-xl">
            <div className="flex flex-col">
              <span className="font-medium text-white">{stats.percentage}% Attendance</span>
              <p className="text-xs text-gray-400 mt-1">
                Present {stats.presentDays} out of {stats.totalDays} days
              </p>
              <div className="mt-2 pt-2 border-t border-gray-700">
                <p className="text-xs">
                  {stats.percentage >= 90 ? (
                    <span className="text-green-400">Excellent attendance!</span>
                  ) : stats.percentage >= 75 ? (
                    <span className="text-green-400">Good attendance</span>
                  ) : stats.percentage >= 60 ? (
                    <span className="text-yellow-400">Needs improvement</span>
                  ) : (
                    <span className="text-red-400">Critical - attendance at risk</span>
                  )}
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
      
      {/* Recent attendance history */}
      <div className="bg-gray-700/60 p-5 rounded-xl border border-gray-600/50">
        <h4 className="text-white font-medium mb-4">Recent Attendance</h4>
        <div className="overflow-y-auto max-h-64 pr-2 scrollbar-none">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/70">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tl-lg">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tr-lg">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50 bg-gray-800/40">
              {attendanceHistory.slice(0, 5).map((record, index) => (
                <tr key={record.date} className={`hover:bg-gray-700/70 transition-colors ${
                  index === 4 ? "rounded-b-lg" : ""
                }`}>
                  <td className="py-3 px-4 text-sm text-gray-300 whitespace-nowrap">
                    {format(parseISO(record.date), "EEEE, MMM d, yyyy")}
                  </td>
                  <td className="py-3 px-4 text-sm whitespace-nowrap">
                    {record.present ? (
                      <div className="flex items-center text-green-400 bg-green-900/20 py-1 px-3 rounded-full w-min border border-green-800/30">
                        <Check className="h-4 w-4 mr-1" /> Present
                      </div>
                    ) : (
                      <div className="flex items-center text-red-400 bg-red-900/20 py-1 px-3 rounded-full w-min border border-red-800/30">
                        <X className="h-4 w-4 mr-1" /> Absent
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {attendanceHistory.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <Calendar className="h-8 w-8 mb-2 text-gray-500" />
                      <p>No attendance records found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceView;