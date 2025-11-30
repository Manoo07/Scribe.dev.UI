import {
  Assignment,
  AssignmentStatus,
  AssignmentSubmission,
  SubmissionStatus,
  UserRole,
} from "../types/assignment";

// Mock assignments data
export const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "React Components Assignment",
    description:
      "Create a reusable React component with proper TypeScript types and styling. Include props validation and error handling.",
    classroomId: "classroom-1",
    classroomName: "Advanced React Development",
    facultyId: "faculty-1",
    facultyName: "Dr. Sarah Johnson",
    dueDate: "2024-01-15T23:59:00Z",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    status: AssignmentStatus.OPEN,
    fileTypeRestrictions: ["pdf", "doc", "docx"],
    maxFileSize: 10,
  },
  {
    id: "2",
    title: "Database Design Project",
    description:
      "Design a normalized database schema for an e-commerce platform. Include ER diagrams and explain your design decisions.",
    classroomId: "classroom-1",
    classroomName: "Advanced React Development",
    facultyId: "faculty-1",
    facultyName: "Dr. Sarah Johnson",
    dueDate: "2024-01-20T23:59:00Z",
    createdAt: "2024-01-05T14:30:00Z",
    updatedAt: "2024-01-05T14:30:00Z",
    status: AssignmentStatus.PENDING,
    fileTypeRestrictions: ["pdf", "png", "jpg"],
    maxFileSize: 5,
  },
  {
    id: "3",
    title: "API Integration Task",
    description:
      "Integrate a third-party API into your React application. Handle loading states, errors, and implement proper error boundaries.",
    classroomId: "classroom-1",
    classroomName: "Advanced React Development",
    facultyId: "faculty-1",
    facultyName: "Dr. Sarah Johnson",
    dueDate: "2024-01-10T23:59:00Z",
    createdAt: "2024-01-02T09:15:00Z",
    updatedAt: "2024-01-02T09:15:00Z",
    status: AssignmentStatus.COMPLETED,
    fileTypeRestrictions: ["zip", "rar"],
    maxFileSize: 20,
  },
  {
    id: "4",
    title: "UI/UX Design Challenge",
    description:
      "Create a modern, responsive design for a mobile app. Include wireframes, mockups, and a brief design rationale.",
    classroomId: "classroom-2",
    classroomName: "Mobile App Development",
    facultyId: "faculty-2",
    facultyName: "Prof. Michael Chen",
    dueDate: "2024-01-25T23:59:00Z",
    createdAt: "2024-01-08T16:45:00Z",
    updatedAt: "2024-01-08T16:45:00Z",
    status: AssignmentStatus.OPEN,
    fileTypeRestrictions: ["pdf", "fig", "sketch"],
    maxFileSize: 15,
  },
];

