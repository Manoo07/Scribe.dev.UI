import {
  CheckCircle,
  Download,
  Edit3,
  ExternalLink,
  File,
  FileText,
  Link2,
  Save,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { marked } from "marked";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { deleteContent, updateContent } from "../services/api";
import { ContentType, EducationalContent } from "../types";
import { formatDate } from "../utils/dateUtils";

interface ContentItemProps {
  content: EducationalContent;
  onRefresh: () => void;
}

const ContentItem: React.FC<ContentItemProps> = ({ content, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content.content);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const canEdit = () => {
    // Only allow editing for NOTE, LINK, and VIDEO types
    return [ContentType.NOTE, ContentType.LINK, ContentType.VIDEO].includes(
      content.type
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(content.content);
    setEditError(null);
    setSaveSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(content.content);
    setEditError(null);
  };

  const handleSave = async () => {
    if (!editedContent.trim()) {
      setEditError("Content cannot be empty");
      return;
    }

    // URL validation for LINK and VIDEO types
    if (
      (content.type === ContentType.LINK ||
        content.type === ContentType.VIDEO) &&
      editedContent.trim()
    ) {
      try {
        new URL(editedContent.trim());
      } catch {
        setEditError("Please enter a valid URL");
        return;
      }
    }

    setIsSaving(true);
    setEditError(null);

    try {
      await updateContent(content.id, {
        content: editedContent.trim(),
        type: content.type,
      });

      setSaveSuccess(true);
      setIsEditing(false);

      // Show success briefly then refresh
      setTimeout(() => {
        setSaveSuccess(false);
        onRefresh();
      }, 1500);
    } catch (error) {
      console.error("Failed to update content:", error);
      setEditError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditForm = () => {
    switch (content.type) {
      case ContentType.NOTE:
        return (
          <div className="space-y-3">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              rows={6}
              placeholder="Enter your note content (Markdown supported)..."
            />
            <div className="text-xs text-gray-400">
              💡 Tip: You can use Markdown formatting (e.g., **bold**, *italic*,
              `code`)
            </div>
          </div>
        );
      case ContentType.LINK:
      case ContentType.VIDEO:
        return (
          <div className="space-y-3">
            <input
              type="url"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full bg-gray-600 border border-gray-500 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                content.type === ContentType.VIDEO
                  ? "Enter video URL (YouTube, etc.)"
                  : "Enter link URL"
              }
            />
            <div className="text-xs text-gray-400">
              {content.type === ContentType.VIDEO
                ? "💡 Tip: YouTube links will be automatically embedded"
                : "💡 Tip: Enter a complete URL starting with http:// or https://"}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPreview = () => {
    const contentToRender = isEditing ? editedContent : content.content;

    switch (content.type) {
      case ContentType.NOTE:
        if (isEditing) {
          return (
            <div className="space-y-4">
              {renderEditForm()}
              {contentToRender && (
                <div className="border-t border-gray-600 pt-4">
                  <div className="text-sm text-gray-400 mb-2">Preview:</div>
                  <div
                    className="prose prose-invert max-w-none text-sm bg-gray-800/50 rounded p-3"
                    dangerouslySetInnerHTML={{
                      __html: marked(contentToRender),
                    }}
                  />
                </div>
              )}
            </div>
          );
        }
        return (
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: marked(contentToRender) }}
          />
        );
      case ContentType.LINK:
        if (isEditing) {
          return renderEditForm();
        }
        return (
          <div className="flex items-center">
            <a
              href={contentToRender}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2 break-all"
            >
              {contentToRender}
              <ExternalLink size={14} />
            </a>
          </div>
        );
      case ContentType.VIDEO:
        if (isEditing) {
          return (
            <div className="space-y-4">
              {renderEditForm()}
              {contentToRender && contentToRender.includes("youtube") && (
                <div className="border-t border-gray-600 pt-4">
                  <div className="text-sm text-gray-400 mb-2">Preview:</div>
                  <div className="aspect-video bg-gray-800 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-sm">
                      Video preview will appear here
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        }

        if (
          contentToRender.includes("youtube.com") ||
          contentToRender.includes("youtu.be")
        ) {
          const videoId = contentToRender.includes("youtu.be")
            ? contentToRender.split("/").pop()
            : new URL(contentToRender).searchParams.get("v");

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
                href={contentToRender}
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
          <div className="flex items-center justify-between">
            <a
              href={`http://localhost:3000/files/${content.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center gap-2 transition-colors"
            >
              <Download size={14} />
              Download Document
            </a>
            <div className="text-xs text-gray-400">
              Documents cannot be edited inline
            </div>
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
      setDeleteSuccess(true);
      setIsDeleted(true);

      setTimeout(() => {
        onRefresh();
      }, 500);
    } catch (error) {
      console.error("Failed to delete content:", error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const SuccessMessage = () => (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle size={20} />
        <span className="text-sm font-medium">
          Content deleted successfully
        </span>
      </div>
    </div>
  );

  if (deleteSuccess) {
    return (
      <div
        className={`bg-gray-700/50 rounded-lg border border-green-500/30 overflow-hidden transition-all duration-500 ease-out ${
          isDeleted ? "opacity-0 scale-95 transform" : "opacity-100 scale-100"
        }`}
      >
        <SuccessMessage />
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-700/50 rounded-lg border border-gray-600 overflow-hidden transition-all duration-300 ease-in-out relative ${
        isDeleting ? "opacity-50 scale-98" : "opacity-100 scale-100"
      }`}
    >
      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="absolute top-0 left-0 right-0 bg-green-600 text-white text-center py-2 text-sm z-10 animate-fadeIn">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle size={16} />
            Changes saved successfully!
          </div>
        </div>
      )}

      <div
        className="p-4 flex items-start gap-3 cursor-pointer hover:bg-gray-700/30 transition-colors duration-200"
        onClick={() => !isDeleting && !isEditing && setIsExpanded(!isExpanded)}
      >
        {!isEditing ? (
          <>
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
                <p className="text-gray-300 text-sm line-clamp-1 break-all">
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

            <div className="flex items-center gap-2 ml-2">
              {canEdit() && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 p-1.5 rounded transition-all duration-200"
                  disabled={isDeleting}
                  title="Edit content"
                >
                  <Edit3 size={16} />
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1.5 rounded transition-all duration-200"
                disabled={isDeleting}
                title="Delete content"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-1">{getIcon()}</div>
            <div className="flex-grow min-w-0">
              <div className="mb-3">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${getBadgeColor()}`}
                >
                  {content.type} (EDITING)
                </span>
              </div>
              {renderEditForm()}
            </div>
          </>
        )}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="border-t border-gray-600 p-4">
          {editError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-400 text-sm">
              {editError}
            </div>
          )}

          <div className="mb-4">
            {content.type === ContentType.NOTE && (
              <div className="space-y-3">
                <div className="text-sm text-gray-400 mb-2">Preview:</div>
                <div
                  className="prose prose-invert max-w-none text-sm bg-gray-800/50 rounded p-3"
                  dangerouslySetInnerHTML={{
                    __html: marked(content.content),
                  }}
                />
              </div>
            )}
            {content.type === ContentType.LINK && (
              <div className="flex items-center">
                <a
                  href={content.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-2 break-all"
                >
                  {content.content}
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
            {content.type === ContentType.VIDEO && (
              <>
                {content.content.includes("youtube.com") ||
                content.content.includes("youtu.be") ? (
                  <div className="aspect-video">
                    {(() => {
                      const videoId = content.content.includes("youtu.be")
                        ? content.content.split("/").pop()
                        : new URL(content.content).searchParams.get("v");
                      return (
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      );
                    })()}
                  </div>
                ) : (
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
                )}
              </>
            )}
            {content.type === ContentType.DOCUMENT && (
              <div className="flex items-center justify-between">
                <a
                  href={`http://localhost:3000/files/${content.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center gap-2 transition-colors"
                >
                  <Download size={14} />
                  Download Document
                </a>
                <div className="text-xs text-gray-400">
                  Documents cannot be edited inline
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-600 flex justify-between items-center">
            <div className="text-xs text-gray-400">
              Added on {formatDate(new Date(content.createdAt))}
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="border-t border-gray-600 p-4 bg-gray-700/20">
          <div className="flex justify-between items-end gap-4">
            <div className="flex-grow">
              {editError && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-400 text-sm">
                  {editError}
                </div>
              )}
              {renderEditForm()}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
                className="text-gray-400 hover:text-gray-300 flex items-center gap-1.5 text-sm px-3 py-2 rounded hover:bg-gray-700 transition-all duration-200"
                disabled={isSaving}
              >
                <X size={14} />
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className={`text-white text-sm px-4 py-2 rounded flex items-center gap-1.5 transition-all duration-200 ${
                  isSaving
                    ? "bg-green-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-500 hover:shadow-lg"
                }`}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay during deletion */}
      {isDeleting && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-20">
          <div className="bg-gray-800 rounded-lg px-4 py-2 flex items-center gap-2 border border-gray-600">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-300">Deleting content...</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Rendered as Portal */}
      {showDeleteConfirm &&
        createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-2xl max-w-lg w-full my-auto animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-700 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <Trash2 size={20} className="text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Delete {content.type.charAt(0) + content.type.slice(1).toLowerCase()}
                  </h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelDelete();
                  }}
                  className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                  disabled={isDeleting}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Are you sure you want to delete this {content.type.toLowerCase()}? This action cannot be undone and the content will be permanently removed.
                </p>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-700 p-6 flex items-center justify-between gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelDelete();
                  }}
                  className="px-6 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors font-medium"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className={`px-6 py-2.5 rounded-lg text-white flex items-center gap-2 transition-all duration-200 font-medium flex-shrink-0 ${
                    isDeleting
                      ? "bg-red-500 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-500"
                  }`}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete {content.type.charAt(0) + content.type.slice(1).toLowerCase()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ContentItem;
