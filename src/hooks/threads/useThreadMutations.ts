/**
 * Thread Mutation Hooks
 * Custom hooks for thread-related mutations
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acceptAnswer,
  createReply,
  CreateReplyPayload,
  createThread,
  CreateThreadPayload,
  deleteReply,
  deleteThread,
  toggleReplyLike,
  toggleThreadLike,
  unmarkAnswer,
  updateReply,
  updateThread,
  UpdateThreadPayload,
} from "../../api/endpoints/threads.api";
import { threadKeys } from "./useThreadQueries";

// ==================== Thread Mutations ====================

/**
 * Hook to create new thread
 * @example
 * const createMutation = useCreateThreadMutation();
 * createMutation.mutate(threadData);
 */
export const useCreateThreadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateThreadPayload) => createThread(payload),
    onSuccess: () => {
      // Invalidate threads list to show new thread
      queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
    },
  });
};

/**
 * Hook to update thread
 */
export const useUpdateThreadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      payload,
    }: {
      threadId: string;
      payload: UpdateThreadPayload;
    }) => updateThread(threadId, payload),
    onSuccess: (_, { threadId }) => {
      // Invalidate specific thread and lists
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
      queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
    },
  });
};

/**
 * Hook to delete thread
 */
export const useDeleteThreadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threadId: string) => deleteThread(threadId),
    onSuccess: (_, threadId) => {
      // Remove thread from cache
      queryClient.removeQueries({ queryKey: threadKeys.detail(threadId) });

      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
    },
  });
};

/**
 * Hook to toggle like on thread
 */
export const useToggleThreadLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threadId: string) => toggleThreadLike(threadId),
    onSuccess: (_, threadId) => {
      // Invalidate thread to update like count
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
      queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
    },
  });
};

// ==================== Reply Mutations ====================

/**
 * Hook to create reply on thread
 */
export const useCreateReplyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReplyPayload) => createReply(payload),
    onSuccess: (_, { threadId }) => {
      // Invalidate thread to show new reply
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
      queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
    },
  });
};

/**
 * Hook to update reply
 */
export const useUpdateReplyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      replyId,
      content,
    }: {
      threadId: string;
      replyId: string;
      content: string;
    }) => updateReply(threadId, replyId, content),
    onSuccess: (_, { threadId }) => {
      // Invalidate thread to update reply
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
    },
  });
};

/**
 * Hook to delete reply
 */
export const useDeleteReplyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      replyId,
    }: {
      threadId: string;
      replyId: string;
    }) => deleteReply(threadId, replyId),
    onSuccess: (_, { threadId }) => {
      // Invalidate thread to remove reply
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
      queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
    },
  });
};

/**
 * Hook to toggle like on reply
 */
export const useToggleReplyLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      replyId,
    }: {
      threadId: string;
      replyId: string;
    }) => toggleReplyLike(replyId),
    onSuccess: (_, { threadId }) => {
      // Invalidate thread to update reply like count
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
    },
  });
};

// ==================== Answer Mutations ====================

/**
 * Hook to accept answer (mark reply as solution)
 */
export const useAcceptAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      replyId,
    }: {
      threadId: string;
      replyId: string;
    }) => acceptAnswer(threadId, replyId),
    onSuccess: (_, { threadId }) => {
      // Invalidate thread to show accepted answer
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
      queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
    },
  });
};

/**
 * Hook to unmark answer (remove solution)
 */
export const useUnmarkAnswerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      replyId,
    }: {
      threadId: string;
      replyId: string;
    }) => unmarkAnswer(threadId, replyId),
    onSuccess: (_, { threadId }) => {
      // Invalidate thread to remove accepted answer
      queryClient.invalidateQueries({ queryKey: threadKeys.detail(threadId) });
      queryClient.invalidateQueries({ queryKey: threadKeys.lists() });
    },
  });
};
