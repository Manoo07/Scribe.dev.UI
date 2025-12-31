import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = {
  children: React.ReactElement;
};

const RequireAuth = ({ children }: Props) => {
  const location = useLocation();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    // Redirect to login and preserve where the user was going
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;
