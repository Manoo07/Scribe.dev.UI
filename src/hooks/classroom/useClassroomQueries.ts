/**
 * Classroom Query Hooks
 * Custom hooks for classroom-related data fetching
 */

import { useQuery } from "@tanstack/react-query";
import {
  getClassroom,
  getClassrooms,
  getClassroomStudents,
  getClassroomUnits,
  getEnrolledStudents,
  getEligibleStudents,
} from "../../api/endpoints/classroom.api";

// ==================== Query Keys ====================
export const classroomKeys = {
  all: ["classrooms"] as const,
  lists: () => [...classroomKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...classroomKeys.lists(), filters] as const,
  details: () => [...classroomKeys.all, "detail"] as const,
  detail: (id: string) => [...classroomKeys.details(), id] as const,
  units: (id: string) => [...classroomKeys.detail(id), "units"] as const,
};

// ==================== Queries ====================

/**
 * Hook to get all classrooms for current user
 * @example
 * const { data: classrooms, isLoading, error } = useClassroomsQuery();
 */
export const useClassroomsQuery = () => {
  return useQuery({
    queryKey: classroomKeys.list(),
    queryFn: getClassrooms,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get single classroom by ID
 * @example
 * const { data: classroom, isLoading } = useClassroomQuery(classroomId);
 */
export const useClassroomQuery = (classroomId?: string) => {
  return useQuery({
    queryKey: classroomKeys.detail(classroomId!),
    queryFn: () => getClassroom(classroomId!),
    enabled: !!classroomId, // Only fetch if classroomId is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Get units for a specific classroom
 */
export const useClassroomUnitsQuery = (classroomId: string) => {
  return useQuery({
    queryKey: ["classrooms", classroomId, "units"],
    queryFn: () => getClassroomUnits(classroomId),
    enabled: !!classroomId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get enrolled and available students for a classroom
 */
export const useClassroomStudentsQuery = (classroomId: string) => {
  return useQuery({
    queryKey: ["classrooms", classroomId, "students"],
    queryFn: () => getClassroomStudents(classroomId),
    enabled: !!classroomId,
    staleTime: 2 * 60 * 1000, // 2 minutes (students data changes more frequently)
  });
};

/**
 * Get enrolled students for a classroom
 */
export const useEnrolledStudentsQuery = (classroomId: string) => {
  return useQuery({
    queryKey: ["classrooms", classroomId, "enrolled-students"],
    queryFn: () => getEnrolledStudents(classroomId),
    enabled: !!classroomId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get eligible students for a classroom (those who can be added)
 */
export const useEligibleStudentsQuery = (classroomId: string) => {
  return useQuery({
    queryKey: ["classrooms", classroomId, "eligible-students"],
    queryFn: () => getEligibleStudents(classroomId),
    enabled: !!classroomId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
