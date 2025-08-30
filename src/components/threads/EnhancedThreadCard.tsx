import {
  Brain,
  CheckCircle,
  Clock,
  Globe,
  Heart,
  Loader2,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Pin,
  Reply,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useToast } from "../../hooks/use-toast";
import { useOwnership } from "../../hooks/useOwnership";
import { deleteThread, toggleThreadLike } from "../../services/api";
import ConfirmationDialog from "../ui/ConfirmationDialog";
import { Thread } from "./threadTypes";

interface EnhancedThreadCardProps {
  thread: Thread;
  onClick?: () => void;
  showClassroomInfo?: boolean;
  onLikeToggle?: (
    threadId: string,
    newLikeCount: number,
    isLiked: boolean
  ) => void;
  onDelete?: (threadId: string) => void;
  onChangesOccurred?: () => void;
}

const EnhancedThreadCard: React.FC<EnhancedThreadCardProps> = ({
  thread,
  onClick,
  showClassroomInfo = true,
  onLikeToggle,
  onDelete,
  onChangesOccurred,
}) => {
  const { toast } = useToast();
  const { isOwner } = useOwnership();
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(thread.likesCount || 0);
  const [localIsLiked, setLocalIsLiked] = useState(thread.isLikedByMe || false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Check if current user owns this thread
  const isThreadOwner = isOwner(thread.user.id);

  // Click outside handler to close more menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowDeleteMenu(false);
      }
    };

    // Also close menu when clicking on the main card (but not on interactive elements)
    const handleCardClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking on the more menu or its children
      if (moreMenuRef.current && moreMenuRef.current.contains(target)) {
        return;
      }
      // Don't close if clicking on interactive elements
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input")
      ) {
        return;
      }
      setShowDeleteMenu(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleCardClick);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleCardClick);
    };
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from triggering
    if (isLiking) return;

    // Optimistic update - immediately show the change
    const previousLikeCount = localLikeCount;
    const previousIsLiked = localIsLiked;

    setLocalLikeCount(
      previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1
    );
    setLocalIsLiked(!previousIsLiked);
    setIsLiking(true);

    try {
      const response = await toggleThreadLike(thread.id);

      console.log("🔄 API Response for thread like:", {
        threadId: thread.id,
        response: response,
        responseType: typeof response,
        hasLikesCount: "likesCount" in response,
        hasLiked: "liked" in response,
        likesCountValue: response?.likesCount,
        likedValue: response?.liked,
      });

      // Update with actual server response
      const newLikeCount = response.likesCount || localLikeCount;
      const newIsLiked =
        response.liked !== undefined ? response.liked : !previousIsLiked;

      console.log("✅ Thread like update:", {
        threadId: thread.id,
        previousCount: previousLikeCount,
        newCount: newLikeCount,
        serverCount: response?.likesCount,
        previousLiked: previousIsLiked,
        newLiked: newIsLiked,
        serverLiked: response?.liked,
      });

      // Always use the optimistic values to maintain UI consistency
      // This ensures the like count is immediately updated for better UX
      setLocalLikeCount(newLikeCount);
      setLocalIsLiked(newIsLiked);

      // Notify parent component
      if (onLikeToggle) {
        onLikeToggle(thread.id, newLikeCount, newIsLiked);
      }

      // Mark that changes occurred
      if (onChangesOccurred) {
        onChangesOccurred();
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setLocalLikeCount(previousLikeCount);
      setLocalIsLiked(previousIsLiked);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to toggle like";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!isThreadOwner) {
      toast({
        title: "Error",
        description: "You can only delete your own threads",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      console.log("🗑️ Deleting thread:", thread.id);

      // Call the delete thread API endpoint
      await deleteThread(thread.id);

      toast({
        title: "Success",
        description: "Thread deleted successfully!",
        variant: "default",
      });

      // Notify parent component to refresh threads list instead of reloading page
      if (onDelete) {
        onDelete(thread.id);
      }

      // Mark that changes occurred
      if (onChangesOccurred) {
        onChangesOccurred();
      }
    } catch (error: any) {
      console.error("❌ Error deleting thread:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete thread";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setShowDeleteMenu(false);
    }
  };

  const openDeleteDialog = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowDeleteDialog(true);
    setShowDeleteMenu(false);
  };

  const getThreadTypeIcon = () => {
    if (thread.threadType === "generic") {
      return <Globe className="w-4 h-4 text-blue-400" />;
    }
    return <MessageSquare className="w-4 h-4 text-green-400" />;
  };

  const getThreadTypeLabel = () => {
    if (thread.threadType === "generic") {
      return (
        <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1">
          <Globe className="w-3 h-3" />
          {thread.category}
        </span>
      );
    }
    return (
      <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">
        {thread.unitName}
      </span>
    );
  };

  return (
    <div
      className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:border-gray-600/80 hover:bg-gray-800/95 transition-all duration-300 cursor-pointer shadow-sm"
      onClick={(e) => {
        // Don't open thread if we're interacting with delete functionality
        if (showDeleteMenu || showDeleteDialog) {
          return;
        }
        if (onClick) {
          onClick();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getThreadTypeIcon()}
            <h3 className="text-lg font-medium text-white hover:text-blue-400/80 transition-colors">
              {thread.title || "Untitled"}
            </h3>
            {thread.isResolved && (
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            )}
            {thread.threadType === "generic" &&
              thread.visibility === "public" && (
                <Pin className="w-2.5 h-2.5 text-yellow-400" />
              )}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap">
            <div className="flex items-center gap-1">
              <User className="w-2.5 h-2.5" />
              <span>{thread.user?.name || thread.authorName || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              <span>{formatTimeAgo(thread.createdAt || thread.createdAt)}</span>
            </div>

            {/* Thread type specific info */}
            {getThreadTypeLabel()}

            {/* Show classroom info for classroom threads when requested */}
            {showClassroomInfo && thread.threadType === "classroom" && (
              <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs">
                {thread.classroomName || ""}
              </span>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-col items-end gap-2">
          {thread.hasAiInsights && (
            <div className="flex items-center gap-1 bg-purple-600/20 text-purple-400 px-2 py-1 rounded-full text-xs">
              <Brain className="w-2 h-2" />
              <span>AI Insights</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <MessageCircle className="w-2.5 h-2.5" />
            <span>
              {typeof thread.repliesCount === "number"
                ? thread.repliesCount
                : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Content Preview with Markdown */}
      <div className="text-gray-300 mb-4 line-clamp-2 prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p className="mb-0 leading-relaxed">{children}</p>
            ),
            h1: ({ children }) => (
              <h1 className="text-lg font-semibold text-white mb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base font-semibold text-white mb-2">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold text-white mb-1">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-sm font-medium text-white mb-1">
                {children}
              </h4>
            ),
            h5: ({ children }) => (
              <h5 className="text-sm font-medium text-white mb-1">
                {children}
              </h5>
            ),
            h6: ({ children }) => (
              <h6 className="text-sm font-medium text-white mb-1">
                {children}
              </h6>
            ),
            code: ({ children, className, ...props }) => {
              const isInline = !className;
              return isInline ? (
                <code className="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-300 border border-gray-600">
                  {children}
                </code>
              ) : (
                <code className="block bg-gray-700 p-2 rounded text-xs font-mono text-emerald-300 border border-gray-600 overflow-x-auto">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="bg-gray-700 p-3 rounded border border-gray-600 overflow-x-auto mb-3">
                {children}
              </pre>
            ),
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="text-gray-200 italic">{children}</em>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-500 pl-3 italic text-gray-400 mb-3">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-3 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-3 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="text-gray-300">{children}</li>,
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-blue-400 hover:text-blue-400/80 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-3">
                <table className="min-w-full border border-gray-600 rounded">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-gray-600 px-3 py-2 text-left text-white font-semibold bg-gray-700">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-600 px-3 py-2 text-gray-300">
                {children}
              </td>
            ),
            hr: () => <hr className="border-gray-600 my-3" />,
          }}
        >
          {thread.content || ""}
        </ReactMarkdown>
      </div>

      {/* AI Summary */}
      {thread.aiSummary && (
        <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-medium text-sm">
              AI Summary
            </span>
          </div>
          <div className="text-purple-200 text-sm prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{thread.aiSummary}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* AI Suggested Answer */}
      {thread.aiSuggestedAnswer && (
        <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium text-sm">
              AI Suggested Answer
            </span>
          </div>
          <div className="text-blue-200 text-sm prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{thread.aiSuggestedAnswer}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Tags */}
      {Array.isArray(thread.tags) && thread.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-gray-400" />
          <div className="flex flex-wrap gap-1">
            {thread.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-600 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            disabled={isLiking}
            className={`flex items-center gap-1 text-sm transition-colors ${
              localIsLiked
                ? "text-red-400 hover:text-red-400/80"
                : "text-gray-400 hover:text-gray-300/80"
            }`}
          >
            <Heart
              className={`w-2.5 h-2.5 ${localIsLiked ? "fill-current" : ""}`}
            />
            <span>{localLikeCount || 0}</span>
            {isLiking && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
          </button>

          {thread.lastReplyAt && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Reply className="w-2.5 h-2.5" />
              <span>
                Last reply by {thread.lastReplyBy || ""} •{" "}
                {formatTimeAgo(thread.lastReplyAt)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Thread Status */}
          {thread.threadStatus === "UNANSWERED" && (
            <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs">
              Unanswered
            </span>
          )}
          {thread.threadStatus === "ANSWERED" && (
            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
              Answered
            </span>
          )}
          {thread.threadStatus === "RESOLVED" && (
            <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">
              Resolved
            </span>
          )}

          {/* Legacy status for backward compatibility */}
          {!thread.threadStatus &&
            typeof thread.isResolved === "boolean" &&
            !thread.isResolved &&
            (thread.repliesCount || 0) === 0 && (
              <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs">
                Unanswered
              </span>
            )}

          {!thread.threadStatus && thread.isResolved && (
            <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">
              Resolved
            </span>
          )}

          {/* Delete Button - Only visible to thread owner */}
          {isThreadOwner && (
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteMenu(!showDeleteMenu);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="p-1.5 bg-gray-800/60 text-gray-400 rounded-md hover:bg-gray-800/70 hover:text-gray-200 transition-all duration-300 border border-gray-600/30"
                title="More options"
              >
                <MoreHorizontal className="w-2 h-2" />
              </button>

              {/* Delete Menu */}
              {showDeleteMenu && (
                <div
                  className="absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDeleteDialog();
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-gray-700/30 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>Delete Thread</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteThread}
        title="Delete Thread"
        message="Are you sure you want to delete this thread? This action cannot be undone and all replies will be permanently removed."
        confirmText="Delete Thread"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default EnhancedThreadCard;
