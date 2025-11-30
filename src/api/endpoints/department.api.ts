/**
 * Department API Endpoints
 * All department-related API calls
 */

import { API_CONFIG } from "../../config/api.config";
import api from "../../lib/axiosInstance";

// ==================== Types ====================

export interface College {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  collegeId: string;
  createdAt: string;
  updatedAt: string;
  college: College;
}

export interface Year {
  id: string;
  name: string;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
  department: {
    id: string;
    name: string;
    collegeId: string;
    createdAt: string;
    updatedAt: string;
  };
}

// ==================== API Functions ====================

/**
 * Get all departments
 */
export const getDepartments = async (): Promise<Department[]> => {
  const { data } = await api.get(API_CONFIG.ENDPOINTS.DEPARTMENT);
  return data || [];
};

/**
 * Get years by department ID
 */
export const getYearsByDepartment = async (
  departmentId: string
): Promise<Year[]> => {
  const { data } = await api.get(
    `${API_CONFIG.ENDPOINTS.YEAR}?departmentId=${departmentId}`
  );
  return data || [];
};
