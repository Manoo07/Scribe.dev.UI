// Toggle like for a thread or reply (POST /threads/like/:threadId)
export const toggleThreadLike = async (threadId: string, replyId?: string): Promise<any> => {
  try {
    console.log("Toggling like for:", { threadId, replyId });

    // Ensure token is valid and available
    ensureToken();

    const payload = replyId ? { replyId } : {};
    const response = await api.post(`/threads/like/${threadId}`, payload);
    console.log("Like toggled successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

// Toggle like for a reply (convenience function)
export const toggleReplyLike = async (threadId: string, replyId: string): Promise<any> => {
  return toggleThreadLike(threadId, replyId);
};
// Accept answer for a thread
export const acceptAnswer = async (
  threadId: string,
  replyId: string
): Promise<any> => {
  try {
    console.log("Accepting answer:", { threadId, replyId });

    // Ensure token is valid and available
    ensureToken();

    // Use the correct endpoint: /threads/:threadId/accept-answer/:replyId
    const response = await api.patch(
      `/threads/${threadId}/accept-answer/${replyId}`
    );
    console.log("Answer accepted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error accepting answer:", error);
    throw error;
  }
};

// Unmark answer for a thread (pass the currently accepted reply ID to toggle it off)
export const unmarkAnswer = async (
  threadId: string,
  replyId: string
): Promise<any> => {
  try {
    console.log("Unmarking answer:", { threadId, replyId });

    // Ensure token is valid and available
    ensureToken();

    // Use the same endpoint with the reply ID - backend will toggle it off
    const response = await api.patch(
      `/threads/${threadId}/accept-answer/${replyId}`
    );
    console.log("Answer unmarked successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error unmarking answer:", error);
    throw error;
  }
};
// Delete a thread
export const deleteThread = async (threadId: string): Promise<any> => {
  try {
    console.log("Deleting thread:", { threadId });

    // Ensure token is valid and available
    ensureToken();

    const response = await api.delete(`/threads/${threadId}`);
    console.log("Thread deleted successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting thread:", error);
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};
// Fetch thread detail (with replies, paginated)
export const fetchThreadDetail = async (
  threadId: string,
  page = 1,
  limit = 10,
  filters?: {
    sortBy?: string;
  }
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    if (filters?.sortBy) {
      params.append("sortBy", filters.sortBy);
    }

    console.log("API Call - fetchThreadDetail:", {
      url: `/threads/${threadId}?${params.toString()}`,
      threadId,
      page,
      limit,
      filters,
    });

    const response = await api.get(`/threads/${threadId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching thread detail:", error);
    throw error;
  }
};
// Fetch generic threads (all, paginated)
export const fetchThreads = async (
  page = 1,
  limit = 10,
  filters?: {
    sortBy?: string;
    limit?: number;
  }
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());

    if (filters?.sortBy) {
      params.append("sortBy", filters.sortBy);
    }
    if (filters?.limit) {
      params.append("limit", filters.limit.toString());
    } else {
      params.append("limit", limit.toString());
    }

    console.log("API Call - fetchThreads:", {
      url: `/threads?${params.toString()}`,
      filters,
      params: Object.fromEntries(params.entries()),
    });

    const response = await api.get(`/threads?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching threads:", error);
    throw error;
  }
};

// Fetch unit-based threads (paginated)
export const fetchUnitThreads = async (
  unitId: string,
  page = 1,
  limit = 10
): Promise<any> => {
  try {
    const response = await api.get(
      `/threads/unit/${unitId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching unit threads:", error);
    throw error;
  }
};

// Fetch classroom-based threads (paginated)
export const fetchClassroomThreads = async (
  classroomId: string,
  page = 1,
  limit = 10,
  filters?: {
    sortBy?: string;
    limit?: number;
  }
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append("classroomId", classroomId);
    params.append("page", page.toString());

    if (filters?.sortBy) {
      params.append("sortBy", filters.sortBy);
    }
    if (filters?.limit) {
      params.append("limit", filters.limit.toString());
    } else {
      params.append("limit", limit.toString());
    }

    console.log("API Call - fetchClassroomThreads:", {
      url: `/threads?${params.toString()}`,
      filters,
      params: Object.fromEntries(params.entries()),
    });

    const response = await api.get(`/threads?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching classroom threads:", error);
    throw error;
  }
};
// Create a new thread (unit-based or generic)
export const createThread = async (data: CreateThreadPayload): Promise<any> => {
  try {
    const payload: any = {
      title: data.title,
      content: data.content,
    };
    if (data.unitId) payload.unitId = data.unitId;
    if (data.classroomId) payload.classroomId = data.classroomId;
    const response = await api.post("/threads", payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
};
import {
  CreateReplyPayload,
  CreateThreadPayload,
  Like,
  LikeRequest,
  LikeResponse,
  ThreadReply,
} from "../components/threads/threadTypes";
import api from "../lib/axiosInstance";
import { ContentType, Unit } from "../types";
import { ensureToken } from "../utils/authUtils";
import { mockUnits } from "./mockData";

// Use the centralized axios instance

interface UpdateContentPayload {
  type: ContentType;
  content: string;
}

// API functions

// Get current user info
export const getCurrentUser = async () => {
  try {
    console.log("Getting current user info...");

    // Ensure token is valid and available
    ensureToken();

    const response = await api.get("/auth/me");
    console.log("Current user info retrieved:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error getting current user:", error);
    throw error;
  }
};

// Update thread
export const updateThread = async (
  threadId: string,
  updateData: { title?: string; content?: string }
) => {
  try {
    console.log("Updating thread:", { threadId, updateData });

    // Ensure token is valid and available
    ensureToken();

    const response = await api.patch(`/threads/${threadId}`, updateData);
    console.log("Thread updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating thread:", error);
    throw error;
  }
};

// Update reply
export const updateReply = async (
  threadId: string,
  replyId: string,
  content: string
) => {
  try {
    console.log("Updating reply:", { threadId, replyId, content });

    // Ensure token is valid and available
    ensureToken();

    // According to user requirement: use /threads/:threadId with content payload
    const response = await api.patch(`/threads/${threadId}`, {
      content,
      replyId, // Include replyId in payload if backend needs it
    });

    console.log(" Reply updated successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(" Error updating reply:", error);
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

// Get all units for a classroom
export const getUnits = async (classroomId: string): Promise<Unit[]> => {
  try {
    const response = await api.get(`/classroom/${classroomId}/units`);
    return response.data;
  } catch (error) {
    console.error("Error fetching units:", error);
    // Return mock data for demonstration purposes
    return mockUnits;
  }
};

// Create a new unit
export const createUnit = async (data: {
  name: string;
  classroomId: string;
  description?: string;
  educationalContents?: {
    contentType: "DOCUMENT" | "NOTE" | "VIDEO" | "LINK";
    url: string;
  }[];
}): Promise<Unit> => {
  try {
    // Token is automatically added by the request interceptor
    const response = await api.post("/unit", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Response :", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating unit:", error);
    throw error;
  }
};

// Update a unit
export const updateUnit = async (
  unitId: string,
  name: string,
  description?: string
): Promise<Unit> => {
  try {
    const response = await api.put(`/unit/${unitId}`, { name, description });
    return response.data;
  } catch (error) {
    console.error("Error updating unit:", error);
    throw error;
  }
};

// Delete a unit
export const deleteUnit = async (unitId: string): Promise<void> => {
  try {
    await api.delete(`/unit/${unitId}`);
  } catch (error) {
    console.error("Error deleting unit:", error);
    throw error;
  }
};

// Create text-based content (note, link, video)
export const createContent = async (
  unitId: string,
  type: ContentType,
  content: string | File
): Promise<void> => {
  try {
    if (type === ContentType.DOCUMENT && content instanceof File) {
      // Handle file upload
      const formData = new FormData();
      formData.append("type", type);
      formData.append("file", content);

      const res = await api.post(`/educational-content/${unitId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response :", res);
    } else {
      // Handle string-based content
      const res = await api.post(`/educational-content/${unitId}`, {
        type,
        content,
      });
      console.log("Response :", res);
    }
  } catch (error) {
    console.error("Error creating content:", error);
    throw error;
  }
};

// Upload file content
export const uploadFile = async (unitId: string, file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", ContentType.DOCUMENT);

    await api.post(`/units/${unitId}/contents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Delete content
export const deleteContent = async (contentId: string): Promise<void> => {
  try {
    await api.delete(`/educational-content/${contentId}`);
  } catch (error) {
    console.error("Error deleting content:", error);
    throw error;
  }
};

// Update content
export const updateContent = async (
  contentId: string,
  payload: UpdateContentPayload
): Promise<void> => {
  try {
    await api.put(`/educational-content/${contentId}`, payload);
  } catch (error) {
    console.error("Error updating content:", error);
    throw error;
  }
};

// ============= LIKES API =============

// Like a thread or reply
export const createLike = async (
  likeData: LikeRequest
): Promise<LikeResponse> => {
  try {
    console.log(" Creating like for:", likeData);

    // Ensure token is valid and available
    ensureToken();

    const response = await api.post("/likes", likeData);
    console.log(" Like created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(" Error creating like:", error);
    throw error;
  }
};

// Unlike a thread or reply
export const deleteLike = async (likeId: string): Promise<void> => {
  try {
    await api.delete(`/likes/${likeId}`);
  } catch (error) {
    console.error("Error deleting like:", error);
    throw error;
  }
};

// Get likes for a specific thread
export const getThreadLikes = async (threadId: string): Promise<Like[]> => {
  try {
    const response = await api.get(`/threads/${threadId}/likes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching thread likes:", error);
    throw error;
  }
};

// Get likes for a specific reply
export const getReplyLikes = async (replyId: string): Promise<Like[]> => {
  try {
    const response = await api.get(`/replies/${replyId}/likes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching reply likes:", error);
    throw error;
  }
};

// Check if current user can like content
export const checkLikePermission = (): {
  canLike: boolean;
  reason?: string;
} => {
  try {
    ensureToken();
    return { canLike: true };
  } catch (error: any) {
    return {
      canLike: false,
      reason: error.message || "Authentication required",
    };
  }
};

// ============= REPLIES API =============

// Create a new reply
export const createReply = async (
  replyData: CreateReplyPayload
): Promise<ThreadReply> => {
  try {
    console.log("Creating reply:", replyData);

    // Ensure token is valid and available
    ensureToken();

    // Use the correct endpoint: /threads/:threadId/reply
    const response = await api.post(`/threads/${replyData.threadId}/reply`, {
      content: replyData.content,
    });
    console.log("Reply created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating reply:", error);
    throw error;
  }
};

// Delete a reply
export const deleteReply = async (
  threadId: string,
  replyId: string
): Promise<void> => {
  try {
    console.log("Deleting reply:", { threadId, replyId });

    // Ensure token is valid and available
    ensureToken();

    // Use the endpoint structure: /threads/:threadId?replyId=${replyId}
    // This matches the user's requirement for the delete endpoint
    const response = await api.delete(
      `/threads/${threadId}?replyId=${replyId}`
    );
    console.log("Reply deleted successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting reply:", error);
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to delete reply";
    throw new Error(errorMessage);
  }
};
