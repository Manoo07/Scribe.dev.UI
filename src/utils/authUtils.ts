// Token management utilities
export interface TokenPayload {
  exp: number;
  iat: number;
  sub: string;
  email: string;
  role: string;
  name?: string;
}

/**
 * Decode JWT token without external libraries
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload) return true;

  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

/**
 * Check if token will expire soon (within 5 minutes)
 */
export const isTokenExpiringSoon = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload) return true;

  const currentTime = Date.now() / 1000;
  const fiveMinutes = 5 * 60;
  return payload.exp < currentTime + fiveMinutes;
};

/**
 * Get token expiry time in human readable format
 */
export const getTokenExpiryTime = (token: string): string => {
  const payload = decodeToken(token);
  if (!payload) return "Invalid token";

  const expiryDate = new Date(payload.exp * 1000);
  return expiryDate.toLocaleString();
};

/**
 * Get time until token expires
 */
export const getTimeUntilExpiry = (token: string): string => {
  const payload = decodeToken(token);
  if (!payload) return "Invalid token";

  const currentTime = Date.now() / 1000;
  const timeLeft = payload.exp - currentTime;

  if (timeLeft <= 0) return "Expired";

  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

/**
 * Validate token structure and expiry
 */
export const validateToken = (
  token: string
): { isValid: boolean; reason?: string } => {
  if (!token) {
    return { isValid: false, reason: "No token provided" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { isValid: false, reason: "Invalid token format" };
  }

  const payload = decodeToken(token);
  if (!payload) {
    return { isValid: false, reason: "Unable to decode token" };
  }

  if (isTokenExpired(token)) {
    return { isValid: false, reason: "Token has expired" };
  }

  return { isValid: true };
};

/**
 * Get user info from token
 */
export const getUserFromToken = (token: string) => {
  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    name: payload.name || "",
  };
};

/**
 * Ensure token is available for authenticated operations
 */
export const ensureToken = (): string => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Authentication required. Please login again.");
  }

  const validation = validateToken(token);
  if (!validation.isValid) {
    throw new Error(`Token validation failed: ${validation.reason}`);
  }

  return token;
};

/**
 * Check if user can perform like operations
 */
export const canLike = (): boolean => {
  try {
    const token = ensureToken();
    return !!token;
  } catch {
    return false;
  }
};
