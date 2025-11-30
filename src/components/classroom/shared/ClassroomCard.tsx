import { Edit3, Trash2 } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

interface ClassroomCardProps {
  classroom: {
    _id?: string;
    id?: string;
    name: string;
    description?: string;
    section?: any;
    faculty?: any;
  };
  userRole?: string;
  onEdit?: (classroom: any) => void;
  onDelete?: (classroom: any) => void;
  isDeleting?: boolean;
  linkTo?: string;
  renderValue?: (value: any, fallback?: string) => string;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({
  classroom,
  userRole,
  onEdit,
  onDelete,
  isDeleting = false,
  linkTo,
  renderValue = (value: any, fallback = "N/A") => {
    if (!value) return fallback;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value.name || value.specialization || fallback;
    }
    return fallback;
  },
}) => {
  // Support both id formats (API returns 'id', but some places use '_id')
  const classroomId = classroom.id || classroom._id;
  const link = linkTo || `/dashboard/classrooms/${classroomId}`;

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onEdit?.(classroom);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onDelete?.(classroom);
  };

  return (
    <div className="bg-gray-800 hover:bg-gray-700 transition p-5 rounded-xl shadow-md relative group">
      <Link to={link} className="block">
        <h3 className="text-xl font-semibold text-white mb-1 pr-16">
          {classroom.name}
        </h3>
        {classroom.description && (
          <p className="text-gray-300 text-sm mb-2 pr-16">
            {classroom.description}
          </p>
        )}
        <p className="text-gray-400 text-sm">
          Section: {renderValue(classroom.section)}
        </p>
        <p className="text-gray-400 text-sm">
          Faculty: {renderValue(classroom.faculty)}
        </p>
      </Link>

      {userRole === "FACULTY" && (onEdit || onDelete) && (
        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition"
              title="Edit classroom"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
              title="Delete classroom"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400"></div>
                </div>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassroomCard;
