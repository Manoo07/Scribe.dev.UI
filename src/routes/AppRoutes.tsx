import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LoginPage from "../pages/Login";
import LogoutPage from "../pages/Logout";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import SignupPage from "../pages/Signup";

import Features from "../components/Features";
import Hero from "../components/Hero";
import MainLayout from "../layouts/MainLayout";
import RequireAuth from "./RequireAuth";
import { dashboardChildren } from "./routes";

import { useEffect } from "react";

const AppRoutes = () => {
  // Check for token and redirect from landing page if present
  useEffect(() => {
    // If a user visits the public landing page and already has a token,
    // send them to the dashboard.
      if (window.location.pathname === "/") {
      const token = localStorage.getItem("token");
      if (token) {
        window.location.replace("/dashboard");
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public landing page at root `/` */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Hero />
              <Features />
            </MainLayout>
          }
        />

        {/* Dashboard root: `/dashboard` is the app's protected dashboard landing (overview) */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={dashboardChildren.find((c) => c.path === "overview")?.element} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/logout" element={<LogoutPage />} />

          {dashboardChildren.map((r) => (
            <Route
              key={r.path}
            path={`/${r.path}`}
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={r.element} />
            </Route>
          ))}

        {/* Fallback - redirect to dashboard if logged in, otherwise landing page */}
        <Route
          path="*"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
