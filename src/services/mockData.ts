import { Unit, ContentType } from "../types";

// Mock data for demonstration purposes
export const mockUnits: Unit[] = [
  {
    id: "1",
    name: "Introduction to Algebra",
    classroomId: "123e4567-e89b-12d3-a456-426614174000",
    educationalContents: [
      {
        id: "101",
        unitId: "1",
        type: ContentType.NOTE,
        content: `# Introduction to Algebra

Algebra is a branch of mathematics dealing with symbols and the rules for manipulating these symbols. In elementary algebra, those symbols (today written as Latin and Greek letters) represent quantities without fixed values, known as variables.

## Key Concepts

1. **Variables**: Symbols (like x, y, z) that represent numbers
2. **Expressions**: Combinations of variables and operations
3. **Equations**: Statements that two expressions are equal

### Example Problems

- Solve for x: 2x + 5 = 13
- Simplify: 3(x + 2) - 4x`,
        version: 1,
        createdAt: "2023-09-15T10:30:00Z",
        updatedAt: "2023-09-15T10:30:00Z",
      },
      {
        id: "102",
        unitId: "1",
        type: ContentType.LINK,
        content: "https://www.khanacademy.org/math/algebra",
        version: 1,
        createdAt: "2023-09-16T11:20:00Z",
        updatedAt: "2023-09-16T11:20:00Z",
      },
      {
        id: "103",
        unitId: "1",
        type: ContentType.VIDEO,
        content: "https://www.youtube.com/watch?v=NybHckSEQBI",
        version: 1,
        createdAt: "2023-09-17T14:15:00Z",
        updatedAt: "2023-09-17T14:15:00Z",
      },
      {
        id: "104",
        unitId: "1",
        type: ContentType.DOCUMENT,
        content: "algebra_workbook.pdf",
        version: 1,
        createdAt: "2023-09-18T09:45:00Z",
        updatedAt: "2023-09-18T09:45:00Z",
      },
    ],
    createdAt: "2023-09-10T08:00:00Z",
    updatedAt: "2023-09-18T09:45:00Z",
  },
  {
    id: "2",
    name: "Calculus Fundamentals",
    classroomId: "123e4567-e89b-12d3-a456-426614174000",
    educationalContents: [
      {
        id: "201",
        unitId: "2",
        type: ContentType.NOTE,
        content: `# Calculus Fundamentals

Calculus is the mathematical study of continuous change. It has two major branches:
- Differential calculus (concerning rates of change and slopes of curves)
- Integral calculus (concerning accumulation of quantities and the areas under curves)

## Limits

A limit is the value that a function approaches as the input approaches some value.

## Derivatives

The derivative of a function represents its rate of change at a specific point.

## Integrals

Integration is the process of finding the integral of a function, which can be thought of as measuring the area under a curve.`,
        version: 2,
        createdAt: "2023-10-05T13:20:00Z",
        updatedAt: "2023-10-07T09:15:00Z",
      },
      {
        id: "202",
        unitId: "2",
        type: ContentType.VIDEO,
        content: "https://www.youtube.com/watch?v=WUvTyaaNkzM",
        version: 1,
        createdAt: "2023-10-06T10:30:00Z",
        updatedAt: "2023-10-06T10:30:00Z",
      },
      {
        id: "203",
        unitId: "2",
        type: ContentType.DOCUMENT,
        content: "calculus_cheatsheet.pdf",
        version: 1,
        createdAt: "2023-10-08T14:45:00Z",
        updatedAt: "2023-10-08T14:45:00Z",
      },
    ],
    createdAt: "2023-10-01T09:30:00Z",
    updatedAt: "2023-10-08T14:45:00Z",
  },
  {
    id: "3",
    name: "Geometry Basics",
    classroomId: "123e4567-e89b-12d3-a456-426614174000",
    educationalContents: [
      {
        id: "301",
        unitId: "3",
        type: ContentType.NOTE,
        content: `# Geometry Basics

Geometry is the branch of mathematics that deals with shapes, sizes, positions, and dimensions of things.

## Points, Lines, and Planes

These are the fundamental building blocks of geometric figures.

## Angles

An angle is formed by two rays with a common endpoint (vertex).

## Triangles

A triangle is a polygon with three edges and three vertices.`,
        version: 1,
        createdAt: "2023-11-10T11:00:00Z",
        updatedAt: "2023-11-10T11:00:00Z",
      },
      {
        id: "302",
        unitId: "3",
        type: ContentType.LINK,
        content: "https://www.mathsisfun.com/geometry/index.html",
        version: 1,
        createdAt: "2023-11-12T15:20:00Z",
        updatedAt: "2023-11-12T15:20:00Z",
      },
    ],
    createdAt: "2023-11-05T10:15:00Z",
    updatedAt: "2023-11-12T15:20:00Z",
  },
];

