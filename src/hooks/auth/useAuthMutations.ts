/**
 * Authentication Mutation Hooks
 * Custom hooks for auth-related mutations (login, signup, etc.)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  forgotPassword,
  ForgotPasswordPayload,
  login,
  LoginPayload,
  logout,
  resetPassword,
  ResetPasswordPayload,
  signup,
  SignupPayload,
} from "../../api/endpoints/auth.api";
import { authKeys } from "./useAuthQueries";

// ==================== Mutations ====================

/**
 * Hook to login user
 * @example
 * const loginMutation = useLoginMutation();
 * loginMutation.mutate({ email, password }, {
 *   onSuccess: (data) => console.log("Logged in:", data.user)
 * });
 */
export const useLoginMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("userId", data.user.id);

      // Invalidate current user query to refetch
      queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });

      // Navigate to dashboard root
      navigate("/dashboard");
    },
    onError: (error: any) => {
      console.error("Login failed:", error?.response?.data || error.message);
    },
  });
};

/**
 * Hook to signup new user
 * @example
 * const signupMutation = useSignupMutation();
 * signupMutation.mutate(signupData, {
 *   onSuccess: () => navigate("/login")
 * });
 */
export const useSignupMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: SignupPayload) => signup(payload),
    onSuccess: () => {
      // Navigate to login after successful signup
      navigate("/login");
    },
    onError: (error: any) => {
      console.error("Signup failed:", error?.response?.data || error.message);
    },
  });
};

/**
 * Hook to logout user
 * @example
 * const logoutMutation = useLogoutMutation();
 * logoutMutation.mutate();
 */
export const useLogoutMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");

      // Clear all queries from cache
      queryClient.clear();

      // Navigate to login
      navigate("/login");
    },
    onError: (error: any) => {
      console.error("Logout failed:", error?.response?.data || error.message);

      // Even if logout fails, clear local data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      queryClient.clear();
      navigate("/login");
    },
  });
};

/**
 * Hook to request password reset
 * @example
 * const forgotPasswordMutation = useForgotPasswordMutation();
 * forgotPasswordMutation.mutate({ email });
 */
export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
    onSuccess: (data) => {
      console.log("Password reset email sent:", data.message);
    },
    onError: (error: any) => {
      console.error(
        "Forgot password failed:",
        error?.response?.data || error.message
      );
    },
  });
};

/**
 * Hook to reset password with token
 * @example
 * const resetPasswordMutation = useResetPasswordMutation();
 * resetPasswordMutation.mutate({ token, newPassword });
 */
export const useResetPasswordMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
    onSuccess: () => {
      // Navigate to login after successful password reset
      navigate("/login");
    },
    onError: (error: any) => {
      console.error(
        "Reset password failed:",
        error?.response?.data || error.message
      );
    },
  });
};
