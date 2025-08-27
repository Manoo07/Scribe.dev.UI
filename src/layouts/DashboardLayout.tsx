import { useState } from "react";
import { Outlet } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import SideNav from "../components/SideNav";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapse = () => setCollapsed((prev) => !prev);

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
