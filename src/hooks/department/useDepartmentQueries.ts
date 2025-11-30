/**
 * Department Query Hooks
 * Custom hooks for department and year data fetching
 */

import { useQuery } from "@tanstack/react-query";
import {
  getDepartments,
  getYearsByDepartment,
} from "../../api/endpoints/department.api";

// ==================== Query Keys ====================
export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  years: (departmentId: string) =>
    [...departmentKeys.all, departmentId, "years"] as const,
};

// ==================== Query Hooks ====================

/**
 * Hook to get all departments
 * @example
 * const { data: departments, isLoading } = useDepartmentsQuery();
 */
export const useDepartmentsQuery = () => {
  return useQuery({
    queryKey: departmentKeys.lists(),
    queryFn: () => getDepartments(),
    staleTime: 10 * 60 * 1000, // 10 minutes (departments rarely change)
  });
};

/**
 * Hook to get years by department ID
 * @example
 * const { data: years, isLoading } = useYearsQuery(departmentId);
 */
export const useYearsQuery = (departmentId?: string) => {
  return useQuery({
    queryKey: departmentKeys.years(departmentId!),
    queryFn: () => getYearsByDepartment(departmentId!),
    enabled: !!departmentId, // Only fetch if departmentId is provided
    staleTime: 10 * 60 * 1000, // 10 minutes (years rarely change)
  });
};
