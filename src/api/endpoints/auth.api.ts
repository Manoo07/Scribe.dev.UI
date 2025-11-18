/**
 * Authentication API Endpoints
 * All auth-related API calls
 */

import { API_CONFIG } from "../../config/api.config";
import api from "../../lib/api";

// ==================== Types ====================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  collegeId: string;
  departmentId: string;
  yearId: string;
}

export interface SignupResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface CurrentUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

// ==================== API Functions ====================

/**
 * Login user
 */
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await api.post(API_CONFIG.ENDPOINTS.AUTH.SIGNIN, payload);
  return data;
};

/**
 * Signup new user
 */
export const signup = async (
  payload: SignupPayload
): Promise<SignupResponse> => {
  const { data } = await api.post(API_CONFIG.ENDPOINTS.AUTH.SIGNUP, payload);
  return data;
};

/**
 * Get current logged-in user info
 */
export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const { data } = await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
  return data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
};

/**
 * Request password reset
 */
export const forgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<{ message: string }> => {
  const { data } = await api.post(
    API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
    payload
  );
  return data;
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  payload: ResetPasswordPayload
): Promise<{ message: string }> => {
  const { data } = await api.post(
    API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
    payload
  );
  return data;
};

/**
 * Get colleges list
 */
export const getColleges = async (): Promise<
  Array<{ id: string; name: string }>
> => {
  const { data } = await api.get(API_CONFIG.ENDPOINTS.COLLEGE);
  return data;
};

/**
 * Get departments by college
 */
export const getDepartments = async (
  collegeId: string
): Promise<Array<{ id: string; name: string }>> => {
  const { data } = await api.get(
    `${API_CONFIG.ENDPOINTS.DEPARTMENT}?collegeId=${collegeId}`
  );
  return data;
};

/**
 * Get years by department
 */
export const getYears = async (
  departmentId: string
): Promise<Array<{ id: string; name: string }>> => {
  const { data } = await api.get(
    `${API_CONFIG.ENDPOINTS.YEAR}?departmentId=${departmentId}`
  );
  return data;
};
