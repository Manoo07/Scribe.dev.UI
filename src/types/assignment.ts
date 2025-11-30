export interface Assignment {
  id: string;
  title: string;
  description: string;
  classroomId: string;
  classroomName?: string;
  facultyId: string;
  facultyName?: string;
  dueDate: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  status: AssignmentStatus;
  fileTypeRestrictions?: string[]; // e.g., ['pdf', 'doc', 'docx']
  maxFileSize?: number; // in MB
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  submittedAt: string; // ISO string
  status: SubmissionStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  feedback?: string;
  gradedAt?: string; // ISO string
  gradedBy?: string;
}

// Assignment statuses for faculty
export enum AssignmentStatus {
  OPEN = "OPEN",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

// Submission statuses for students
export enum SubmissionStatus {
  PENDING = "PENDING",
  SUBMITTED = "SUBMITTED",
  OVERDUE = "OVERDUE",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

// User roles
export enum UserRole {
  STUDENT = "STUDENT",
  FACULTY = "FACULTY",
  ADMIN = "ADMIN",
}

// Assignment creation payload
export interface CreateAssignmentPayload {
  title: string;
  description: string;
  classroomId: string;
  dueDate: string;
  fileTypeRestrictions?: string[];
  maxFileSize?: number;
}

// Assignment submission payload
export interface SubmitAssignmentPayload {
  assignmentId: string;
  file: File;
}

// Assignment update payload
export interface UpdateAssignmentPayload {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: AssignmentStatus;
  fileTypeRestrictions?: string[];
  maxFileSize?: number;
}

// Submission update payload (for faculty)
export interface UpdateSubmissionPayload {
  status: SubmissionStatus;
  feedback?: string;
}

// Assignment filters
export interface AssignmentFilters {
  classroomId?: string;
  facultyId?: string;
  studentId?: string;
  status?: AssignmentStatus | SubmissionStatus;
  dueDateFrom?: string;
  dueDateTo?: string;
}

// Assignment statistics
export interface AssignmentStats {
  totalAssignments: number;
  openAssignments: number;
  pendingAssignments: number;
  completedAssignments: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  acceptedSubmissions: number;
  rejectedSubmissions: number;
  overdueSubmissions: number;
}

