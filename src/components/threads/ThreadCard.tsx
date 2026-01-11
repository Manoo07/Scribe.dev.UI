import {
  MessageCircle,
  ArrowUp,
  User,
} from "lucide-react";
import React, { useState } from "react";
import { Thread } from "./threadTypes";
import { useToast } from "../../hooks/use-toast";

interface ThreadCardProps {
  thread: Thread;
  onClick?: () => void;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ thread, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [localLikesCount] = useState(thread.likesCount || 0);
  
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
      className="p-4 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Meta Information - Top */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="font-medium">{thread.user.name || "Anonymous"}</span>
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
          {/* Like Count Display - Read Only */}
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400">
            <ArrowUp className="w-4 h-4" />
            <span>{localLikesCount}</span>
          </div>        </div>
      </div>
    </div>
  );
};

export default ThreadCard;