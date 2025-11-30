/**
 * Units and Content Hooks
 * Custom hooks for units and educational content
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContent,
  CreateContentPayload,
  createUnit,
  CreateUnitPayload,
  deleteContent,
  deleteUnit,
  getUnits,
  updateContent,
  UpdateContentPayload,
  updateUnit,
  UpdateUnitPayload,
  uploadFile,
} from "../../api/endpoints/units.api";
import { classroomKeys } from "../classroom/useClassroomQueries";

// ==================== Query Keys ====================
export const unitKeys = {
  all: ["units"] as const,
  lists: () => [...unitKeys.all, "list"] as const,
  list: (classroomId?: string) => [...unitKeys.lists(), classroomId] as const,
};

// ==================== Queries ====================

/**
 * Hook to get units for a classroom
 * @example
 * const { data: units, isLoading } = useUnitsQuery(classroomId);
 */
export const useUnitsQuery = (classroomId?: string) => {
  return useQuery({
    queryKey: unitKeys.list(classroomId),
    queryFn: () => getUnits(classroomId!),
    enabled: !!classroomId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ==================== Unit Mutations ====================

/**
 * Hook to create new unit
 */
export const useCreateUnitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUnitPayload) => createUnit(payload),
    onSuccess: (_, { classroomId }) => {
      // Invalidate units list and classroom units
      queryClient.invalidateQueries({ queryKey: unitKeys.list(classroomId) });
      queryClient.invalidateQueries({
        queryKey: classroomKeys.units(classroomId),
      });
    },
  });
};

/**
 * Hook to update unit
 */
export const useUpdateUnitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      payload,
      classroomId,
    }: {
      unitId: string;
      payload: UpdateUnitPayload;
      classroomId: string;
    }) => updateUnit(unitId, payload),
    onSuccess: (_, { classroomId }) => {
      // Invalidate units list
      queryClient.invalidateQueries({ queryKey: unitKeys.list(classroomId) });
      queryClient.invalidateQueries({
        queryKey: classroomKeys.units(classroomId),
      });
    },
  });
};

/**
 * Hook to delete unit
 */
export const useDeleteUnitMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      classroomId,
    }: {
      unitId: string;
      classroomId: string;
    }) => deleteUnit(unitId),
    onSuccess: (_, { classroomId }) => {
      // Invalidate units list
      queryClient.invalidateQueries({ queryKey: unitKeys.list(classroomId) });
      queryClient.invalidateQueries({
        queryKey: classroomKeys.units(classroomId),
      });
    },
  });
};

// ==================== Content Mutations ====================

/**
 * Hook to create educational content
 */
export const useCreateContentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      payload,
      classroomId,
    }: {
      unitId: string;
      payload: CreateContentPayload;
      classroomId: string;
    }) => createContent(unitId, payload),
    onSuccess: (_, { classroomId }) => {
      // Invalidate units to refresh content
      queryClient.invalidateQueries({ queryKey: unitKeys.list(classroomId) });
      queryClient.invalidateQueries({
        queryKey: classroomKeys.units(classroomId),
      });
    },
  });
};

/**
 * Hook to update educational content
 */
export const useUpdateContentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentId,
      payload,
      classroomId,
    }: {
      contentId: string;
      payload: UpdateContentPayload;
      classroomId: string;
    }) => updateContent(contentId, payload),
    onSuccess: (_, { classroomId }) => {
      // Invalidate units to refresh content
      queryClient.invalidateQueries({ queryKey: unitKeys.list(classroomId) });
      queryClient.invalidateQueries({
        queryKey: classroomKeys.units(classroomId),
      });
    },
  });
};

/**
 * Hook to delete educational content
 */
export const useDeleteContentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentId,
      classroomId,
    }: {
      contentId: string;
      classroomId: string;
    }) => deleteContent(contentId),
    onSuccess: (_, { classroomId }) => {
      // Invalidate units to refresh content
      queryClient.invalidateQueries({ queryKey: unitKeys.list(classroomId) });
      queryClient.invalidateQueries({
        queryKey: classroomKeys.units(classroomId),
      });
    },
  });
};

/**
 * Hook to upload file content
 */
export const useUploadFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      file,
      classroomId,
    }: {
      unitId: string;
      file: File;
      classroomId: string;
    }) => uploadFile(unitId, file),
    onSuccess: (_, { classroomId }) => {
      // Invalidate units to refresh content
      queryClient.invalidateQueries({ queryKey: unitKeys.list(classroomId) });
      queryClient.invalidateQueries({
        queryKey: classroomKeys.units(classroomId),
      });
    },
  });
};
