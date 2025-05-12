import React from "react";
import { ContentType } from "../types";
import { FileText, Link2, Video, File } from "lucide-react";

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
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-700 transition-all hover:shadow-lg hover:shadow-blue-900/10 hover:border-gray-600">
      <div className="p-5">
        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
          {name}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>

        <div className="mb-4 flex items-center gap-1.5 text-gray-500 text-xs">
          <span>Updated</span>
          <span className="text-gray-400">{lastUpdated}</span>
        </div>

        <div className="flex gap-2 mb-4">
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

        <div className="flex justify-between gap-2">
          <button
            className="text-sm px-3 py-1.5 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-1.5 rounded-md transition-colors"
            onClick={onView}
          >
            View Materials
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnitCard;
