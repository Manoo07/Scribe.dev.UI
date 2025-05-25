export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

export interface Classroom {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  schedule: string;
  semester: string;
  studentCount: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  profileImage?: string;
}

export interface AttendanceRecord {
  id: string;
  classroomId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  remark?: string;
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  presentPercentage: number;
}

export interface ClassroomAttendance {
  classroom: Classroom;
  summary: AttendanceSummary;
  recentDates?: string[];
}

export interface StudentAttendance {
  classroom: Classroom;
  summary: AttendanceSummary;
  recentRecords?: AttendanceRecord[];
}

export interface AttendanceByDate {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

export interface ClassroomDetailedAttendance {
  classroom: Classroom;
  students: Student[];
  attendanceByStudent: Record<string, AttendanceSummary>;
  attendanceByDate: AttendanceByDate[];
  overallSummary: AttendanceSummary;
}

export interface StudentDetailedAttendance {
  student: Student;
  classrooms: Classroom[];
  attendanceByClassroom: Record<string, AttendanceSummary>;
  attendanceByDate: Record<string, AttendanceStatus>;
  overallSummary: AttendanceSummary;
}
