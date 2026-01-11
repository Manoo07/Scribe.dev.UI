import {
  ArrowUp,
} from "lucide-react";
import React, { useState } from "react";
import { ThreadReply } from "./threadTypes";
import { toggleReplyLike } from "../../services/api";
import { useToast } from "../../hooks/use-toast";

interface ReplyCardProps {
  reply: ThreadReply;
  threadId: string;
  depth?: number;
  onLikeToggle?: (replyId: string, newLikeCount: number, isLiked: boolean) => void;
}

const ReplyCard: React.FC<ReplyCardProps> = ({
  reply,
  threadId,
  depth = 0,
  onLikeToggle,
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(reply.likesCount || 0);
  const [localIsLiked, setLocalIsLiked] = useState(reply.isLikedByMe || false);
  const { toast } = useToast();

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

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    try {
      const result = await toggleReplyLike(threadId, reply.id);
      
      // Update local state with exact response from backend
      const newLikesCount = result.likesCount;
      const newIsLiked = result.liked;
      
      setLocalLikesCount(newLikesCount);
      setLocalIsLiked(newIsLiked);
      
      // Notify parent component
      if (onLikeToggle) {
        onLikeToggle(reply.id, newLikesCount, newIsLiked);
      }

      toast({
        title: "Success",
        description: newIsLiked ? "Liked!" : "Like removed!",
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

  return (
    <div
      className={`${depth > 0 ? "ml-8 border-l-2 border-gray-700 pl-4" : ""}`}
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* User Info */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
          <span className="font-medium text-white">
            {reply.user.name || "Anonymous"}
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
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            disabled={isLiking}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
              localIsLiked
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "text-gray-400 hover:bg-gray-700 hover:text-orange-500"
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>{localLikesCount || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyCard;
