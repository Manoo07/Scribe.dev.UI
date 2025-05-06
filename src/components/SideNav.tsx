// src/components/SideNav.tsx
import { NavLink } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const SideNav = ({ collapsed, toggleCollapse }: { collapsed: boolean; toggleCollapse: () => void }) => {
  return (
    <aside className={`h-full ${collapsed ? "w-20" : "w-64"} bg-gray-850 p-4 border-r border-gray-700 transition-all duration-300`}>
      {/* Collapse toggle button */}
      <button
        onClick={toggleCollapse}
        className="text-gray-400 hover:text-white mb-6"
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      <nav className="space-y-3 text-sm">
        <NavItem to="/classrooms" label="My Classrooms" collapsed={collapsed} />
        <NavItem to="/calendar" label="Calendar" collapsed={collapsed} />
        <NavItem to="/threads" label="Threads" collapsed={collapsed} />
        <NavItem to="/assignments" label="Assignments" collapsed={collapsed} />
        <NavItem to="/attendance" label="Attendance" collapsed={collapsed} />

        {!collapsed && (
          <>
            <div className="mt-4 text-gray-400 uppercase text-xs">Faculty Only</div>
            <NavItem to="/create-classroom" label="Create Classroom" collapsed={collapsed} />
            <NavItem to="/manage-units" label="Manage Units" collapsed={collapsed} />

            <div className="mt-4 text-gray-400 uppercase text-xs">Admin</div>
            <NavItem to="/admin" label="Admin Panel" collapsed={collapsed} />
            <NavItem to="/settings" label="Settings" collapsed={collapsed} />
          </>
        )}
         <NavItem to="/login" label="Logout" collapsed={collapsed} />
      </nav>
    </aside>
  );
};

// Helper for nav links
const NavItem = ({ to, label, collapsed }: { to: string; label: string; collapsed: boolean }) => (
  <NavLink
    to={to}
    className="block hover:text-indigo-400 text-white"
    title={label}
  >
    {collapsed ? (
      <span className="block w-6 h-6 bg-gray-700 rounded text-center text-xs leading-6">
        {label[0]}
      </span>
    ) : (
      label
    )}
  </NavLink>
);

export default SideNav;
