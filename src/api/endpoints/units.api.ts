/**
 * Units and Content API Endpoints
 * All unit and educational content-related API calls
 */

import { API_CONFIG } from "../../config/api.config";
import api from "../../lib/api";
import { ContentType, EducationalContent, Unit } from "../../types";

// ==================== Types ====================

export interface CreateUnitPayload {
  name: string;
  classroomId: string;
  description?: string;
  educationalContents?: {
    contentType: ContentType;
    url: string;
  }[];
}

export interface UpdateUnitPayload {
  name?: string;
  description?: string;
}

export interface CreateContentPayload {
  type: ContentType;
  content: string | File;
}

export interface UpdateContentPayload {
  type: ContentType;
  content: string;
}

// ==================== API Functions ====================

/**
 * Get all units for a classroom
 */
export const getUnits = async (classroomId: string): Promise<Unit[]> => {
  const { data } = await api.get(
    API_CONFIG.ENDPOINTS.CLASSROOM.UNITS(classroomId)
  );
  return data;
};

/**
 * Create new unit
 */
export const createUnit = async (payload: CreateUnitPayload): Promise<Unit> => {
  const { data } = await api.post(API_CONFIG.ENDPOINTS.UNIT.BASE, payload);
  return data;
};

/**
 * Update unit
 */
export const updateUnit = async (
  unitId: string,
  payload: UpdateUnitPayload
): Promise<Unit> => {
  const { data } = await api.put(
    API_CONFIG.ENDPOINTS.UNIT.DETAIL(unitId),
    payload
  );
  return data;
};

/**
 * Delete unit
 */
export const deleteUnit = async (unitId: string): Promise<void> => {
  await api.delete(API_CONFIG.ENDPOINTS.UNIT.DETAIL(unitId));
};

/**
 * Create educational content for a unit
 */
export const createContent = async (
  unitId: string,
  payload: CreateContentPayload
): Promise<EducationalContent> => {
  if (
    payload.type === ContentType.DOCUMENT &&
    payload.content instanceof File
  ) {
    // Handle file upload
    const formData = new FormData();
    formData.append("type", payload.type);
    formData.append("file", payload.content);

    const { data } = await api.post(
      API_CONFIG.ENDPOINTS.CONTENT.BASE(unitId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  } else {
    // Handle text-based content
    const { data } = await api.post(API_CONFIG.ENDPOINTS.CONTENT.BASE(unitId), {
      type: payload.type,
      content: payload.content,
    });
    return data;
  }
};

/**
 * Update educational content
 */
export const updateContent = async (
  contentId: string,
  payload: UpdateContentPayload
): Promise<EducationalContent> => {
  const { data } = await api.put(
    API_CONFIG.ENDPOINTS.CONTENT.DETAIL(contentId),
    payload
  );
  return data;
};

/**
 * Delete educational content
 */
export const deleteContent = async (contentId: string): Promise<void> => {
  await api.delete(API_CONFIG.ENDPOINTS.CONTENT.DETAIL(contentId));
};

/**
 * Upload file content
 */
export const uploadFile = async (
  unitId: string,
  file: File
): Promise<EducationalContent> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", ContentType.DOCUMENT);

  const { data } = await api.post(
    API_CONFIG.ENDPOINTS.CONTENT.BASE(unitId),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};
