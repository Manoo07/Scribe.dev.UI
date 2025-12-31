import { Eye, Edit3 } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

interface BaseCardProps {
  title: string;
  metadata?: React.ReactNode;
  description?: string;
  stats?: React.ReactNode;
  userRole?: string;
  onEdit?: () => void;
  linkTo?: string;
  className?: string;
}

const BaseCard: React.FC<BaseCardProps> = ({
  title,
  metadata,
  description,
  stats,
  userRole,
  onEdit,
  linkTo,
  className = "",
}) => {
  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onEdit?.();
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600 transition-all duration-200 ${className}`}
    >
      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>

      {/* Metadata (e.g., Section/Faculty or Updated date) */}
      {metadata && <div className="mb-3">{metadata}</div>}

      {/* Description */}
      {description && (
        <p className="text-gray-300 text-xs leading-relaxed mb-3">
          {description}
        </p>
      )}

      {/* Divider */}
      <div className="border-t border-gray-700 mb-3"></div>

      {/* Stats Row */}
      {stats && <div className="mb-3">{stats}</div>}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {userRole === "FACULTY" && onEdit && (
          <button
            onClick={handleEdit}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}

        {linkTo && (
          <Link
            to={linkTo}
            className={`bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5 ${
              userRole === "FACULTY" && onEdit ? "flex-1" : "w-full"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default BaseCard;
