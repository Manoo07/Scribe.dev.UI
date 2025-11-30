/**
 * Classroom Mutation Hooks
 * Custom hooks for classroom-related mutations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addStudentToClassroom,
  bulkAddStudentsToClassroom,
  BulkJoinClassroomPayload,
  BulkLeaveClassroomPayload,
  bulkRemoveStudentsFromClassroom,
  createClassroom,
  CreateClassroomPayload,
  deleteClassroom,
  joinClassroom,
  JoinClassroomPayload,
  LeaveClassroomPayload,
  removeStudentFromClassroom,
  updateClassroom,
  UpdateClassroomPayload,
} from "../../api/endpoints/classroom.api";
import { classroomKeys } from "./useClassroomQueries";

// ==================== Mutations ====================

/**
 * Hook to create new classroom
 * @example
 * const createMutation = useCreateClassroomMutation();
 * createMutation.mutate(classroomData, {
 *   onSuccess: (classroom) => console.log("Created:", classroom)
 * });
 */
export const useCreateClassroomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClassroomPayload) => createClassroom(payload),
    onSuccess: () => {
      // Invalidate classrooms list to refetch and show the new classroom
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() });
      // Don't navigate - let user click on the classroom to view details
    },
    onError: (error: any) => {
      console.error(
        "Create classroom failed:",
        error?.response?.data || error.message
      );
    },
  });
};

/**
 * Hook to update classroom
 * @example
 * const updateMutation = useUpdateClassroomMutation();
 * updateMutation.mutate({ classroomId, payload }, {
 *   onSuccess: () => console.log("Updated successfully")
 * });
 */
export const useUpdateClassroomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classroomId,
      payload,
    }: {
      classroomId: string;
      payload: UpdateClassroomPayload;
    }) => updateClassroom(classroomId, payload),
    onSuccess: (_, { classroomId }) => {
      // Invalidate specific classroom and list
      queryClient.invalidateQueries({
        queryKey: classroomKeys.detail(classroomId),
      });
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() });
    },
    onError: (error: any) => {
      console.error(
        "Update classroom failed:",
        error?.response?.data || error.message
      );
    },
  });
};

/**
 * Hook to delete classroom
 * @example
 * const deleteMutation = useDeleteClassroomMutation();
 * deleteMutation.mutate(classroomId, {
 *   onSuccess: () => console.log("Deleted successfully")
 * });
 */
export const useDeleteClassroomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classroomId: string) => deleteClassroom(classroomId),
    onSuccess: (_, classroomId) => {
      // Remove classroom from cache
      queryClient.removeQueries({
        queryKey: classroomKeys.detail(classroomId),
      });

      // Invalidate classrooms list
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() });

      // Navigate back to classrooms list
      // navigate("/dashboard/classrooms");
    },
    onError: (error: any) => {
      console.error(
        "Delete classroom failed:",
        error?.response?.data || error.message
      );
    },
  });
};

/**
 * Hook to join classroom using code
 * @example
 * const joinMutation = useJoinClassroomMutation();
 * joinMutation.mutate({ classroomCode }, {
 *   onSuccess: (data) => console.log("Joined:", data.classroom)
 * });
 */
export const useJoinClassroomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JoinClassroomPayload) => joinClassroom(payload),
    onSuccess: () => {
      // Invalidate classrooms list to show new classroom
      queryClient.invalidateQueries({ queryKey: classroomKeys.lists() });
      // Don't auto-navigate - user can click to view the classroom
    },
    onError: (error: any) => {
      console.error(
        "Join classroom failed:",
        error?.response?.data || error.message
      );
    },
  });
};

/**
 * Hook to add a single student to classroom
 * @example
 * const addStudentMutation = useAddStudentMutation();
 * addStudentMutation.mutate({ classroomId, userId }, {
 *   onSuccess: () => toast.success("Student added successfully")
 * });
 */
export const useAddStudentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JoinClassroomPayload) =>
      addStudentToClassroom(payload),
    onSuccess: (_, { classroomId }) => {
      // Invalidate students lists for this classroom
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "students"],
      });
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "enrolled-students"],
      });
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "eligible-students"],
      });
      // Invalidate classroom details to update student count
      queryClient.invalidateQueries({
        queryKey: classroomKeys.detail(classroomId),
      });
    },
    onError: (error: any) => {
      console.error(
        "Add student failed:",
        error?.response?.data || error.message
      );
    },
  });
};

/**
 * Hook to remove a single student from classroom
 * @example
 * const removeStudentMutation = useRemoveStudentMutation();
 * removeStudentMutation.mutate({ classroomId, userId }, {
 *   onSuccess: () => toast.success("Student removed successfully")
 * });
 */
export const useRemoveStudentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LeaveClassroomPayload) =>
      removeStudentFromClassroom(payload),
    onSuccess: (_, { classroomId }) => {
      // Invalidate students lists for this classroom
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "students"],
      });
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "enrolled-students"],
      });
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "eligible-students"],
      });
      // Invalidate classroom details to update student count
      queryClient.invalidateQueries({
        queryKey: classroomKeys.detail(classroomId),
      });
    },
    onError: (error: any) => {
      console.error(
        "Remove student failed:",
        error?.response?.data || error.message
      );
    },
  });
};

/**
 * Hook to add multiple students to classroom at once
 * @example
 * const bulkAddMutation = useBulkAddStudentsMutation();
 * bulkAddMutation.mutate({ classroomId, userIds: ['id1', 'id2'] }, {
 *   onSuccess: (data) => toast.success(`${data.addedCount} students added`)
 * });
 */
export const useBulkAddStudentsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkJoinClassroomPayload) =>
      bulkAddStudentsToClassroom(payload),
    onSuccess: (_, { classroomId }) => {
      // Invalidate students lists for this classroom
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "students"],
      });
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "enrolled-students"],
      });
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "eligible-students"],
      });
      // Invalidate classroom details to update student count
      queryClient.invalidateQueries({
        queryKey: classroomKeys.detail(classroomId),
      });
    },
    onError: (error: any) => {
      console.error(
        "Bulk add students failed:",
        error?.response?.data || error.message
      );
    },
  });
};

/**
 * Hook to remove multiple students from classroom at once
 * @example
 * const bulkRemoveMutation = useBulkRemoveStudentsMutation();
 * bulkRemoveMutation.mutate({ classroomId, userIds: ['id1', 'id2'] }, {
 *   onSuccess: (data) => toast.success(`${data.removedCount} students removed`)
 * });
 */
export const useBulkRemoveStudentsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkLeaveClassroomPayload) =>
      bulkRemoveStudentsFromClassroom(payload),
    onSuccess: (_, { classroomId }) => {
      // Invalidate students lists for this classroom
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "students"],
      });
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "enrolled-students"],
      });
      queryClient.invalidateQueries({
        queryKey: ["classrooms", classroomId, "eligible-students"],
      });
      // Invalidate classroom details to update student count
      queryClient.invalidateQueries({
        queryKey: classroomKeys.detail(classroomId),
      });
    },
    onError: (error: any) => {
      console.error(
        "Bulk remove students failed:",
        error?.response?.data || error.message
      );
    },
  });
};
