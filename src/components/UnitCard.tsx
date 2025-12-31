import React from "react";
import { ContentType } from "../types";
import { FileText, Link2, Video, File, Eye, Edit3 } from "lucide-react";

interface UnitCardProps {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  contentsCount: Record<ContentType, number>;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  userRole?: string;
}

const UnitCard: React.FC<UnitCardProps> = ({
  name,
  description,
  lastUpdated,
  contentsCount,
  onEdit,
  onView,
  isDeleting,
  userRole,
}) => {
  const notesCount = contentsCount[ContentType.NOTE] ?? 0;
  const linksCount = contentsCount[ContentType.LINK] ?? 0;
  const videosCount = contentsCount[ContentType.VIDEO] ?? 0;
  const documentsCount = contentsCount[ContentType.DOCUMENT] ?? 0;

  const handleEdit = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onEdit();
  };

  const handleView = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onView();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600 transition-all duration-200">
      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-1.5">{name}</h3>

      {/* Updated date */}
      <div className="mb-3">
        <p className="text-gray-400 text-xs">Updated {lastUpdated}</p>
      </div>

      {/* Description - Fixed 2 lines */}
      <p className="text-gray-300 text-xs leading-relaxed mb-3 line-clamp-2 min-h-[2.5rem]">
        {description || "No description"}
      </p>

      {/* Divider */}
      <div className="border-t border-gray-700 mb-3"></div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-gray-300 text-xs font-semibold">
            {notesCount}
          </span>
          <span className="text-gray-400 text-xs">Notes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-gray-300 text-xs font-semibold">
            {linksCount}
          </span>
          <span className="text-gray-400 text-xs">Links</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 text-red-400" />
          <span className="text-gray-300 text-xs font-semibold">
            {videosCount}
          </span>
          <span className="text-gray-400 text-xs">Videos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <File className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-gray-300 text-xs font-semibold">
            {documentsCount}
          </span>
          <span className="text-gray-400 text-xs">Docs</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {userRole === "FACULTY" && (
          <button
            onClick={handleEdit}
            disabled={isDeleting}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}

        <button
          onClick={handleView}
          className={`bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5 ${
            userRole === "FACULTY" ? "flex-1" : "w-full"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </button>
      </div>
    </div>
  );
};

export default UnitCard;
