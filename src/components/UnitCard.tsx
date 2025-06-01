import React from "react";
import { ContentType } from "../types";
import { FileText, Link2, Video, File, Edit3, Eye } from "lucide-react";

interface UnitCardProps {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  contentsCount: {
    [ContentType.NOTE]: number;
    [ContentType.LINK]: number;
    [ContentType.VIDEO]: number;
    [ContentType.DOCUMENT]: number;
  };
  onEdit: () => void;
  onView: () => void;
}

const UnitCard: React.FC<UnitCardProps> = ({
  name,
  description,
  lastUpdated,
  contentsCount,
  onEdit,
  onView,
}) => {
  const totalContents = Object.values(contentsCount).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-700 transition-all hover:shadow-lg hover:shadow-blue-900/10 hover:border-gray-600 group">
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-white line-clamp-1 pr-2 flex-1">
            {name}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-md"
            title="Edit unit"
          >
            <Edit3 size={16} />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {description}
        </p>

        <div className="mb-4 flex items-center gap-1.5 text-gray-500 text-xs">
          <span>Updated</span>
          <span className="text-gray-400">{lastUpdated}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 min-h-[1.75rem]">
          {contentsCount[ContentType.NOTE] > 0 && (
            <div className="bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded text-xs flex items-center gap-1">
              <FileText size={12} />
              <span>{contentsCount[ContentType.NOTE]}</span>
            </div>
          )}

          {contentsCount[ContentType.LINK] > 0 && (
            <div className="bg-purple-900/30 text-purple-400 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Link2 size={12} />
              <span>{contentsCount[ContentType.LINK]}</span>
            </div>
          )}

          {contentsCount[ContentType.VIDEO] > 0 && (
            <div className="bg-red-900/30 text-red-400 px-2 py-1 rounded text-xs flex items-center gap-1">
              <Video size={12} />
              <span>{contentsCount[ContentType.VIDEO]}</span>
            </div>
          )}

          {contentsCount[ContentType.DOCUMENT] > 0 && (
            <div className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1">
              <File size={12} />
              <span>{contentsCount[ContentType.DOCUMENT]}</span>
            </div>
          )}

          {totalContents === 0 && (
            <div className="bg-gray-700/30 text-gray-400 px-2 py-1 rounded text-xs">
              No content
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            className="flex-1 text-sm px-3 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-all flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit3 size={14} />
            <span>Edit</span>
          </button>
          <button
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <Eye size={14} />
            <span>View</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitCard;
