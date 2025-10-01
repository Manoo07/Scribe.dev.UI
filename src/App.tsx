import React, { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import AppRoutes from "./routes/AppRoutes";

const App: React.FC = () => {
  useEffect(() => {
    // Global error handler to prevent HTML alert dialogs
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      event.preventDefault(); // Prevent the default browser behavior
    };

    const handleError = (event: ErrorEvent) => {
      console.error("Unhandled error:", event.error);
      event.preventDefault(); // Prevent the default browser behavior
    };

    // Add global error handlers
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    // Cleanup
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
