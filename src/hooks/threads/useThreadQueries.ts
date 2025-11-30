/**
 * Threads Query Hooks
 * Custom hooks for thread-related data fetching
 */

import { useQuery } from "@tanstack/react-query";
import {
  getThread,
  getThreads,
  getUnitThreads,
  ThreadsQueryParams,
} from "../../api/endpoints/threads.api";

// ==================== Query Keys ====================
export const threadKeys = {
  all: ["threads"] as const,
  lists: () => [...threadKeys.all, "list"] as const,
  list: (params?: ThreadsQueryParams) =>
    [...threadKeys.lists(), params] as const,
  details: () => [...threadKeys.all, "detail"] as const,
  detail: (id: string, page?: number, sortBy?: string) =>
    [...threadKeys.details(), id, { page, sortBy }] as const,
  unitThreads: (unitId: string, page?: number) =>
    [...threadKeys.all, "unit", unitId, { page }] as const,
};

// ==================== Queries ====================

/**
 * Hook to get threads with filters and pagination
 * @example
 * const { data, isLoading } = useThreadsQuery({
 *   page: 1,
 *   limit: 10,
 *   sortBy: "recent",
 *   classroomId: "classroom123"
 * });
 */
export const useThreadsQuery = (params?: ThreadsQueryParams) => {
  return useQuery({
    queryKey: threadKeys.list(params),
    queryFn: () => getThreads(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};

/**
 * Hook to get single thread with replies
 * @example
 * const { data: threadDetail, isLoading } = useThreadQuery(threadId, page);
 */
export const useThreadQuery = (
  threadId?: string,
  page = 1,
  limit = 10,
  sortBy?: string
) => {
  return useQuery({
    queryKey: threadKeys.detail(threadId!, page, sortBy),
    queryFn: () => getThread(threadId!, page, limit, sortBy),
    enabled: !!threadId, // Only fetch if threadId is provided
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};

/**
 * Hook to get threads for a specific unit
 * @example
 * const { data: unitThreads } = useUnitThreadsQuery(unitId, page);
 */
export const useUnitThreadsQuery = (unitId?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: threadKeys.unitThreads(unitId!, page),
    queryFn: () => getUnitThreads(unitId!, page, limit),
    enabled: !!unitId, // Only fetch if unitId is provided
    staleTime: 1000 * 60 * 2, // 2 minutes
    placeholderData: (previousData) => previousData,
  });
};
