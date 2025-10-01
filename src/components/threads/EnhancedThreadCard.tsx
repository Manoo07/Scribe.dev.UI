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
} from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Thread } from "./threadTypes";

interface EnhancedThreadCardProps {
  thread: Thread;
  onClick?: () => void;
  showClassroomInfo?: boolean;
}

const EnhancedThreadCard: React.FC<EnhancedThreadCardProps> = ({
  thread,
  onClick,
  showClassroomInfo = true,
}) => {
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
      className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors cursor-pointer"
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
              <span>{thread.authorName || thread.user?.name || "Unknown"}</span>
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
          {typeof thread.isResolved === "boolean" &&
            !thread.isResolved &&
            thread.repliesCount === 0 && (
              <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-xs">
                Unanswered
              </span>
            )}

          {thread.isResolved && (
            <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">
              Resolved
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedThreadCard;
