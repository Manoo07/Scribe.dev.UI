/**
 * Classroom API Endpoints
 * All classroom-related API calls
 */

import { API_CONFIG } from "../../config/api.config";
import api from "../../lib/axiosInstance";
import { Unit } from "../../types";

// ==================== Types ====================

export interface Faculty {
  _id: string;
  name: string;
  email: string;
}

export interface Section {
  _id: string;
  name: string;
}

export interface Student {
  _id: string;
  id?: string;
  userId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  rollNumber?: string;
  enrollmentNo?: string;
}

export interface Classroom {
  id?: string;
  name: string;
  section: Section;
  faculty: Faculty;
  year: string;
  semester: string;
  department: string;
  college: string;
  numberOfStudents: number;
}

export interface CreateClassroomPayload {
  name: string;
  section?: string;
  year?: string;
  semester?: string;
  department?: string;
  college?: string;
  // Alternative format with IDs
  departmentId?: string;
  yearId?: string;
}

export interface UpdateClassroomPayload {
  name?: string;
  section?: string;
  year?: string;
  semester?: string;
  department?: string;
  college?: string;
}

export interface JoinClassroomPayload {
  classroomId: string;
  userId: string;
}

export interface LeaveClassroomPayload {
  classroomId: string;
  userId: string;
}

export interface BulkJoinClassroomPayload {
  classroomId: string;
  userIds: string[];
}

export interface BulkLeaveClassroomPayload {
  classroomId: string;
  userIds: string[];
}

export interface ClassroomStudentsResponse {
  enrolledStudents: Student[];
  availableStudents: Student[];
}

// ==================== API Functions ====================

/**
 * Get all classrooms for current user
 */
export const getClassrooms = async (): Promise<Classroom[]> => {
  const { data } = await api.get(API_CONFIG.ENDPOINTS.CLASSROOM.BASE);
  // API returns { classrooms: Classroom[] }
  return data.classrooms || data;
};

/**
 * Get single classroom by ID
 */
export const getClassroom = async (classroomId: string): Promise<Classroom> => {
  const { data } = await api.get(
    API_CONFIG.ENDPOINTS.CLASSROOM.DETAIL(classroomId)
  );
  return data;
};

/**
 * Create new classroom (Faculty only)
 */
export const createClassroom = async (
  payload: CreateClassroomPayload
): Promise<Classroom> => {
  const { data } = await api.post(API_CONFIG.ENDPOINTS.CLASSROOM.BASE, payload);
  // API returns { message: string, classroom: Classroom }
  return data.classroom || data;
};

/**
 * Update classroom (Faculty only)
 */
export const updateClassroom = async (
  classroomId: string,
  payload: UpdateClassroomPayload
): Promise<Classroom> => {
  const { data } = await api.put(
    API_CONFIG.ENDPOINTS.CLASSROOM.DETAIL(classroomId),
    payload
  );
  return data;
};

/**
 * Delete classroom (Faculty only)
 */
export const deleteClassroom = async (classroomId: string): Promise<void> => {
  await api.delete(API_CONFIG.ENDPOINTS.CLASSROOM.DETAIL(classroomId));
};

/**
 * Join classroom using code (Student only)
 */
export const joinClassroom = async (
  payload: JoinClassroomPayload
): Promise<{ message: string; classroom: Classroom }> => {
  const { data } = await api.post(API_CONFIG.ENDPOINTS.CLASSROOM.JOIN, payload);
  return data;
};

/**
 * Get units for a classroom
 */
export const getClassroomUnits = async (
  classroomId: string
): Promise<Unit[]> => {
  const { data } = await api.get(
    API_CONFIG.ENDPOINTS.CLASSROOM.UNITS(classroomId)
  );
  return data;
};

/**
 * Get enrolled and available students for a classroom
 */
export const getClassroomStudents = async (
  classroomId: string
): Promise<ClassroomStudentsResponse> => {
  const { data } = await api.get(
    API_CONFIG.ENDPOINTS.CLASSROOM.STUDENTS(classroomId)
  );
  return data;
};

/**
 * Get enrolled students for a classroom
 */
export const getEnrolledStudents = async (
  classroomId: string
): Promise<Student[]> => {
  const { data } = await api.get(
    API_CONFIG.ENDPOINTS.CLASSROOM.ENROLLED_STUDENTS(classroomId)
  );
  return data;
};

/**
 * Get eligible students for a classroom (those who can be added)
 */
export const getEligibleStudents = async (
  classroomId: string
): Promise<Student[]> => {
  const { data } = await api.get(
    API_CONFIG.ENDPOINTS.CLASSROOM.ELIGIBLE_STUDENTS(classroomId)
  );
  return data;
};

/**
 * Add a single student to classroom
 */
export const addStudentToClassroom = async (
  payload: JoinClassroomPayload
): Promise<{ message: string }> => {
  const { data } = await api.post(API_CONFIG.ENDPOINTS.CLASSROOM.JOIN, payload);
  return data;
};

/**
 * Remove a single student from classroom
 */
export const removeStudentFromClassroom = async (
  payload: LeaveClassroomPayload
): Promise<{ message: string }> => {
  const { data } = await api.post(
    API_CONFIG.ENDPOINTS.CLASSROOM.LEAVE,
    payload
  );
  return data;
};

/**
 * Add multiple students to classroom at once
 */
export const bulkAddStudentsToClassroom = async (
  payload: BulkJoinClassroomPayload
): Promise<{ message: string; addedCount: number }> => {
  const { data } = await api.post(
    API_CONFIG.ENDPOINTS.CLASSROOM.BULK_JOIN,
    payload
  );
  return data;
};

/**
 * Remove multiple students from classroom at once
 */
export const bulkRemoveStudentsFromClassroom = async (
  payload: BulkLeaveClassroomPayload
): Promise<{ message: string; removedCount: number }> => {
  const { data } = await api.post(
    API_CONFIG.ENDPOINTS.CLASSROOM.BULK_LEAVE,
    payload
  );
  return data;
};
