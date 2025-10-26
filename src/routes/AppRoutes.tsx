import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import AssignmentsPage from "../pages/Assignment";
import ClassroomDetailPage from "../pages/ClassroomDetailPage";
import ClassroomAssignmentsPage from "../pages/ClassroomAssignmentsPage";
import AssignmentSubmissionsPage from "../pages/AssignmentSubmissionsPage";
import MyClassroomsPage from "../pages/Classrooms";
import OverviewPage from "../pages/Dashboard";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LoginPage from "../pages/Login";
import LogoutPage from "../pages/Logout";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import SignupPage from "../pages/Signup";

import AttendanceDashboard from "../components/attendance/AttendanceDashboard";
import Features from "../components/Features";
import Hero from "../components/Hero";
import ThreadsTab from "../components/threads/ThreadsTab";
import MainLayout from "../layouts/MainLayout";
import Announcements from "../pages/Announcements";

const AppRoutes = () => {
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
        <Route path="/logout" element={<LogoutPage />} />

        {/* Redirect /dashboard to /dashboard/overview */}
        <Route
          path="/dashboard"
          element={<Navigate to="/dashboard/overview" replace />}
        />

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="overview" element={<OverviewPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="classrooms" element={<MyClassroomsPage />} />
          <Route path="classrooms/:id" element={<ClassroomDetailPage />} />
          <Route path="classrooms/:id/assignments" element={<ClassroomAssignmentsPage />} />
          <Route path="classrooms/:id/assignments/:assignmentId/submissions" element={<AssignmentSubmissionsPage />} />
          <Route path="assignments/:assignmentId/submissions" element={<AssignmentSubmissionsPage />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="attendance" element={<AttendanceDashboard />} />
          <Route
            path="threads"
            element={<ThreadsTab classroomId={""} units={[]} />}
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
