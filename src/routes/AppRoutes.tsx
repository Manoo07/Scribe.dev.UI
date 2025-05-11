import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/Login";
import SignupPage from "../pages/Signup";
import DashboardLayout from "../layouts/DashboardLayout";
import OverviewPage from "../pages/Dashboard";
import AssignmentsPage from "../pages/Assignment";
import ClassroomDetailPage from "../pages/ClassroomDetailPage";
import MyClassroomsPage from "../pages/Classrooms";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

const AppRoutes = () => (
  <Router>
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />



      {/* Dashboard routes wrapped in layout */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="classrooms" element={<MyClassroomsPage />} />
        <Route path="classrooms/:id" element={<ClassroomDetailPage />} />
      </Route>

      {/* Global routes outside dashboard shell */}
      
    </Routes>
  </Router>
);

export default AppRoutes;
