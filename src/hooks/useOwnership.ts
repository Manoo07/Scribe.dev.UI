import { useState, useEffect, useCallback } from "react";
import { getCurrentUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

interface UseOwnershipReturn {
  currentUserId: string | null;
  isLoading: boolean;
  error: string | null;
  isOwner: (createdBy: string) => boolean;
  refreshUserInfo: () => Promise<void>;
}

export const useOwnership = (): UseOwnershipReturn => {
  const { user: authUser, fetchFreshUserData } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      console.log("🔄 fetchCurrentUser called");
      setIsLoading(true);
      setError(null);

      // First try to get from auth context
      if (authUser?.id) {
        console.log("✅ Got user ID from auth context:", authUser.id);
        setCurrentUserId(authUser.id);
        setIsLoading(false);
        return;
      }

      console.log("⚠️ No user ID in auth context, trying to fetch fresh data");

      // If not in auth context, try to fetch fresh data
      try {
        const freshUser = await fetchFreshUserData();
        if (freshUser?.id) {
          console.log("✅ Got user ID from fresh data:", freshUser.id);
          setCurrentUserId(freshUser.id);
          setIsLoading(false);
          return;
        }
      } catch (fetchError) {
        console.log(
          "⚠️ Failed to fetch fresh user data, trying direct API call"
        );
      }

      console.log("🔄 Trying direct API call to getCurrentUser");

      // Last resort: direct API call
      const userData = await getCurrentUser();
      if (userData?.id) {
        console.log("✅ Got user ID from direct API call:", userData.id);
        setCurrentUserId(userData.id);
        // Update localStorage for future use
        localStorage.setItem("userId", userData.id);
      } else {
        console.error("❌ No user ID in API response");
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
  }, [authUser?.id, fetchFreshUserData]);

  const isOwner = useCallback(
    (createdBy: string): boolean => {
      console.log("🔐 isOwner check:", {
        currentUserId,
        createdBy,
        hasCurrentUserId: !!currentUserId,
        hasCreatedBy: !!createdBy,
        isMatch: currentUserId === createdBy,
      });

      if (!currentUserId || !createdBy) {
        console.warn("⚠️ Missing data for ownership check:", {
          currentUserId,
          createdBy,
        });
        return false;
      }

      const result = currentUserId === createdBy;
      console.log(
        `✅ Ownership check result: ${result} (${currentUserId} === ${createdBy})`
      );
      return result;
    },
    [currentUserId]
  );

  const refreshUserInfo = useCallback(async () => {
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return {
    currentUserId,
    isLoading,
    error,
    isOwner,
    refreshUserInfo,
  };
};
