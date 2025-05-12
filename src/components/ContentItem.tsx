import React, { useState } from "react";
import { EducationalContent, ContentType } from "../types";
import {
  FileText,
  Link2,
  Video,
  File,
  ExternalLink,
  Download,
  Trash2,
} from "lucide-react";
import { formatDate } from "../utils/dateUtils";
import { marked } from "marked";
import { deleteContent } from "../services/api";

interface ContentItemProps {
  content: EducationalContent;
  onRefresh: () => void;
}

const ContentItem: React.FC<ContentItemProps> = ({ content, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getIcon = () => {
    switch (content.type) {
      case ContentType.NOTE:
        return <FileText size={20} className="text-emerald-400" />;
      case ContentType.LINK:
        return <Link2 size={20} className="text-purple-400" />;
      case ContentType.VIDEO:
        return <Video size={20} className="text-red-400" />;
      case ContentType.DOCUMENT:
        return <File size={20} className="text-blue-400" />;
      default:
        return <File size={20} className="text-gray-400" />;
    }
  };

  const getBadgeColor = () => {
    switch (content.type) {
      case ContentType.NOTE:
        return "bg-emerald-900/30 text-emerald-400";
      case ContentType.LINK:
        return "bg-purple-900/30 text-purple-400";
      case ContentType.VIDEO:
        return "bg-red-900/30 text-red-400";
      case ContentType.DOCUMENT:
        return "bg-blue-900/30 text-blue-400";
      default:
        return "bg-gray-700 text-gray-400";
    }
  };

  const renderPreview = () => {
    switch (content.type) {
      case ContentType.NOTE:
        return (
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: marked(content.content) }}
          />
        );
      case ContentType.LINK:
        return (
          <div className="flex items-center">
            <a
              href={content.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              {content.content}
              <ExternalLink size={14} />
            </a>
          </div>
        );
      case ContentType.VIDEO:
        if (
          content.content.includes("youtube.com") ||
          content.content.includes("youtu.be")
        ) {
          // Extract YouTube video ID and create embed
          const videoId = content.content.includes("youtu.be")
            ? content.content.split("/").pop()
            : new URL(content.content).searchParams.get("v");

          return (
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          );
        } else {
          return (
            <div className="flex items-center">
              <a
                href={content.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
              >
                Watch Video
                <ExternalLink size={14} />
              </a>
            </div>
          );
        }
      case ContentType.DOCUMENT:
        return (
          <div className="flex items-center">
            <a
              href={`http://localhost:3000/files/${content.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center gap-2 transition-colors"
            >
              <Download size={14} />
              Download Document
            </a>
          </div>
        );
      default:
        return <p className="text-gray-400">Content preview not available</p>;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteContent(content.id);
      onRefresh();
    } catch (error) {
      console.error("Failed to delete content:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-gray-700/50 rounded-lg border border-gray-600 overflow-hidden">
      <div
        className="p-4 flex items-start gap-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="mt-1">{getIcon()}</div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor()}`}
            >
              {content.type}
            </span>
            <span className="text-xs text-gray-400">
              v{content.version} • {formatDate(new Date(content.createdAt))}
            </span>
          </div>

          {content.type === ContentType.NOTE ? (
            <p className="text-gray-300 text-sm line-clamp-1">
              {content.content.split("\n")[0]}
            </p>
          ) : content.type === ContentType.LINK ? (
            <p className="text-gray-300 text-sm line-clamp-1">
              {content.content}
            </p>
          ) : (
            <p className="text-gray-300 text-sm">
              {content.type === ContentType.VIDEO
                ? "Video content"
                : "Document file"}
            </p>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-600 p-4">
          {renderPreview()}

          <div className="mt-4 pt-2 border-t border-gray-600 flex justify-between items-center">
            <div className="text-xs text-gray-400">
              Added on {formatDate(new Date(content.createdAt))}
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="text-red-400 hover:text-red-300 flex items-center gap-1.5 text-sm"
              >
                <Trash2 size={14} />
                Delete
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  className="text-gray-400 hover:text-gray-300 text-sm px-2 py-1"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1 rounded flex items-center gap-1.5 transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentItem;
