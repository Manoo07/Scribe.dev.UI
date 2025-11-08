/**
 * Threads API Endpoints
 * All thread and reply-related API calls
 */

import { API_CONFIG } from "../../config/api.config";
import axiosInstance from "../../lib/axiosInstance";

// ==================== Types ====================

export interface Thread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  classroomId?: string;
  unitId?: string;
  likesCount: number;
  repliesCount: number;
  isLiked: boolean;
  acceptedReplyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadReply {
  id: string;
  threadId: string;
  content: string;
  authorId: string;
  authorName: string;
  likesCount: number;
  isLiked: boolean;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadPayload {
  title: string;
  content: string;
  classroomId?: string;
  unitId?: string;
}

export interface UpdateThreadPayload {
  title?: string;
  content?: string;
}

export interface CreateReplyPayload {
  threadId: string;
  content: string;
}

export interface ThreadsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "recent" | "popular" | "unanswered";
  classroomId?: string;
  unitId?: string;
}

export interface ThreadsResponse {
  threads: Thread[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalThreads: number;
    hasMore: boolean;
  };
}

export interface ThreadDetailResponse {
  thread: Thread;
  replies: ThreadReply[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReplies: number;
    hasMore: boolean;
  };
}

// ==================== API Functions ====================

/**
 * Get threads with filters and pagination
 */
export const getThreads = async (
  params?: ThreadsQueryParams
): Promise<ThreadsResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.classroomId)
    searchParams.append("classroomId", params.classroomId);
  if (params?.unitId) searchParams.append("unitId", params.unitId);

  const { data } = await axiosInstance.get(
    `${API_CONFIG.ENDPOINTS.THREADS.BASE}?${searchParams.toString()}`
  );
  return data;
};

/**
 * Get single thread with replies
 */
export const getThread = async (
  threadId: string,
  page = 1,
  limit = 10,
  sortBy?: string
): Promise<ThreadDetailResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.append("page", page.toString());
  searchParams.append("limit", limit.toString());
  if (sortBy) searchParams.append("sortBy", sortBy);

  const { data } = await axiosInstance.get(
    `${API_CONFIG.ENDPOINTS.THREADS.DETAIL(
      threadId
    )}?${searchParams.toString()}`
  );
  return data;
};

/**
 * Get threads for a specific unit
 */
export const getUnitThreads = async (
  unitId: string,
  page = 1,
  limit = 10
): Promise<ThreadsResponse> => {
  const { data } = await axiosInstance.get(
    `${API_CONFIG.ENDPOINTS.THREADS.UNIT(unitId)}?page=${page}&limit=${limit}`
  );
  return data;
};

/**
 * Create new thread
 */
export const createThread = async (
  payload: CreateThreadPayload
): Promise<Thread> => {
  const { data } = await axiosInstance.post(
    API_CONFIG.ENDPOINTS.THREADS.BASE,
    payload
  );
  return data;
};

/**
 * Update thread
 */
export const updateThread = async (
  threadId: string,
  payload: UpdateThreadPayload
): Promise<Thread> => {
  const { data } = await axiosInstance.patch(
    API_CONFIG.ENDPOINTS.THREADS.DETAIL(threadId),
    payload
  );
  return data;
};

/**
 * Delete thread
 */
export const deleteThread = async (threadId: string): Promise<void> => {
  await axiosInstance.delete(API_CONFIG.ENDPOINTS.THREADS.DETAIL(threadId));
};

/**
 * Toggle like on thread
 */
export const toggleThreadLike = async (
  threadId: string
): Promise<{ liked: boolean; likesCount: number }> => {
  const { data } = await axiosInstance.post(
    API_CONFIG.ENDPOINTS.THREADS.LIKE(threadId)
  );
  return data;
};

/**
 * Create reply on thread
 */
export const createReply = async (
  payload: CreateReplyPayload
): Promise<ThreadReply> => {
  const { data } = await axiosInstance.post(
    API_CONFIG.ENDPOINTS.THREADS.REPLY(payload.threadId),
    { content: payload.content }
  );
  return data;
};

/**
 * Update reply
 */
export const updateReply = async (
  threadId: string,
  replyId: string,
  content: string
): Promise<ThreadReply> => {
  const { data } = await axiosInstance.patch(
    API_CONFIG.ENDPOINTS.THREADS.DETAIL(threadId),
    { content, replyId }
  );
  return data;
};

/**
 * Delete reply
 */
export const deleteReply = async (
  threadId: string,
  replyId: string
): Promise<void> => {
  await axiosInstance.delete(
    `${API_CONFIG.ENDPOINTS.THREADS.DETAIL(threadId)}?replyId=${replyId}`
  );
};

/**
 * Toggle like on reply
 */
export const toggleReplyLike = async (
  replyId: string
): Promise<{ liked: boolean; likesCount: number }> => {
  const { data } = await axiosInstance.post(
    API_CONFIG.ENDPOINTS.THREADS.LIKE(replyId),
    { replyId }
  );
  return data;
};

/**
 * Accept answer (mark reply as solution)
 */
export const acceptAnswer = async (
  threadId: string,
  replyId: string
): Promise<Thread> => {
  const { data } = await axiosInstance.patch(
    API_CONFIG.ENDPOINTS.THREADS.ACCEPT_ANSWER(threadId, replyId)
  );
  return data;
};

/**
 * Unmark answer (remove solution)
 */
export const unmarkAnswer = async (
  threadId: string,
  replyId: string
): Promise<Thread> => {
  const { data } = await axiosInstance.patch(
    API_CONFIG.ENDPOINTS.THREADS.ACCEPT_ANSWER(threadId, replyId)
  );
  return data;
};
