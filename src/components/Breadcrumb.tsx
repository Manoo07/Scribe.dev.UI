import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  console.log(pathnames); // Debug log to ensure it's splitting correctly

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
          const label = segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

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
