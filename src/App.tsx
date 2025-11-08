import React from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import { QueryProvider } from "./context/QueryProvider";
import { UserProvider } from "./context/UserContext";
import AppRoutes from "./routes/AppRoutes";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <UserProvider>
            <AppRoutes />
          </UserProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export default App;
