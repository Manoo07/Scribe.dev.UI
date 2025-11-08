import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Breadcrumb = () => {
  const location = useLocation();
  // Filter out 'dashboard' from pathnames since we always show it as the home
  const pathnames = location.pathname.split("/").filter(Boolean).filter(segment => segment.toLowerCase() !== 'dashboard');
  console.log(pathnames); // Debug log to ensure it's splitting correctly
  // State to store classroom name if available
  const [classroomName, setClassroomName] = useState<string | null>(null);

  useEffect(() => {
    if (pathnames.length >= 2) {
      const idx = pathnames.findIndex((seg) => seg === "classrooms");
      if (idx !== -1 && pathnames[idx + 1]) {
        const classroomId = pathnames[idx + 1];
        if (/^[a-f0-9\-]{24,}$/i.test(classroomId)) {
          axios
            .get(`http://localhost:3000/api/v1/classroom/${classroomId}`, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            })
            .then((res) => setClassroomName(res.data.name))
            .catch(() => setClassroomName(null));
        } else {
          setClassroomName(null);
        }
      } else {
        setClassroomName(null);
      }
    } else {
      setClassroomName(null);
    }
  }, [location.pathname]);

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
