import { useEffect, useRef } from "react";
import { isTokenExpiringSoon, validateToken } from "../utils/authUtils";

interface UseTokenRefreshOptions {
  onTokenExpiring?: () => void;
  onTokenExpired?: () => void;
  checkInterval?: number; // in milliseconds
  warningThreshold?: number; // in minutes
}

export const useTokenRefresh = (options: UseTokenRefreshOptions = {}) => {
  const {
    onTokenExpiring,
    onTokenExpired,
    checkInterval = 60000, // 1 minute
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const validation = validateToken(token);

      if (!validation.isValid) {
        // Token is expired
        if (onTokenExpired) {
          onTokenExpired();
        }
        return;
      }

      // Check if token is expiring soon
      if (isTokenExpiringSoon(token)) {
        if (onTokenExpiring) {
          onTokenExpiring();
        }
      }
    };

    // Check immediately
    checkToken();

    // Set up interval
    intervalRef.current = setInterval(checkToken, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkInterval, onTokenExpiring, onTokenExpired]);

  // Function to manually check token
  const checkTokenNow = () => {
    const token = localStorage.getItem("token");
    if (token) {
      return validateToken(token);
    }
    return { isValid: false, reason: "No token found" };
  };

  // Function to clear interval
  const clearIntervalNow = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return {
    checkTokenNow,
    clearInterval: clearIntervalNow,
  };
};
