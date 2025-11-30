/**
 * Authentication Query Hooks
 * Custom hooks for auth-related data fetching
 */

import { useQuery } from "@tanstack/react-query";
import {
  getColleges,
  getCurrentUser,
  getDepartments,
  getYears,
} from "../../api/endpoints/auth.api";

// ==================== Query Keys ====================
export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "current-user"] as const,
  colleges: () => [...authKeys.all, "colleges"] as const,
  departments: (collegeId?: string) =>
    [...authKeys.all, "departments", collegeId] as const,
  years: (departmentId?: string) =>
    [...authKeys.all, "years", departmentId] as const,
};

// ==================== Queries ====================

/**
 * Hook to get current logged-in user
 * @example
 * const { data: user, isLoading, error } = useCurrentUserQuery();
 */
export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false, // Don't retry if user is not authenticated
  });
};

/**
 * Hook to get colleges list
 * @example
 * const { data: colleges, isLoading } = useCollegesQuery();
 */
export const useCollegesQuery = () => {
  return useQuery({
    queryKey: authKeys.colleges(),
    queryFn: getColleges,
    staleTime: 1000 * 60 * 30, // 30 minutes (colleges don't change often)
  });
};

/**
 * Hook to get departments by college
 * @example
 * const { data: departments } = useDepartmentsQuery(collegeId);
 */
export const useDepartmentsQuery = (collegeId?: string) => {
  return useQuery({
    queryKey: authKeys.departments(collegeId),
    queryFn: () => getDepartments(collegeId!),
    enabled: !!collegeId, // Only fetch if collegeId is provided
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Hook to get years by department
 * @example
 * const { data: years } = useYearsQuery(departmentId);
 */
export const useYearsQuery = (departmentId?: string) => {
  return useQuery({
    queryKey: authKeys.years(departmentId),
    queryFn: () => getYears(departmentId!),
    enabled: !!departmentId, // Only fetch if departmentId is provided
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
