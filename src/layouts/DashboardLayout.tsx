import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import SideNav from "../components/SideNav";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <SideNav collapsed={collapsed} toggleCollapse={toggleCollapse} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <TopBar /> */}
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
