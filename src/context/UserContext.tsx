import React, { createContext, useState, useContext, useEffect } from "react";

export type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

interface UserContextType {
  userRole: UserRole | null;
  setUserRole: (role: UserRole | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const storedRole = localStorage.getItem("role") as UserRole | null;
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  return (
    <UserContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
};
