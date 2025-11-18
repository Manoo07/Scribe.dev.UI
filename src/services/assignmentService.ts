import {
  getAssignmentsForClassroom,
  getSubmissionsForAssignment,
  getSubmissionsForStudent,
  mockAssignments,
  mockSubmissions,
  simulateApiDelay,
} from "../data/mockAssignmentData";
import api from "../lib/axiosInstance";
import {
  Assignment,
  AssignmentFilters,
  AssignmentStats,
  AssignmentStatus,
  AssignmentSubmission,
  CreateAssignmentPayload,
  SubmissionStatus,
  SubmitAssignmentPayload,
  UpdateAssignmentPayload,
  UpdateSubmissionPayload,
} from "../types/assignment";

// Use the centralized axios instance

// Assignment API calls
export const assignmentAPI = {
  // Get assignments with filters
  getAssignments: async (
    filters?: AssignmentFilters
  ): Promise<{ assignments: Assignment[]; stats: AssignmentStats }> => {
    await simulateApiDelay(800);

    let filteredAssignments = [...mockAssignments];

    if (filters?.classroomId) {
      filteredAssignments = filteredAssignments.filter(
        (a) => a.classroomId === filters.classroomId
      );
    }

    if (filters?.facultyId) {
      filteredAssignments = filteredAssignments.filter(
        (a) => a.facultyId === filters.facultyId
      );
    }

    if (filters?.status) {
      filteredAssignments = filteredAssignments.filter(
        (a) => a.status === filters.status
      );
    }

    const stats: AssignmentStats = {
      totalAssignments: filteredAssignments.length,
      openAssignments: filteredAssignments.filter(
        (a) => a.status === AssignmentStatus.OPEN
      ).length,
      pendingAssignments: filteredAssignments.filter(
        (a) => a.status === AssignmentStatus.PENDING
      ).length,
      completedAssignments: filteredAssignments.filter(
        (a) => a.status === AssignmentStatus.COMPLETED
      ).length,
      totalSubmissions: mockSubmissions.length,
      pendingSubmissions: mockSubmissions.filter(
        (s) => s.status === SubmissionStatus.SUBMITTED
      ).length,
      acceptedSubmissions: mockSubmissions.filter(
        (s) => s.status === SubmissionStatus.ACCEPTED
      ).length,
      rejectedSubmissions: mockSubmissions.filter(
        (s) => s.status === SubmissionStatus.REJECTED
      ).length,
      overdueSubmissions: mockSubmissions.filter(
        (s) => s.status === SubmissionStatus.OVERDUE
      ).length,
    };

    return { assignments: filteredAssignments, stats };
  },

  // Get single assignment
  getAssignment: async (assignmentId: string): Promise<Assignment> => {
    await simulateApiDelay(500);
    const assignment = mockAssignments.find((a) => a.id === assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    return assignment;
  },

  // Create assignment (Faculty only)
  createAssignment: async (
    payload: CreateAssignmentPayload
  ): Promise<Assignment> => {
    await simulateApiDelay(1000);

    const newAssignment: Assignment = {
      id: `assignment-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      classroomId: payload.classroomId,
      facultyId: "faculty-1", // Mock faculty ID
      facultyName: "Dr. Sarah Johnson",
      dueDate: payload.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: AssignmentStatus.OPEN,
      fileTypeRestrictions: payload.fileTypeRestrictions || [],
      maxFileSize: payload.maxFileSize || 10,
    };

    // Add to mock data (in real app, this would be handled by backend)
    mockAssignments.push(newAssignment);

    return newAssignment;
  },

  // Update assignment (Faculty only)
  updateAssignment: async (
    assignmentId: string,
    payload: UpdateAssignmentPayload
  ): Promise<Assignment> => {
    const response = await api.put(`/assignments/${assignmentId}`, payload);
    return response.data;
  },

  // Delete assignment (Faculty only)
  deleteAssignment: async (assignmentId: string): Promise<void> => {
    await api.delete(`/assignments/${assignmentId}`);
  },

  // Get classroom assignments
  getClassroomAssignments: async (
    classroomId: string
  ): Promise<Assignment[]> => {
    await simulateApiDelay(600);
    return getAssignmentsForClassroom(classroomId);
  },

  // Get assignment submissions
  getAssignmentSubmissions: async (
    assignmentId: string
  ): Promise<AssignmentSubmission[]> => {
    await simulateApiDelay(500);
    return getSubmissionsForAssignment(assignmentId);
  },

  // Submit assignment (Student only)
  submitAssignment: async (
    payload: SubmitAssignmentPayload
  ): Promise<AssignmentSubmission> => {
    await simulateApiDelay(1200);

    const newSubmission: AssignmentSubmission = {
      id: `submission-${Date.now()}`,
      assignmentId: payload.assignmentId,
      studentId: "student-1", // Mock student ID
      studentName: "Alice Johnson",
      studentEmail: "alice.johnson@university.edu",
      submittedAt: new Date().toISOString(),
      status: SubmissionStatus.SUBMITTED,
      fileUrl: URL.createObjectURL(payload.file),
      fileName: payload.file.name,
      fileSize: payload.file.size,
    };

    // Add to mock data
    mockSubmissions.push(newSubmission);

    return newSubmission;
  },

  // Update submission status (Faculty only)
  updateSubmissionStatus: async (
    submissionId: string,
    payload: UpdateSubmissionPayload
  ): Promise<AssignmentSubmission> => {
    await simulateApiDelay(800);

    const submissionIndex = mockSubmissions.findIndex(
      (s) => s.id === submissionId
    );
    if (submissionIndex === -1) {
      throw new Error("Submission not found");
    }

    const updatedSubmission = {
      ...mockSubmissions[submissionIndex],
      status: payload.status,
      feedback: payload.feedback,
      gradedAt: new Date().toISOString(),
      gradedBy: "faculty-1",
    };

    mockSubmissions[submissionIndex] = updatedSubmission;

    return updatedSubmission;
  },

  // Get student submissions
  getStudentSubmissions: async (
    studentId?: string
  ): Promise<AssignmentSubmission[]> => {
    await simulateApiDelay(600);

    if (studentId) {
      return getSubmissionsForStudent(studentId);
    }

    // Return all submissions for current user (mock: student-1)
    return getSubmissionsForStudent("student-1");
  },

  // Get assignment statistics
  getAssignmentStats: async (
    filters?: AssignmentFilters
  ): Promise<AssignmentStats> => {
    await simulateApiDelay(500);

    let filteredAssignments = [...mockAssignments];

    if (filters?.classroomId) {
      filteredAssignments = filteredAssignments.filter(
        (a) => a.classroomId === filters.classroomId
      );
    }

    if (filters?.facultyId) {
      filteredAssignments = filteredAssignments.filter(
        (a) => a.facultyId === filters.facultyId
      );
    }

    return {
      totalAssignments: filteredAssignments.length,
      openAssignments: filteredAssignments.filter(
        (a) => a.status === AssignmentStatus.OPEN
      ).length,
      pendingAssignments: filteredAssignments.filter(
        (a) => a.status === AssignmentStatus.PENDING
      ).length,
      completedAssignments: filteredAssignments.filter(
        (a) => a.status === AssignmentStatus.COMPLETED
      ).length,
      totalSubmissions: mockSubmissions.length,
      pendingSubmissions: mockSubmissions.filter(
        (s) => s.status === SubmissionStatus.SUBMITTED
      ).length,
      acceptedSubmissions: mockSubmissions.filter(
        (s) => s.status === SubmissionStatus.ACCEPTED
      ).length,
      rejectedSubmissions: mockSubmissions.filter(
        (s) => s.status === SubmissionStatus.REJECTED
      ).length,
      overdueSubmissions: mockSubmissions.filter(
        (s) => s.status === SubmissionStatus.OVERDUE
      ).length,
    };
  },
};

// Utility functions
export const assignmentUtils = {
  // Check if assignment is overdue
  isOverdue: (dueDate: string): boolean => {
    return new Date(dueDate) < new Date();
  },

  // Get assignment status for student
  getStudentAssignmentStatus: (
    assignment: Assignment,
    submission?: AssignmentSubmission
  ): SubmissionStatus => {
    if (!submission) {
      return assignmentUtils.isOverdue(assignment.dueDate)
        ? SubmissionStatus.OVERDUE
        : SubmissionStatus.PENDING;
    }
    return submission.status;
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Get status color
  getStatusColor: (status: AssignmentStatus | SubmissionStatus): string => {
    switch (status) {
      case AssignmentStatus.OPEN:
      case SubmissionStatus.PENDING:
        return "text-blue-500";
      case AssignmentStatus.PENDING:
      case SubmissionStatus.SUBMITTED:
        return "text-yellow-500";
      case AssignmentStatus.COMPLETED:
      case SubmissionStatus.ACCEPTED:
        return "text-green-500";
      case SubmissionStatus.OVERDUE:
      case SubmissionStatus.REJECTED:
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  },

  // Get status badge variant
  getStatusBadgeVariant: (
    status: AssignmentStatus | SubmissionStatus
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case AssignmentStatus.OPEN:
      case SubmissionStatus.PENDING:
        return "default";
      case AssignmentStatus.PENDING:
      case SubmissionStatus.SUBMITTED:
        return "secondary";
      case AssignmentStatus.COMPLETED:
      case SubmissionStatus.ACCEPTED:
        return "default";
      case SubmissionStatus.OVERDUE:
      case SubmissionStatus.REJECTED:
        return "destructive";
      default:
        return "outline";
    }
  },
};
