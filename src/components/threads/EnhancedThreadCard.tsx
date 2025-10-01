import {
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Globe,
  MessageCircle,
  Pin,
  Reply,
  Tag,
  User,
  Heart,
  Loader2,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Thread } from "./threadTypes";
import { toggleThreadLike, deleteThread } from "../../services/api";
import { useToast } from "../../hooks/use-toast";
import { useOwnership } from "../../hooks/useOwnership";

interface EnhancedThreadCardProps {
  thread: Thread;
  onClick?: () => void;
  showClassroomInfo?: boolean;
  onLikeToggle?: (
    threadId: string,
    newLikeCount: number,
    isLiked: boolean
  ) => void;
}

const EnhancedThreadCard: React.FC<EnhancedThreadCardProps> = ({
  thread,
  onClick,
  showClassroomInfo = true,
  onLikeToggle,
}) => {
  const { toast } = useToast();
  const { isOwner } = useOwnership();
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(thread.likesCount || 0);
  const [localIsLiked, setLocalIsLiked] = useState(thread.isLikedByMe || false);

  // Check if current user owns this thread
  const isThreadOwner = isOwner(thread.user.id);

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

    setIsLiking(true);
    try {
      const response = await toggleThreadLike(thread.id);

      // Update local state optimistically
      const newLikeCount =
        response.likesCount || localLikeCount + (localIsLiked ? -1 : 1);
      const newIsLiked =
        response.liked !== undefined ? response.liked : !localIsLiked;

      setLocalLikeCount(newLikeCount);
      setLocalIsLiked(newIsLiked);

      // Notify parent component
      if (onLikeToggle) {
        onLikeToggle(thread.id, newLikeCount, newIsLiked);
      }

      toast({
        title: "Success",
        description: newIsLiked ? "Thread liked!" : "Thread unliked!",
        variant: "default",
      });
    } catch (error: any) {
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

  const handleDeleteThread = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from triggering

    if (!isThreadOwner) {
      toast({
        title: "Error",
        description: "You can only delete your own threads",
        variant: "destructive",
      });
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this thread? This action cannot be undone."
      )
    ) {
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

      // Reload the page or notify parent to refresh threads list
      window.location.reload();
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
      setShowDeleteMenu(false);
    }
  };

  const getThreadTypeIcon = () => {
    if (thread.threadType === "generic") {
      return <Globe className="w-4 h-4 text-blue-400" />;
    }
    return <BookOpen className="w-4 h-4 text-green-400" />;
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
      <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs flex items-center gap-1">
        <BookOpen className="w-3 h-3" />
        {thread.unitName}
      </span>
    );
  };

  return (
    <div
      className="bg-gray-700 border border-gray-600 rounded-lg p-6 hover:border-gray-500 hover:bg-gray-600 transition-all duration-200 cursor-pointer shadow-sm"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getThreadTypeIcon()}
            <h3 className="text-lg font-medium text-white hover:text-blue-400 transition-colors">
              {thread.title || "Untitled"}
            </h3>
            {thread.isResolved && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
            {thread.threadType === "generic" &&
              thread.visibility === "public" && (
                <Pin className="w-4 h-4 text-yellow-400" />
              )}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-400 flex-wrap">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{thread.user?.name || thread.authorName || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
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
              <Brain className="w-3 h-3" />
              <span>AI Insights</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <MessageCircle className="w-4 h-4" />
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
            p: ({ children }) => <p className="mb-0">{children}</p>,
            code: ({ children }) => (
              <code className="bg-gray-700 px-1 rounded text-xs">
                {children}
              </code>
            ),
            strong: ({ children }) => (
              <strong className="text-white">{children}</strong>
            ),
            em: ({ children }) => <em className="text-gray-200">{children}</em>,
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
                ? "text-red-400 hover:text-red-300"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${localIsLiked ? "fill-current" : ""}`}
            />
            <span>{localLikeCount || 0}</span>
            {isLiking && <Loader2 className="w-4 h-4 animate-spin" />}
          </button>

          {thread.lastReplyAt && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Reply className="w-4 h-4" />
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
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteMenu(!showDeleteMenu);
                }}
                className="p-1.5 bg-gray-800/60 text-gray-400 rounded-md hover:bg-gray-800/80 hover:text-gray-200 transition-all duration-200 border border-gray-600/30"
                title="More options"
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>

              {/* Delete Menu */}
              {showDeleteMenu && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                  <button
                    onClick={handleDeleteThread}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-gray-700/50 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isDeleting ? "Deleting..." : "Delete Thread"}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedThreadCard;