import {
  Classroom,
  Student,
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
  ClassroomAttendance,
  StudentAttendance,
  ClassroomDetailedAttendance,
  StudentDetailedAttendance,
  AttendanceByDate,
} from "../types/attendance";

// Mock classrooms
export const mockClassrooms: Classroom[] = [
  {
    id: "cls-001",
    name: "Introduction to Computer Science",
    code: "CS101",
    facultyId: "fac-001",
    schedule: "Mon, Wed 10:00 AM - 11:30 AM",
    semester: "Fall 2025",
    studentCount: 45,
  },
  {
    id: "cls-002",
    name: "Data Structures and Algorithms",
    code: "CS201",
    facultyId: "fac-001",
    schedule: "Tue, Thu 1:00 PM - 2:30 PM",
    semester: "Fall 2025",
    studentCount: 38,
  },
  {
    id: "cls-003",
    name: "Database Management Systems",
    code: "CS301",
    facultyId: "fac-002",
    schedule: "Mon, Wed, Fri 2:00 PM - 3:00 PM",
    semester: "Fall 2025",
    studentCount: 32,
  },
  {
    id: "cls-004",
    name: "Web Development Fundamentals",
    code: "CS251",
    facultyId: "fac-001",
    schedule: "Wed, Fri 9:00 AM - 10:30 AM",
    semester: "Fall 2025",
    studentCount: 40,
  },
  {
    id: "c4",
    name: "English Literature",
    code: "ENG104",
    facultyId: "fac-001",
    semester: "Fall 2024",
    schedule: "Mon & Wed 1:00 PM - 2:30 PM",
    studentCount: 40,
  },
  {
    id: "c5",
    name: "Computer Science",
    code: "CS105",
    semester: "Fall 2024",
    facultyId: "fac-001",
    schedule: "Fri 3:00 PM - 5:00 PM",
    studentCount: 40,
  },
];

// Mock students
export const mockStudents: Student[] = [
  {
    id: "std-001",
    name: "Alex Johnson",
    email: "alex.j@example.edu",
    rollNumber: "CS2025001",
    profileImage:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2",
  },
  {
    id: "std-002",
    name: "Samantha Williams",
    email: "sam.w@example.edu",
    rollNumber: "CS2025002",
    profileImage:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2",
  },
  {
    id: "std-003",
    name: "David Chen",
    email: "david.c@example.edu",
    rollNumber: "CS2025003",
    profileImage:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2",
  },
  {
    id: "std-004",
    name: "Maya Patel",
    email: "maya.p@example.edu",
    rollNumber: "CS2025004",
    profileImage:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2",
  },
  {
    id: "std-005",
    name: "James Wilson",
    email: "james.w@example.edu",
    rollNumber: "CS2025005",
    profileImage:
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2",
  },
];

// Create mock attendance records for the past 30 days
const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  // For each classroom and student, generate attendance for the past 30 days
  mockClassrooms.forEach((classroom) => {
    mockStudents.forEach((student) => {
      // Only include students in some classrooms to simulate real enrollment
      if (
        (parseInt(student.id.split("-")[1]) % 2 === 0 &&
          classroom.id === "cls-001") ||
        (parseInt(student.id.split("-")[1]) % 3 === 0 &&
          classroom.id === "cls-002") ||
        (parseInt(student.id.split("-")[1]) % 5 === 0 &&
          classroom.id === "cls-003") ||
        classroom.id === "cls-004"
      ) {
        // All students in cls-004

        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);

          // Skip weekends
          if (date.getDay() === 0 || date.getDay() === 6) continue;

          // Determine class days based on schedule
          const dayOfWeek = date.getDay();
          const isClassDay = classroom.schedule.includes(
            ["", "Mon", "Tue", "Wed", "Thu", "Fri"][dayOfWeek]
          );

          if (isClassDay) {
            // Generate random attendance status with weighted probabilities
            const rand = Math.random();
            let status: AttendanceStatus;

            if (rand < 0.8) status = "present";
            else if (rand < 0.9) status = "absent";
            else if (rand < 0.95) status = "late";
            else status = "excused";

            records.push({
              id: `att-${classroom.id}-${student.id}-${
                date.toISOString().split("T")[0]
              }`,
              classroomId: classroom.id,
              studentId: student.id,
              date: date.toISOString().split("T")[0],
              status,
              remark:
                status !== "present" ? getRemarkForStatus(status) : undefined,
            });
          }
        }
      }
    });
  });

  return records;
};

const getRemarkForStatus = (status: AttendanceStatus): string => {
  switch (status) {
    case "absent":
      return ["No notification", "Family emergency", "Sick leave"][
        Math.floor(Math.random() * 3)
      ];
    case "late":
      return [
        "Arrived 15 minutes late",
        "Transportation issues",
        "Prior appointment ran over",
      ][Math.floor(Math.random() * 3)];
    case "excused":
      return ["Medical appointment", "Family event", "Athletic competition"][
        Math.floor(Math.random() * 3)
      ];
    default:
      return "";
  }
};

