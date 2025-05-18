import { NavLink } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Layers,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  PlusCircle,
  Book,
  Settings,
  Shield,
  LogOut,
  Megaphone,
  Bell
} from "lucide-react";

type NavItemProps = {
  to: string;
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
};

type UserRole = "STUDENT" | "FACULTY" | "ADMIN";

const SideNav = ({
  collapsed,
  toggleCollapse,
}: {
  collapsed: boolean;
  toggleCollapse: () => void;
}) => {
  const userRole = localStorage.getItem("role") as UserRole;

  return (
    <aside
      className={`h-full ${
        collapsed ? "w-20" : "w-64"
      } bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out flex flex-col`}
    >
      {/* Header with logo and collapse button */}
      <div className="flex items-center justify-between p-2 border-b border-gray-800">
        {!collapsed && (
          <div className="text-xl pl-10 font-bold text-white flex items-center gap-x-1">
            <img
              src="/ScribeLogo.png"
              alt="Scribe logo"
              className="h-8 w-8 object-contain"
            />
            <span>Scribe</span>
          </div>
        )}
        <button
          onClick={toggleCollapse}
          className={`text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors ${
            collapsed ? "mx-auto" : "ml-auto"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-grow py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
        <NavItem
          to="/dashboard/overview"
          label="Dashboard"
          icon={<LayoutDashboard size={collapsed ? 20 : 18} />}
          collapsed={collapsed}
        />
        <NavItem
          to="/dashboard/classrooms"
          label="Classrooms"
          icon={<Layers size={collapsed ? 20 : 18} />}
          collapsed={collapsed}
        />
        <NavItem
          to="/dashboard/announcements"
          label="Announcements"
          icon={<Bell size={collapsed ? 20 : 18} />}
          collapsed={collapsed}
        />
        <NavItem
          to="/dashboard/threads"
          label="Threads"
          icon={<MessageSquare size={collapsed ? 20 : 18} />}
          collapsed={collapsed}
        />
        <NavItem
          to="/dashboard/assignments"
          label="Assignments"
          icon={<FileText size={collapsed ? 20 : 18} />}
          collapsed={collapsed}
        />
        <NavItem
          to="/dashboard/attendance"
          label="Attendance"
          icon={<Users size={collapsed ? 20 : 18} />}
          collapsed={collapsed}
        />

        {/* Faculty section - only visible if userRole is FACULTY or ADMIN */}
        {(userRole === "FACULTY" || userRole === "ADMIN") && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-2 px-2 text-gray-400 uppercase text-xs font-semibold">
                Faculty Only
              </div>
            )}
            {collapsed && <div className="my-4 border-b border-gray-800"></div>}

            <NavItem
              to="/dashboard/create-classroom"
              label="Create Class"
              icon={<PlusCircle size={collapsed ? 20 : 18} />}
              collapsed={collapsed}
            />
            <NavItem
              to="/dashboard/manage-units"
              label="Manage Units"
              icon={<Book size={collapsed ? 20 : 18} />}
              collapsed={collapsed}
            />
          </>
        )}

        {/* Admin section - only visible if userRole is ADMIN */}
        {userRole === "ADMIN" && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-2 px-2 text-gray-400 uppercase text-xs font-semibold">
                Admin
              </div>
            )}
            {collapsed && <div className="my-4 border-b border-gray-800"></div>}

            <NavItem
              to="/dashboard/admin"
              label="Admin Panel"
              icon={<Shield size={collapsed ? 20 : 18} />}
              collapsed={collapsed}
            />
            <NavItem
              to="/dashboard/settings"
              label="Settings"
              icon={<Settings size={collapsed ? 20 : 18} />}
              collapsed={collapsed}
            />
          </>
        )}
      </nav>

      {/* Footer with logout */}
      <div className="border-t border-gray-800 p-3">
        <NavItem
          to="/login"
          label="Logout"
          icon={<LogOut size={collapsed ? 20 : 18} />}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
};

// Enhanced NavItem with icon support and active highlighting
const NavItem = ({ to, label, icon, collapsed }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center ${collapsed ? "justify-center" : "px-3"} py-3 rounded-md
      ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-md border-l-4 border-blue-300"
          : "text-gray-300 hover:bg-gray-800 hover:text-white transition-colors duration-200"
      }
      ${collapsed ? "mx-auto rounded-full w-12 h-12" : ""}
    `}
    title={label}
    end={to === "/dashboard"}
  >
    <span className={`${collapsed ? "" : "mr-3"}`}>{icon}</span>
    {!collapsed && <span className="whitespace-nowrap">{label}</span>}
  </NavLink>
);

export default SideNav;
