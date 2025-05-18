import React, { useState, useEffect } from "react";
import {
  getStudentsForClassroom,
  getAttendanceRecords,
} from "../../../services/attendanceService";
import AttendanceCalendar from "../attendance/AttendanceCalander";
import AttendanceForm from "../attendance/AttendanceForm";
import AttendanceStats from "../attendance/AttendanceStats";
import StudentAttendanceView from "../attendance/StudentAttendanceView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Separator } from "../../ui/seperator";
import { Calendar, BarChartIcon } from "lucide-react";

interface AttendanceTabProps {
  classroomId: string;
  userRole: "faculty" | "student";
  userId: string;
}

const AttendanceTab = ({
  classroomId,
  userId = "1",
}: AttendanceTabProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [attendanceData, setAttendanceData] = useState<
    Record<string, { present: number; total: number }>
  >({});
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    // Prepare data for calendar attendance indicators
    const records = getAttendanceRecords(classroomId);
    const data: Record<string, { present: number; total: number }> = {};

    Object.entries(records).forEach(([date, record]) => {
      data[date] = {
        present: record.presentStudents.length,
        total: record.totalStudents,
      };
    });

    setAttendanceData(data);
  }, [classroomId, refreshKey]);

  const handleAttendanceUpdated = () => {
    // Refresh data when attendance is updated
    setRefreshKey((prev) => prev + 1);
  };

  if (userRole === "student") {
    return (
      <div className="py-4">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Calendar className="mr-3 h-5 w-5 text-blue-400" />
          Attendance Dashboard
        </h2>
        <StudentAttendanceView classroomId={classroomId} studentId={userId} />
      </div>
    );
  }

  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Calendar className="mr-3 h-5 w-5 text-blue-400" />
        Attendance Management
      </h2>

      <Tabs defaultValue="mark" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="mark" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Mark Attendance</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center space-x-2"
          >
            <BarChartIcon className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mark">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AttendanceCalendar
                classroomId={classroomId}
                onSelectDate={setSelectedDate}
                attendanceData={attendanceData}
              />
            </div>

            <div className="lg:col-span-2">
              <AttendanceForm
                classroomId={classroomId}
                selectedDate={selectedDate}
                onAttendanceUpdated={handleAttendanceUpdated}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AttendanceStats classroomId={classroomId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceTab;