export const mockAttendanceRecords = generateAttendanceRecords();

// Helper function to calculate attendance summary
export const calculateAttendanceSummary = (
  records: AttendanceRecord[]
): AttendanceSummary => {
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  const total = records.length;

  return {
    present,
    absent,
    late,
    excused,
    total,
    presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
  };
};

// Get faculty classrooms with attendance summaries
export const getFacultyClassrooms = (
  facultyId: string
): ClassroomAttendance[] => {
  return mockClassrooms
    .filter((classroom) => classroom.facultyId === facultyId)
    .map((classroom) => {
      const classroomRecords = mockAttendanceRecords.filter(
        (record) => record.classroomId === classroom.id
      );

      // Get recent dates (last 5 class days)
      const recentDates = [
        ...new Set(
          classroomRecords
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((r) => r.date)
            .slice(0, 5)
        ),
      ];

      return {
        classroom,
        summary: calculateAttendanceSummary(classroomRecords),
        recentDates,
      };
    });
};

// Get student classrooms with attendance summaries
export const getStudentClassrooms = (
  studentId: string
): StudentAttendance[] => {
  // Find classrooms the student is enrolled in
  const studentRecords = mockAttendanceRecords.filter(
    (record) => record.studentId === studentId
  );
  const classroomIds = [
    ...new Set(studentRecords.map((record) => record.classroomId)),
  ];

  return classroomIds.map((classroomId) => {
    const classroom = mockClassrooms.find((c) => c.id === classroomId)!;
    const classroomRecords = studentRecords.filter(
      (record) => record.classroomId === classroomId
    );

    // Get recent records (last 5 attendance records)
    const recentRecords = classroomRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      classroom,
      summary: calculateAttendanceSummary(classroomRecords),
      recentRecords,
    };
  });
};

// Get detailed attendance for a specific classroom
export const getClassroomDetailedAttendance = (
  classroomId: string
): ClassroomDetailedAttendance => {
  const classroom = mockClassrooms.find((c) => c.id === classroomId)!;
  const classroomRecords = mockAttendanceRecords.filter(
    (record) => record.classroomId === classroomId
  );

  // Get all students in this classroom
  const studentIds = [
    ...new Set(classroomRecords.map((record) => record.studentId)),
  ];
  const students = mockStudents.filter((student) =>
    studentIds.includes(student.id)
  );

  // Calculate attendance by student
  const attendanceByStudent: Record<string, AttendanceSummary> = {};
  students.forEach((student) => {
    const studentRecords = classroomRecords.filter(
      (record) => record.studentId === student.id
    );
    attendanceByStudent[student.id] =
      calculateAttendanceSummary(studentRecords);
  });

  // Calculate attendance by date
  const dateMap = new Map<
    string,
    {
      present: number;
      absent: number;
      late: number;
      excused: number;
      total: number;
    }
  >();
  classroomRecords.forEach((record) => {
    if (!dateMap.has(record.date)) {
      dateMap.set(record.date, {
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        total: 0,
      });
    }

    const dateStats = dateMap.get(record.date)!;
    dateStats[record.status]++;
    dateStats.total++;
  });

  const attendanceByDate: AttendanceByDate[] = Array.from(dateMap.entries())
    .map(([date, stats]) => ({
      date,
      ...stats,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    classroom,
    students,
    attendanceByStudent,
    attendanceByDate,
    overallSummary: calculateAttendanceSummary(classroomRecords),
  };
};

// Get detailed attendance for a specific student
export const getStudentDetailedAttendance = (
  studentId: string
): StudentDetailedAttendance => {
  const student = mockStudents.find((s) => s.id === studentId)!;
  const studentRecords = mockAttendanceRecords.filter(
    (record) => record.studentId === studentId
  );

  // Get all classrooms this student is enrolled in
  const classroomIds = [
    ...new Set(studentRecords.map((record) => record.classroomId)),
  ];
  const classrooms = mockClassrooms.filter((classroom) =>
    classroomIds.includes(classroom.id)
  );

  // Calculate attendance by classroom
  const attendanceByClassroom: Record<string, AttendanceSummary> = {};
  classrooms.forEach((classroom) => {
    const classroomRecords = studentRecords.filter(
      (record) => record.classroomId === classroom.id
    );
    attendanceByClassroom[classroom.id] =
      calculateAttendanceSummary(classroomRecords);
  });

  // Get attendance status by date
  const attendanceByDate: Record<string, AttendanceStatus> = {};
  studentRecords.forEach((record) => {
    attendanceByDate[record.date] = record.status;
  });

  return {
    student,
    classrooms,
    attendanceByClassroom,
    attendanceByDate,
    overallSummary: calculateAttendanceSummary(studentRecords),
  };
};
