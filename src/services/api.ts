import axios from "axios";
import { Unit, ContentType } from "../types";
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
  description: string;
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
  name: string
): Promise<Unit> => {
  try {
    const response = await api.put(`/units/${unitId}`, { name });
    return response.data;
  } catch (error) {
    console.error("Error updating unit:", error);
    throw error;
  }
};

// Delete a unit
export const deleteUnit = async (unitId: string): Promise<void> => {
  try {
    await api.delete(`/units/${unitId}`);
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
