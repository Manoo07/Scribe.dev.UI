import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import SessionExpiryModal from "../components/SessionExpiryModal";
import { getCurrentUser } from "../services/api";
import { getUserFromToken, validateToken } from "../utils/authUtils";

export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: Partial<User>) => void;
  logout: () => void;
  refreshAuth: () => void;
  clearAuth: () => void;
  fetchFreshUserData: () => Promise<User | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSessionExpiry, setShowSessionExpiry] = useState(false);
  const [sessionExpiryMessage, setSessionExpiryMessage] = useState("");

  // Load authentication state from localStorage
  const loadAuthState = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        // Validate token
        const validation = validateToken(token);
        if (!validation.isValid) {
          console.log("Token validation failed:", validation.reason);
          clearAuth();
          return;
        }

        // Token is valid, try to get fresh user data from /auth/me
        // Check if we have recent user data (less than 5 minutes old)
        const lastUserFetch = localStorage.getItem("lastUserFetch");
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (lastUserFetch && now - parseInt(lastUserFetch) < fiveMinutes) {
          // Use cached user data if it's recent
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            console.log("✅ Using cached user data (recent)");
            return;
          }
        }

        try {
          const freshUserData = await getCurrentUser();
          if (freshUserData && freshUserData.id) {
            const user: User = {
              id: freshUserData.id,
              email: freshUserData.email || "",
              role: freshUserData.role || "STUDENT",
              name: freshUserData.name || "",
            };

            // Store fresh user data
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("role", user.role);
            localStorage.setItem("userId", user.id);
            localStorage.setItem("lastUserFetch", now.toString());

            setUser(user);
            console.log("✅ Fresh user data loaded from /auth/me:", user);
          } else {
            throw new Error("Invalid user data from /auth/me");
          }
        } catch (apiError) {
          console.log(
            "⚠️ Failed to fetch fresh user data, falling back to stored data"
          );

          // Fallback to stored user data
          let userData;
          const storedUser = localStorage.getItem("user");

          if (storedUser) {
            userData = JSON.parse(storedUser);
          } else {
            // Extract user info from token
            userData = getUserFromToken(token);
          }

          if (userData) {
            setUser(userData);
          } else {
            clearAuth();
          }
        }
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear authentication state
  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("lastUserFetch"); // Clear last fetch time on logout
    setUser(null);
  }, []);

  // Login function
  const login = useCallback((token: string, userData: Partial<User>) => {
    localStorage.setItem("token", token);

    // Store user data
    const user: User = {
      id: userData.id || "",
      email: userData.email || "",
      role: userData.role || "STUDENT",
      name: userData.name || "",
    };

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.role);
    localStorage.setItem("userId", user.id);
    localStorage.setItem("lastUserFetch", Date.now().toString()); // Update last fetch time on login

    setUser(user);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearAuth();
    // Redirect to login page
    window.location.href = "/login";
  }, [clearAuth]);

  // Handle session expiry
  const handleSessionExpiry = useCallback(
    (message: string = "Your session has expired. Please login again.") => {
      setSessionExpiryMessage(message);
      setShowSessionExpiry(true);
    },
    []
  );

  // Handle login from session expiry modal
  const handleLoginFromExpiry = useCallback(() => {
    setShowSessionExpiry(false);

    // Store current location to redirect back after login
    const currentPath = window.location.pathname;
    if (currentPath !== "/login" && currentPath !== "/signup") {
      sessionStorage.setItem("redirectAfterLogin", currentPath);
    }

    clearAuth();
    window.location.href = "/login";
  }, [clearAuth]);

  // Refresh authentication (for future token refresh implementation)
  const refreshAuth = useCallback(() => {
    // This could be used to implement token refresh logic
    loadAuthState();
  }, [loadAuthState]);

  // Fetch fresh user data from /auth/me endpoint
  const fetchFreshUserData = useCallback(async () => {
    try {
      const freshUserData = await getCurrentUser();
      if (freshUserData && freshUserData.id) {
        const user: User = {
          id: freshUserData.id,
          email: freshUserData.email || "",
          role: freshUserData.role || "STUDENT",
          name: freshUserData.name || "",
        };

        // Store fresh user data
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("lastUserFetch", Date.now().toString()); // Update last fetch time on successful fetch

        setUser(user);
        console.log("✅ Fresh user data fetched and stored:", user);
        return user;
      }
    } catch (error) {
      console.error("Error fetching fresh user data:", error);
      throw error;
    }
  }, []);

  // Check auth state on mount
  useEffect(() => {
    loadAuthState();
  }, [loadAuthState]);

  // Check token expiry periodically
  useEffect(() => {
    if (!user) return;

    const checkTokenExpiry = () => {
      const token = localStorage.getItem("token");
      if (token) {
        const validation = validateToken(token);
        if (!validation.isValid) {
          // Token expired or invalid, show modal
          handleSessionExpiry("Your session has expired. Please login again.");
        }
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, clearAuth]);

  // Listen for authentication errors from API interceptor
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      console.log("🔐 Auth error event received:", event.detail);
      handleSessionExpiry(event.detail.message);
    };

    window.addEventListener("auth-error", handleAuthError as EventListener);

    return () => {
      window.removeEventListener(
        "auth-error",
        handleAuthError as EventListener
      );
    };
  }, [handleSessionExpiry]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshAuth,
    clearAuth,
    fetchFreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}

      <SessionExpiryModal
        isOpen={showSessionExpiry}
        onLogin={handleLoginFromExpiry}
        message={sessionExpiryMessage}
        showRefresh={false}
      />
    </AuthContext.Provider>
  );
};
