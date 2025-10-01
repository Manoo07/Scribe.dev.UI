import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  User,
  CheckCircle,
  Award,
  X,
  Edit,
  Trash2,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Flag,
} from "lucide-react";
import { ThreadReply } from "./threadTypes";
import {
  toggleReplyLike,
  acceptAnswer,
  unmarkAnswer,
  updateReply,
} from "../../services/api";
import { useToast } from "../../hooks/use-toast";
import { useOwnership } from "../../hooks/useOwnership";
import { useAuth } from "../../context/AuthContext";

interface ReplyCardProps {
  reply: ThreadReply;
  threadId: string;
  isThreadOwner: boolean;
  threadStatus: string;
  onLikeToggle?: (
    replyId: string,
    newLikeCount: number,
    isLiked: boolean
  ) => void;
  onAnswerAccepted?: (replyId: string) => void;
  onAnswerUnmarked?: () => void;
  onEditReply?: (replyId: string, content: string) => void;
  onDeleteReply?: (replyId: string) => void;
}

const ReplyCard: React.FC<ReplyCardProps> = ({
  reply,
  threadId,
  isThreadOwner,
  threadStatus,
  onLikeToggle,
  onAnswerAccepted,
  onAnswerUnmarked,
  onEditReply,
  onDeleteReply,
}) => {
  const { toast } = useToast();
  const { isOwner, currentUserId } = useOwnership();
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingReply, setIsUpdatingReply] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(reply.likesCount);
  const [localIsLiked, setLocalIsLiked] = useState(reply.isLikedByMe);
  const [localIsAccepted, setLocalIsAccepted] = useState(reply.isAccepted);
  const [editContent, setEditContent] = useState(reply.content);

  // Ref for click outside handling
  const deleteMenuRef = useRef<HTMLDivElement>(null);
  const editAreaRef = useRef<HTMLDivElement>(null);

  // Check if current user owns this reply
  const isReplyOwner = isOwner(reply.user.id);

  // Function to enter edit mode
  const handleEnterEditMode = () => {
    if (!isReplyOwner) {
      console.warn("⚠️ Cannot edit: Not the owner");
      return;
    }

    console.log("🔄 Entering edit mode for reply:", reply.id);
    setIsEditing(true);
    setEditContent(reply.content); // Reset to original content
  };

  // Function to exit edit mode
  const handleExitEditMode = () => {
    console.log("🔄 Exiting edit mode for reply:", reply.id);
    setIsEditing(false);
    setEditContent(reply.content); // Reset to original content
  };

  // Debug ownership check
  console.log("🔐 Ownership Check Debug:", {
    replyId: reply.id,
    replyUserId: reply.user.id,
    replyUserName: reply.user.name,
    currentUserId: currentUserId,
    isReplyOwner: isReplyOwner,
    comparison: currentUserId === reply.user.id,
    authContext: {
      hasUser: !!user,
      userId: user?.id,
    },
    editingState: {
      isEditing,
      isUpdatingReply,
    },
  });

  // Sync localIsAccepted with prop changes from parent
  useEffect(() => {
    console.log(
      `🔄 ReplyCard ${reply.id}: syncing localIsAccepted from ${localIsAccepted} to ${reply.isAccepted}`
    );
    setLocalIsAccepted(reply.isAccepted);
  }, [reply.isAccepted, reply.id]); // Removed localIsAccepted from dependencies to prevent infinite loop

  // Reset editing state if component unmounts or reply changes
  useEffect(() => {
    return () => {
      if (isEditing) {
        console.log(
          `🔄 ReplyCard ${reply.id}: cleaning up editing state on unmount`
        );
        setIsEditing(false);
        setIsUpdatingReply(false);
      }
    };
  }, [reply.id, isEditing]);

  // Click outside handler to close menu and edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle delete menu
      if (
        deleteMenuRef.current &&
        !deleteMenuRef.current.contains(event.target as Node)
      ) {
        setIsDeleting(false);
      }

      // Handle edit mode - close if clicking outside edit area
      if (
        isEditing &&
        editAreaRef.current &&
        !editAreaRef.current.contains(event.target as Node)
      ) {
        console.log("🔄 Click outside edit area, exiting edit mode");
        handleExitEditMode();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing]);

  // Debug logging
  console.log("🔍 ReplyCard Debug:", {
    replyId: reply.id,
    replyUserId: reply.user.id,
    replyUserName: reply.user.name,
    isReplyOwner,
    currentUserId,
    isThreadOwner,
    threadStatus,
    localIsAccepted,
  });

  const handleLikeToggle = async () => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const response = await toggleReplyLike(reply.id);

      // Update local state optimistically
      const newLikeCount =
        response.likesCount || localLikeCount + (localIsLiked ? -1 : 1);
      const newIsLiked =
        response.liked !== undefined ? response.liked : !localIsLiked;

      setLocalLikeCount(newLikeCount);
      setLocalIsLiked(newIsLiked);

      // Notify parent component
      if (onLikeToggle) {
        onLikeToggle(reply.id, newLikeCount, newIsLiked);
      }

      toast({
        title: "Success",
        description: newIsLiked ? "Reply liked!" : "Reply unliked!",
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

  const handleToggleAnswer = async () => {
    if (isAccepting || !isThreadOwner) return;

    console.log(`🎯 Toggling answer for reply ${reply.id}:`, {
      currentLocalIsAccepted: localIsAccepted,
      replyId: reply.id,
      threadId: threadId,
    });

    setIsAccepting(true);
    try {
      if (localIsAccepted) {
        // Unmark as answer - call API to remove accepted answer
        console.log(`🚫 Unmarking reply ${reply.id} as answer`);
        await unmarkAnswer(threadId, reply.id);

        // Update local state
        setLocalIsAccepted(false);

        // Notify parent component to update thread status
        if (onAnswerUnmarked) {
          onAnswerUnmarked();
        }

        toast({
          title: "Success",
          description:
            "Answer unmarked successfully! Thread is now open for new answers.",
          variant: "default",
        });
      } else {
        // Mark as answer - call API to accept this reply
        console.log(`✅ Marking reply ${reply.id} as answer`);
        await acceptAnswer(threadId, reply.id);

        // Update local state
        setLocalIsAccepted(true);

        // Notify parent component to update thread status and remove other accepted answers
        if (onAnswerAccepted) {
          onAnswerAccepted(reply.id);
        }

        toast({
          title: "Success",
          description: "Answer marked as accepted! Thread is now resolved.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error(`❌ Error toggling answer for reply ${reply.id}:`, error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to toggle answer";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleEditReply = async () => {
    console.log("🔄 handleEditReply called - State Check:", {
      replyId: reply.id,
      threadId: threadId,
      isReplyOwner: isReplyOwner,
      isEditing: isEditing,
      isUpdatingReply: isUpdatingReply,
      currentUserId: currentUserId,
      replyUserId: reply.user.id,
      ownershipCheck: currentUserId === reply.user.id,
      oldContent: reply.content,
      newContent: editContent.trim(),
      isContentChanged: editContent.trim() !== reply.content,
    });

    // Check ownership first
    if (!isReplyOwner) {
      console.warn("⚠️ Edit blocked: Not the owner");
      return;
    }

    // Check if already updating
    if (isUpdatingReply) {
      console.log("⚠️ Edit already in progress, ignoring duplicate call");
      return;
    }

    // Check if content actually changed
    if (editContent.trim() === reply.content) {
      console.log("⚠️ No content change detected, exiting edit mode");
      setIsEditing(false);
      return;
    }

    // Check if content is empty
    if (editContent.trim() === "") {
      console.warn("⚠️ Content is empty, cannot save");
      toast({
        title: "Error",
        description: "Reply content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingReply(true);
      console.log("📡 Making API call to updateReply...");

      // Call the API directly
      const response = await updateReply(
        threadId,
        reply.id,
        editContent.trim()
      );

      console.log("✅ API call successful:", response);

      // Update local state
      if (onEditReply) {
        console.log("🔄 Calling parent onEditReply callback...");
        await onEditReply(reply.id, editContent.trim());
      }

      // Exit edit mode and show success
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Reply updated successfully!",
        variant: "default",
      });

      console.log("🎉 Edit reply process completed successfully");
    } catch (error: any) {
      console.error("❌ Error in handleEditReply:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        stack: error.stack,
      });

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update reply";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingReply(false);
    }
  };

  const handleDeleteReply = async () => {
    if (!isReplyOwner || isDeleting) return;

    if (!confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    setIsDeleting(true);
    try {
      if (onDeleteReply) {
        await onDeleteReply(reply.id);
        toast({
          title: "Success",
          description: "Reply deleted successfully!",
          variant: "default",
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete reply";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 hover:bg-gray-700 transition-all duration-200 shadow-sm">
      {/* Reply Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium text-white text-sm">
                {reply.user.name}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(reply.createdAt).toLocaleDateString()} at{" "}
                {new Date(reply.createdAt).toLocaleTimeString()}
              </div>
            </div>

            {/* Edit Button - Only visible to reply owner */}
            {isReplyOwner && !isEditing && (
              <button
                onClick={handleEnterEditMode}
                className="ml-2 p-1.5 bg-blue-600/20 text-blue-400 rounded-md hover:bg-blue-600/30 transition-all duration-200 border border-blue-500/30"
                title="Edit reply"
              >
                <Edit className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Accepted Answer Badge */}
          {localIsAccepted && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-500/30 shadow-sm">
              <CheckCircle className="w-2.5 h-2.5" />
              <span>✓ Accepted Answer</span>
            </div>
          )}

          {/* Single 3-dots Menu - Shows different options based on user role */}
          <div className="relative" ref={deleteMenuRef}>
            <button
              onClick={() => setIsDeleting(!isDeleting)} // Toggle menu
              className="p-1.5 bg-gray-800/60 text-gray-400 rounded-md hover:bg-gray-800/80 hover:text-gray-200 transition-all duration-200 border border-gray-600/30"
              title="More options"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>

            {/* Dropdown Menu */}
            {isDeleting && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                {/* Reply Owner Options */}
                {isReplyOwner && (
                  <>
                    <button
                      onClick={handleDeleteReply}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-gray-700/50 transition-colors text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement report functionality
                        toast({
                          title: "Info",
                          description: "Report functionality coming soon!",
                          variant: "default",
                        });
                        setIsDeleting(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-400 hover:bg-gray-700/50 transition-colors text-xs"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Report</span>
                    </button>
                  </>
                )}

                {/* Thread Owner Options - Mark/Unmark as Answer */}
                {isThreadOwner && (
                  <>
                    {localIsAccepted ? (
                      <button
                        onClick={handleToggleAnswer}
                        disabled={isAccepting}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-gray-700/50 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-3 h-3" />
                        <span>
                          {isAccepting ? "Unmarking..." : "Unmark as Answer"}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={handleToggleAnswer}
                        disabled={isAccepting}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-green-400 hover:bg-gray-700/50 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Award className="w-3 h-3" />
                        <span>
                          {isAccepting ? "Marking..." : "Mark as Answer"}
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Content */}
      <div
        className="text-gray-200 mb-4 prose prose-invert prose-sm max-w-none"
        ref={editAreaRef}
      >
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-800/80 border border-gray-600/50 rounded-lg p-3 text-white resize-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 text-sm"
              rows={3}
              placeholder="Edit your reply..."
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditReply}
                disabled={
                  editContent.trim() === reply.content ||
                  editContent.trim() === "" ||
                  isUpdatingReply
                }
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-md text-sm flex items-center gap-2"
              >
                {isUpdatingReply ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
              <button
                onClick={handleExitEditMode}
                disabled={isUpdatingReply}
                className="px-3 py-2 bg-gray-700/80 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {reply.content}
          </div>
        )}
      </div>

      {/* Reply Actions */}
      <div className="flex items-center justify-between border-t border-gray-700/30 pt-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleLikeToggle}
            disabled={isLiking}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all duration-200 font-medium ${
              localIsLiked
                ? "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30"
                : "bg-gray-800/60 text-gray-300 hover:bg-gray-800/80 hover:text-gray-200 border border-gray-600/30"
            }`}
          >
            <Heart
              className={`w-3 h-3 ${localIsLiked ? "fill-current" : ""}`}
            />
            <span className="font-medium">{localLikeCount}</span>
            {isLiking && (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>

          <button className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-800/60 text-gray-300 rounded-md hover:bg-gray-800/80 hover:text-gray-200 transition-all duration-200 font-medium border border-gray-600/30">
            <MessageCircle className="w-3 h-3" />
            <span>Reply</span>
          </button>

          <button className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-800/60 text-gray-300 rounded-md hover:bg-gray-800/80 hover:text-gray-200 transition-all duration-200 font-medium border border-gray-600/30">
            <Share2 className="w-3 h-3" />
            <span>Share</span>
          </button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Space for future actions */}
        </div>
      </div>
    </div>
  );
};

export default ReplyCard;
