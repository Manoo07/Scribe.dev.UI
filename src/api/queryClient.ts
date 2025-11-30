/**
 * TanStack Query Client Configuration
 * Centralized configuration for React Query with optimized defaults
 */

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data remains fresh for 5 minutes before refetching
      staleTime: 1000 * 60 * 5, // 5 minutes

      // Cache data for 10 minutes before garbage collection
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)

      // Retry failed requests once
      retry: 1,

      // Don't refetch on window focus (can be enabled per query if needed)
      refetchOnWindowFocus: false,

      // Don't refetch on mount if data is fresh
      refetchOnMount: false,

      // Refetch on network reconnection
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,

      // Show error notification on mutation failure (can be customized)
      onError: (error: any) => {
        console.error(
          "Mutation error:",
          error?.response?.data || error.message
        );
      },
    },
  },
});

export default queryClient;
