import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser } from "../services/api";

interface UseOwnershipReturn {
  currentUserId: string | null;
  isLoading: boolean;
  error: string | null;
  isOwner: (createdBy: string) => boolean;
  refreshUserInfo: () => Promise<void>;
}

export const useOwnership = (): UseOwnershipReturn => {
  const { user: authUser, fetchFreshUserData } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    // Try to get from localStorage first to avoid unnecessary API calls
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      console.log("✅ Got user ID from localStorage:", storedUserId);
      return storedUserId;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    // Don't fetch if we already have a user ID
    if (currentUserId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // First try to get from auth context
      if (authUser?.id) {
        setCurrentUserId(authUser.id);
        localStorage.setItem("userId", authUser.id);
        setIsLoading(false);
        return;
      }

      // If not in auth context, try to fetch fresh data
      try {
        const freshUser = await fetchFreshUserData();
        if (freshUser?.id) {
          setCurrentUserId(freshUser.id);
          localStorage.setItem("userId", freshUser.id);
          setIsLoading(false);
          return;
        }
      } catch (fetchError) {
        // Silent fallback to direct API call
      }

      // Last resort: direct API call
      const userData = await getCurrentUser();
      if (userData?.id) {
        setCurrentUserId(userData.id);
        localStorage.setItem("userId", userData.id);
      } else {
        setError("Failed to get user ID from API response");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to get current user";
      setError(errorMessage);
      console.error("❌ Error fetching current user:", err);
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id, fetchFreshUserData, currentUserId]);

  const isOwner = useCallback(
    (createdBy: string): boolean => {
      if (!currentUserId || !createdBy) {
        return false;
      }

      return currentUserId === createdBy;
    },
    [currentUserId]
  );

  const refreshUserInfo = useCallback(async () => {
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    // Only fetch if we don't have a user ID
    if (!currentUserId) {
      fetchCurrentUser();
    }
  }, [fetchCurrentUser, currentUserId]);

  return {
    currentUserId,
    isLoading,
    error,
    isOwner,
    refreshUserInfo,
  };
};
