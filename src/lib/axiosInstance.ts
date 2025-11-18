/**
 * Axios Instance Configuration
 * Centralized axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_CONFIG } from "../config/api.config";

// Get token from localStorage
const getToken = (): string | null => localStorage.getItem("token");

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add authentication token to all requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;

      // Debug logging for specific endpoints (optional - can be removed in production)
      if (config.url?.includes("/like") || config.url?.includes("/likes")) {
        console.log("🔐 Token being sent for like request:", {
          url: config.url,
          method: config.method,
          hasToken: !!token,
          tokenLength: token.length,
        });
      }
    } else if (!token) {
      console.warn("⚠️ No token found for request:", config.url);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle authentication errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      console.log("Authentication error detected:", error.response.status);

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");

      // Dispatch custom event to notify the app about authentication failure
      // This will be handled by the AuthContext to show the session expiry modal
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/signup"
      ) {
        const authErrorEvent = new CustomEvent("auth-error", {
          detail: {
            status: error.response?.status,
            message:
              error.response?.status === 401
                ? "Your session has expired. Please login again."
                : "Access denied. Please login again.",
          },
        });
        window.dispatchEvent(authErrorEvent);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
