/**
 * Classroom Hooks - Barrel Export
 * Central export for all classroom-related hooks
 */

// Query hooks
export {
  classroomKeys,
  useClassroomQuery,
  useClassroomStudentsQuery,
  useClassroomUnitsQuery,
  useClassroomsQuery,
  useEnrolledStudentsQuery,
  useEligibleStudentsQuery,
} from "./useClassroomQueries";

// Mutation hooks
export {
  useAddStudentMutation,
  useBulkAddStudentsMutation,
  useBulkRemoveStudentsMutation,
  useCreateClassroomMutation,
  useDeleteClassroomMutation,
  useJoinClassroomMutation,
  useRemoveStudentMutation,
  useUpdateClassroomMutation,
} from "./useClassroomMutations";
