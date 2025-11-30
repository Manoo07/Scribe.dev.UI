import { BarChartIcon, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { getAttendanceRecords } from "../../../services/attendanceService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import AttendanceCalendar from "../attendanceTab/AttendanceCalander";
import AttendanceForm from "../attendanceTab/AttendanceForm";
import AttendanceStats from "../attendanceTab/AttendanceStats";
import StudentAttendanceView from "../attendanceTab/StudentAttendanceView";
import { TabContainer } from "../shared";

interface AttendanceTabProps {
  classroomId: string;
  userRole: "faculty" | "student";
  userId: string;
}

const AttendanceTab = ({
  classroomId,
  userRole,
  userId = "1",
}: AttendanceTabProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [attendanceData, setAttendanceData] = useState<
    Record<string, { present: number; total: number }>
  >({});

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
      <TabContainer title="Attendance Dashboard">
        <StudentAttendanceView classroomId={classroomId} studentId={userId} />
      </TabContainer>
    );
  }

  return (
    <TabContainer title="Attendance Management">
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
    </TabContainer>
  );
};

export default AttendanceTab;
