import { FileText, Users, MessageSquare, Eye, Edit3 } from "lucide-react";
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
    unitsCount?: number;
    studentsCount?: number;
    threadsCount?: number;
  };
  userRole?: string;
  onEdit?: (classroom: any) => void;
  linkTo?: string;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({
  classroom,
  userRole,
  onEdit,
  linkTo,
}) => {
  const classroomId = classroom.id || classroom._id;
  const link = linkTo || `/dashboard/classrooms/${classroomId}`;

  // Temporary: use 0 for counts until backend provides data
  const unitsCount = classroom.unitsCount ?? 0;
  const studentsCount = classroom.studentsCount ?? 0;
  const threadsCount = classroom.threadsCount ?? 0;

  const getSectionValue = () => {
    if (!classroom.section) return "N/A";
    if (typeof classroom.section === "string") return classroom.section;
    return classroom.section.name || "N/A";
  };

  const getFacultyValue = () => {
    if (!classroom.faculty) return "N/A";
    if (typeof classroom.faculty === "string") return classroom.faculty;
    return classroom.faculty.name || "N/A";
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onEdit?.(classroom);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600 transition-all duration-200">
      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-1.5">
        {classroom.name || "Untitled Classroom"}
      </h3>

      {/* Section and Faculty */}
      <div className="space-y-0 mb-3">
        <p className="text-gray-400 text-xs">
          Section: {getSectionValue()}
        </p>
        <p className="text-gray-400 text-xs">
          Faculty: {getFacultyValue()}
        </p>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-xs leading-relaxed mb-3">
        {classroom.description || "No description"}
      </p>

      {/* Divider */}
      <div className="border-t border-gray-700 mb-3"></div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-300 text-xs font-semibold">{unitsCount}</span>
          <span className="text-gray-400 text-xs">Units</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-300 text-xs font-semibold">{studentsCount}</span>
          <span className="text-gray-400 text-xs">Students</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-300 text-xs font-semibold">{threadsCount}</span>
          <span className="text-gray-400 text-xs">Threads</span>
        </div>
      </div>

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

        <Link
          to={link}
          className={`bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5 ${
            userRole === "FACULTY" && onEdit ? "flex-1" : "w-full"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </Link>
      </div>
    </div>
  );
};

export default ClassroomCard;