// Mock submissions data
export const mockSubmissions: AssignmentSubmission[] = [
  {
    id: "sub-1",
    assignmentId: "1",
    studentId: "student-1",
    studentName: "Alice Johnson",
    studentEmail: "alice.johnson@university.edu",
    submittedAt: "2024-01-14T15:30:00Z",
    status: SubmissionStatus.ACCEPTED,
    fileUrl: "https://example.com/files/assignment1-alice.pdf",
    fileName: "react-components-alice.pdf",
    fileSize: 2048576, // 2MB
    feedback:
      "Excellent work! Your component structure is clean and well-documented. Great use of TypeScript types.",
    gradedAt: "2024-01-15T10:00:00Z",
    gradedBy: "faculty-1",
  },
  {
    id: "sub-2",
    assignmentId: "1",
    studentId: "student-2",
    studentName: "Bob Smith",
    studentEmail: "bob.smith@university.edu",
    submittedAt: "2024-01-15T22:45:00Z",
    status: SubmissionStatus.SUBMITTED,
    fileUrl: "https://example.com/files/assignment1-bob.pdf",
    fileName: "react-components-bob.pdf",
    fileSize: 1536000, // 1.5MB
  },
  {
    id: "sub-3",
    assignmentId: "2",
    studentId: "student-1",
    studentName: "Alice Johnson",
    studentEmail: "alice.johnson@university.edu",
    submittedAt: "2024-01-18T14:20:00Z",
    status: SubmissionStatus.REJECTED,
    fileUrl: "https://example.com/files/assignment2-alice.pdf",
    fileName: "database-design-alice.pdf",
    fileSize: 3072000, // 3MB
    feedback:
      "The ER diagram needs more detail. Please include all relationships and constraints. Also, add more explanation for your design choices.",
    gradedAt: "2024-01-19T09:30:00Z",
    gradedBy: "faculty-1",
  },
  {
    id: "sub-4",
    assignmentId: "2",
    studentId: "student-3",
    studentName: "Charlie Brown",
    studentEmail: "charlie.brown@university.edu",
    submittedAt: "2024-01-19T11:15:00Z",
    status: SubmissionStatus.ACCEPTED,
    fileUrl: "https://example.com/files/assignment2-charlie.pdf",
    fileName: "database-design-charlie.pdf",
    fileSize: 2560000, // 2.5MB
    feedback:
      "Outstanding work! Your normalization approach is excellent and the ER diagram is very detailed.",
    gradedAt: "2024-01-20T08:45:00Z",
    gradedBy: "faculty-1",
  },
  {
    id: "sub-5",
    assignmentId: "3",
    studentId: "student-2",
    studentName: "Bob Smith",
    studentEmail: "bob.smith@university.edu",
    submittedAt: "2024-01-09T16:30:00Z",
    status: SubmissionStatus.ACCEPTED,
    fileUrl: "https://example.com/files/assignment3-bob.zip",
    fileName: "api-integration-bob.zip",
    fileSize: 5242880, // 5MB
    feedback:
      "Great implementation! The error handling is robust and the loading states provide good UX.",
    gradedAt: "2024-01-10T12:00:00Z",
    gradedBy: "faculty-1",
  },
];

// Mock user data
export const mockUsers = {
  students: [
    {
      id: "student-1",
      name: "Alice Johnson",
      email: "alice.johnson@university.edu",
      role: UserRole.STUDENT,
    },
    {
      id: "student-2",
      name: "Bob Smith",
      email: "bob.smith@university.edu",
      role: UserRole.STUDENT,
    },
    {
      id: "student-3",
      name: "Charlie Brown",
      email: "charlie.brown@university.edu",
      role: UserRole.STUDENT,
    },
  ],
  faculty: [
    {
      id: "faculty-1",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@university.edu",
      role: UserRole.FACULTY,
    },
    {
      id: "faculty-2",
      name: "Prof. Michael Chen",
      email: "michael.chen@university.edu",
      role: UserRole.FACULTY,
    },
  ],
  admins: [
    {
      id: "admin-1",
      name: "Admin User",
      email: "admin@university.edu",
      role: UserRole.ADMIN,
    },
  ],
};

// Mock classroom data
export const mockClassrooms = [
  {
    id: "classroom-1",
    name: "Advanced React Development",
    facultyId: "faculty-1",
    facultyName: "Dr. Sarah Johnson",
    studentCount: 25,
  },
  {
    id: "classroom-2",
    name: "Mobile App Development",
    facultyId: "faculty-2",
    facultyName: "Prof. Michael Chen",
    studentCount: 18,
  },
];

// Utility function to get assignments for a specific classroom
export const getAssignmentsForClassroom = (
  classroomId: string
): Assignment[] => {
  return mockAssignments.filter(
    (assignment) => assignment.classroomId === classroomId
  );
};

// Utility function to get submissions for a specific student
export const getSubmissionsForStudent = (
  studentId: string
): AssignmentSubmission[] => {
  return mockSubmissions.filter(
    (submission) => submission.studentId === studentId
  );
};

// Utility function to get submissions for a specific assignment
export const getSubmissionsForAssignment = (
  assignmentId: string
): AssignmentSubmission[] => {
  return mockSubmissions.filter(
    (submission) => submission.assignmentId === assignmentId
  );
};

// Utility function to simulate API delay
export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

