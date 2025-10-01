// Toggle like for a thread (POST /threads/like/:threadId)
export const toggleThreadLike = async (threadId: string): Promise<any> => {
  try {
    console.log("Hello test toggle threadLike");
    console.log(threadId);
    const response = await api.post(`/threads/like/${threadId}`);
    return response.data;
  } catch (error) {
    console.error("Error toggling thread like:", error);
    throw error;
  }
};
// Accept answer for a thread
export const acceptAnswer = async (
  threadId: string,
  replyId: string
): Promise<void> => {
  try {
    await api.patch(`/threads/${threadId}/accept-answer/${replyId}`);
  } catch (error) {
    console.error("Error accepting answer:", error);
    throw error;
  }
};
// Delete a thread
export const deleteThread = async (threadId: string): Promise<void> => {
  try {
    await api.delete(`/threads/${threadId}`);
  } catch (error) {
    console.error("Error deleting thread:", error);
    throw error;
  }
};
// Fetch thread detail (with replies, paginated)
export const fetchThreadDetail = async (
  threadId: string,
  page = 1,
  limit = 10
): Promise<any> => {
  try {
    const response = await api.get(
      `/threads/${threadId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching thread detail:", error);
    throw error;
  }
};
// Fetch generic threads (all, paginated)
export const fetchThreads = async (page = 1, limit = 10): Promise<any> => {
  try {
    const response = await api.get(`/threads?page=${page}&limit=${limit}`);
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
// Create a new thread (unit-based or generic)
export const createThread = async (data: {
  title: string;
  content: string;
  unitId?: string;
}): Promise<any> => {
  try {
    const payload: any = {
      title: data.title,
      content: data.content,
    };
    if (data.unitId) payload.unitId = data.unitId;
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
import axios from "axios";
import { LikeRequest, LikeResponse } from "../components/threads/threadTypes";
import { ContentType, Unit } from "../types";
import { mockUnits } from "./mockData";

// Base URL for API requests
const API_BASE_URL = "http://localhost:3000/api/v1";

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Create axios instance with default headers
const api = axios.create({
  baseURL: API_BASE_URL,
});

interface UpdateContentPayload {
  type: ContentType;
  content: string;
}

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions

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
    const token = localStorage.getItem("token");
    const response = await api.post("/unit", data, {
      headers: {
        Authorization: `Bearer ${token}`,
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
    const response = await api.post("/likes", likeData);
    return response.data;
  } catch (error) {
    console.error("Error creating like:", error);
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

// Toggle like (like if not liked, unlike if already liked)
export const toggleLike = async (
  likeData: LikeRequest
): Promise<{ liked: boolean; likesCount: number; likeId?: string }> => {
  try {
    const response = await api.post("/likes/toggle", likeData);
    return response.data;
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};
