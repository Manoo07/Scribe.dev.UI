import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Award,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import React, { useState } from "react";
import { ThreadReply } from "./threadTypes";

interface ReplyCardProps {
  reply: ThreadReply;
  threadId: string;
  depth?: number;
}

const ReplyCard: React.FC<ReplyCardProps> = ({
  reply,
  threadId: _threadId,
  depth = 0,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

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
    return `${diffInDays}d ago`;
  };

  return (
    <div
      className={`${depth > 0 ? "ml-8 border-l-2 border-gray-700 pl-4" : ""}`}
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* User Info */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <span className="font-medium text-white">
            {reply.authorName || "Anonymous"}
          </span>
          <span>•</span>
          <span>{formatTimeAgo(reply.createdAt)}</span>
        </div>

        {/* Reply Content */}
        <div className="text-gray-200 text-sm mb-2 leading-relaxed">
          {reply.content}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Vote Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle upvote
            }}
            className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-gray-700 hover:text-orange-500 text-xs font-medium rounded transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>{reply.likesCount || 1}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle downvote
            }}
            className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-gray-700 hover:text-blue-500 text-xs font-medium rounded transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-gray-700 hover:text-white text-xs font-medium rounded transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle award
            }}
            className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-gray-700 hover:text-white text-xs font-medium rounded transition-colors"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Award</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle share
            }}
            className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-gray-700 hover:text-white text-xs font-medium rounded transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <div className="relative ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="flex items-center px-2 py-1 text-gray-400 hover:bg-gray-700 hover:text-white text-xs font-medium rounded transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <button className="w-full text-left px-3 py-2 text-xs text-white hover:bg-gray-700 first:rounded-t-lg transition-colors">
                  Save
                </button>
                <button className="w-full text-left px-3 py-2 text-xs text-white hover:bg-gray-700 transition-colors">
                  Hide
                </button>
                <button className="w-full text-left px-3 py-2 text-xs text-white hover:bg-gray-700 last:rounded-b-lg transition-colors">
                  Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-3 p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
            <textarea
              placeholder="Add your reply"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                onClick={() => setShowReplyForm(false)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                Reply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyCard;
