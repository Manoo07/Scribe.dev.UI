import { format, parseISO, subDays } from "date-fns";
import { AttendanceRecord, AttendanceStats, Student } from "../types/index";

// Mock students data
const mockStudents: Student[] = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Jane Smith", email: "jane@example.com" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com" },
  { id: "4", name: "Emily Davis", email: "emily@example.com" },
  { id: "5", name: "Alex Wilson", email: "alex@example.com" },
];

// Generate mock attendance records for the past 30 days
const generateMockAttendanceRecords = (/* classroomId: string */): Record<
  string,
  AttendanceRecord
> => {
  const records: Record<string, AttendanceRecord> = {};

  for (let i = 0; i < 30; i++) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");

    // Randomly mark some students as present
    const presentStudents = mockStudents
      .filter(() => Math.random() > 0.2)
      .map((student) => student.id);

    const absentStudents = mockStudents
      .filter((student) => !presentStudents.includes(student.id))
      .map((student) => student.id);

    records[date] = {
      date,
      presentStudents,
      absentStudents,
      totalStudents: mockStudents.length,
    };
  }

  return records;
};

// Cache for mock data
const attendanceRecordsCache: Record<
  string,
  Record<string, AttendanceRecord>
> = {};

export const getStudentsForClassroom =
  (/* classroomId: string */): Student[] => {
    // In a real app, this would filter students by classroom
    return mockStudents;
  };

export const getAttendanceRecords = (
  classroomId: string
): Record<string, AttendanceRecord> => {
  if (!attendanceRecordsCache[classroomId]) {
    attendanceRecordsCache[classroomId] = generateMockAttendanceRecords();
  }
  return attendanceRecordsCache[classroomId];
};

export const getAttendanceForDate = (
  classroomId: string,
  date: string
): AttendanceRecord | undefined => {
  const records = getAttendanceRecords(classroomId);
  return records[date];
};

export const updateAttendanceForDate = (
  classroomId: string,
  date: string,
  presentStudentIds: string[]
): AttendanceRecord => {
  const students = getStudentsForClassroom();
  const absentStudentIds = students
    .map((s) => s.id)
    .filter((id) => !presentStudentIds.includes(id));

  const record: AttendanceRecord = {
    date,
    presentStudents: presentStudentIds,
    absentStudents: absentStudentIds,
    totalStudents: students.length,
  };

  if (!attendanceRecordsCache[classroomId]) {
    attendanceRecordsCache[classroomId] = {};
  }

  attendanceRecordsCache[classroomId][date] = record;
  return record;
};

export const getStudentAttendanceStats = (
  classroomId: string,
  studentId: string
): AttendanceStats => {
  const records = getAttendanceRecords(classroomId);
  const totalDays = Object.keys(records).length;

  const presentDays = Object.values(records).filter((record) =>
    record.presentStudents.includes(studentId)
  ).length;

  const absentDays = totalDays - presentDays;
  const percentage =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return {
    totalDays,
    presentDays,
    absentDays,
    percentage,
  };
};

export const getStudentById = (studentId: string): Student | undefined => {
  return mockStudents.find((s) => s.id === studentId);
};

export const getOverallAttendanceStats = (
  classroomId: string
): Record<string, number> => {
  const records = getAttendanceRecords(classroomId);
  const dateLabels: string[] = Object.keys(records).slice(0, 7).reverse();

  const attendanceData = dateLabels.map((date) => {
    const record = records[date];
    return {
      date: format(parseISO(date), "MMM dd"),
      percentage: Math.round(
        (record.presentStudents.length / record.totalStudents) * 100
      ),
    };
  });

  // Format for chart
  return attendanceData.reduce((acc, item) => {
    acc[item.date] = item.percentage;
    return acc;
  }, {} as Record<string, number>);
};
