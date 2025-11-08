/**
 * API Configuration
 * Central configuration for all API-related settings
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  TIMEOUT: 30000, // 30 seconds

  // Endpoints
  ENDPOINTS: {
    AUTH: {
      SIGNIN: "/auth/signin",
      SIGNUP: "/auth/signup",
      LOGOUT: "/auth/logout",
      ME: "/auth/me",
      FORGOT_PASSWORD: "/auth/forgot-password",
      RESET_PASSWORD: "/auth/reset-password",
    },
    CLASSROOM: {
      BASE: "/classroom",
      JOIN: "/classroom/join",
      LEAVE: "/classroom/leave",
      BULK_JOIN: "/classroom/bulk-join",
      BULK_LEAVE: "/classroom/bulk-leave",
      STUDENTS: (classroomId: string) => `/classroom/${classroomId}/students`,
      ENROLLED_STUDENTS: (classroomId: string) =>
        `/classroom/enrolled-students/${classroomId}`,
      ELIGIBLE_STUDENTS: (classroomId: string) =>
        `/classroom/eligible-students/${classroomId}`,
      UNITS: (classroomId: string) => `/classroom/${classroomId}/units`,
      DETAIL: (classroomId: string) => `/classroom/${classroomId}`,
    },
    UNIT: {
      BASE: "/unit",
      DETAIL: (unitId: string) => `/unit/${unitId}`,
    },
    THREADS: {
      BASE: "/threads",
      DETAIL: (threadId: string) => `/threads/${threadId}`,
      UNIT: (unitId: string) => `/threads/unit/${unitId}`,
      REPLY: (threadId: string) => `/threads/${threadId}/reply`,
      LIKE: (id: string) => `/threads/like/${id}`,
      ACCEPT_ANSWER: (threadId: string, replyId: string) =>
        `/threads/${threadId}/accept-answer/${replyId}`,
    },
    CONTENT: {
      BASE: (unitId: string) => `/educational-content/${unitId}`,
      DETAIL: (contentId: string) => `/educational-content/${contentId}`,
    },
    LIKES: {
      BASE: "/likes",
      DETAIL: (likeId: string) => `/likes/${likeId}`,
    },
    COLLEGE: "/college",
    DEPARTMENT: "/department",
    YEAR: "/year",
  },
} as const;

export default API_CONFIG;
