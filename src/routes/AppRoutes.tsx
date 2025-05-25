import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "../pages/Login";
import SignupPage from "../pages/Signup";
import DashboardLayout from "../layouts/DashboardLayout";
import OverviewPage from "../pages/Dashboard";
import AssignmentsPage from "../pages/Assignment";
import ClassroomDetailPage from "../pages/ClassroomDetailPage";
import MyClassroomsPage from "../pages/Classrooms";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

import MainLayout from "../layouts/MainLayout";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Announcements from "../pages/Announcements";
import AttendanceDashboard from "../components/attendance/AttendanceDashboard";
import ThreadsTab from "../components/threads/ThreadsTab";

const AppRoutes = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* Public landing page */}
        <Route
          path="/"
          element={
            <MainLayout>
              <>
                <Hero />
                <Features />
              </>
            </MainLayout>
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Redirect /dashboard to /dashboard/overview */}
        <Route
          path="/dashboard"
          element={<Navigate to="/dashboard/overview" replace />}
        />

        {/* Protected dashboard routes */}
        {isAuthenticated && (
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="overview" element={<OverviewPage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="classrooms" element={<MyClassroomsPage />} />
            <Route path="classrooms/:id" element={<ClassroomDetailPage />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="attendance" element={<AttendanceDashboard />} />
            <Route
              path="threads"
              element={<ThreadsTab classroomId={""} units={[]} />}
            />
          </Route>
        )}

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />}
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
