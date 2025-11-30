import { Link, useLocation } from "react-router-dom";
import { useClassroomQuery, useClassroomUnitsQuery } from "../hooks/classroom";

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

  // Extract unit ID from path if present (comes after classroom ID)
  const unitsIdx = pathnames.findIndex((seg) => seg === "units");
  const unitId =
    unitsIdx !== -1 && pathnames[unitsIdx + 1]
      ? pathnames[unitsIdx + 1]
      : undefined;

  // Check if it's a valid unit ID
  const isValidUnitId = unitId && /^[a-f0-9\-]{24,}$/i.test(unitId);

  // Fetch units for the classroom (only if we have a valid classroom ID)
  const { data: units = [] } = useClassroomUnitsQuery(
    isValidClassroomId ? classroomId! : ""
  );

  // Find the unit name if we have a valid unit ID
  const unit = isValidUnitId
    ? units.find((u: any) => u.id === unitId || u._id === unitId)
    : null;
  const unitName = unit?.name || null;

  const classroomName = classroom?.name || null;

  return (
    <nav className="text-sm text-white">
      <ol className="flex items-center space-x-2">
        {/* Dashboard link - only show if not on dashboard */}
        {pathnames.length > 0 && pathnames[0] !== "dashboard" && (
          <li>
            <Link to="/dashboard" className="hover:text-gray-300 font-medium">
              Dashboard
            </Link>
          </li>
        )}

        {/* Dynamic path segments */}
        {pathnames.map((segment, index) => {
          const routeTo =
            "/dashboard/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;
          let label = segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          // If this segment is a classroom id, show classroomName if available
          const classroomIndex = pathnames.findIndex(
            (seg) => seg === "classrooms"
          );
          if (
            classroomIndex !== -1 &&
            index === classroomIndex + 1 &&
            /^[a-f0-9\-]{24,}$/i.test(segment) &&
            classroomName
          ) {
            label = classroomName;
          }
  
          const showSeparator = (pathnames.length > 0 && pathnames[0] !== "dashboard") || index > 0;
          
          return (
            <li key={routeTo} className="flex items-center space-x-2">
              {showSeparator && <span className="mx-1 text-gray-500">/</span>}
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
