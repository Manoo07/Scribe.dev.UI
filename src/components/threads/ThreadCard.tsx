import {
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Clock,
  User,
  MoreHorizontal,
  Share2,
  Bookmark,
  Award,
} from "lucide-react";
import React, { useState } from "react";
import { Thread } from "./threadTypes";

interface ThreadCardProps {
  thread: Thread;
  onClick?: () => void;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ thread, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  return (
    <div
      className="border-t border-gray-700 py-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Meta Information - Top */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="font-medium">{thread.authorName || "Unknown"}</span>
          </div>
          <span>•</span>
          <span>{formatTimeAgo(thread.createdAt)}</span>
          {(thread.unitName || thread.category) && (
            <>
              <span>•</span>
              <span className="text-blue-400 italic">
                {thread.threadType === "classroom"
                  ? thread.unitName
                  : thread.category || "General"}
              </span>
            </>
          )}
        </div>

        {/* Thread Title */}
        <h3 className="text-white font-semibold text-base mb-2 hover:text-blue-400 transition-colors leading-snug">
          {thread.title}
        </h3>

        {/* Thread Content Preview */}
        <p className="text-gray-300 text-sm line-clamp-2 mb-3 leading-relaxed">
          {thread.content}
        </p>

        {/* Footer Actions */}
        <div className="flex items-center gap-1">
          {/* Vote Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle upvote
            }}
            className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-gray-700 hover:text-orange-500 text-xs font-medium rounded transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
            <span>{thread.likesCount || 0}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle downvote
            }}
            className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-gray-700 hover:text-blue-500 text-xs font-medium rounded transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle reply
            }}
            className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-gray-700 hover:text-white text-xs font-medium rounded transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Reply</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle award
            }}
            className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-gray-700 hover:text-white text-xs font-medium rounded transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>Award</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle share
            }}
            className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-gray-700 hover:text-white text-xs font-medium rounded transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <div className="relative ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="flex items-center gap-1.5 px-2 py-1 text-gray-400 hover:bg-gray-700 hover:text-white text-xs font-medium rounded transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 first:rounded-t-lg transition-colors">
                  Follow post
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">
                  Show fewer posts like this
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors">
                  Hide
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 last:rounded-b-lg transition-colors">
                  Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreadCard;
