import { Link, useLocation } from "react-router-dom";
import { useClassroomQuery } from "../hooks/classroom";

const Breadcrumb = () => {
  const location = useLocation();
  // Filter out 'dashboard' from pathnames since we always show it as the home
  const pathnames = location.pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment.toLowerCase() !== "dashboard");

  // Extract classroom ID from path if present
  const classroomIdx = pathnames.findIndex((seg) => seg === "classrooms");
  const classroomId =
    classroomIdx !== -1 && pathnames[classroomIdx + 1]
      ? pathnames[classroomIdx + 1]
      : undefined;

  // Check if it's a valid classroom ID
  const isValidClassroomId =
    classroomId && /^[a-f0-9\-]{24,}$/i.test(classroomId);

  // Fetch classroom data using TanStack Query (only if valid ID)
  const { data: classroom } = useClassroomQuery(
    isValidClassroomId ? classroomId : undefined
  );

  const classroomName = classroom?.name || null;

  return (
    <nav className="text-sm text-white">
      <ol className="flex items-center space-x-2">
        {/* Dashboard link */}
        <li>
          <Link to="/dashboard" className="hover:text-gray-300 font-medium">
            Dashboard
          </Link>
        </li>

        {/* Dynamic path segments */}
        {pathnames.map((segment, index) => {
          const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;
          let label = segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          // If this segment is a classroom id, show classroomName if available
          const idx = pathnames.findIndex((seg) => seg === "classrooms");
          if (
            idx !== -1 &&
            index === idx + 1 &&
            /^[a-f0-9\-]{24,}$/i.test(segment) &&
            classroomName
          ) {
            label = classroomName;
          }
          return (
            <li key={routeTo} className="flex items-center space-x-2">
              <span className="mx-1 text-gray-500">/</span>
              {isLast ? (
                <span className="text-gray-300">{label}</span>
              ) : (
                <Link to={routeTo} className="hover:text-gray-300 font-medium">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
