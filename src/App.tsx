import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";

const App: React.FC = () => (
  <AuthProvider>
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  </AuthProvider>
);

export default App;
