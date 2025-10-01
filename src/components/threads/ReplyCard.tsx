import {
  Award,
  CheckCircle,
  Edit,
  Flag,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Trash2,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/use-toast";
import { useOwnership } from "../../hooks/useOwnership";
import {
  acceptAnswer,
  toggleReplyLike,
  unmarkAnswer,
  updateReply,
} from "../../services/api";
import { ThreadReply } from "./threadTypes";

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
  const { isOwner, currentUserId, isLoading } = useOwnership();
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

  // Only show owner options when ownership is confirmed (not loading)
  const canShowOwnerOptions = isReplyOwner && !isLoading;

  // Function to enter edit mode
  const handleEnterEditMode = () => {
    if (!isReplyOwner) {
      console.warn("⚠️ Cannot edit: Not the owner");
      return;
    }
    setIsEditing(true);
    setEditContent(reply.content); // Reset to original content
  };

  // Function to exit edit mode
  const handleExitEditMode = () => {
    setIsEditing(false);
    setEditContent(reply.content); // Reset to original content
  };

  // Sync localIsAccepted with prop changes from parent
  useEffect(() => {
    setLocalIsAccepted(reply.isAccepted);
  }, [reply.isAccepted, reply.id]); // Removed localIsAccepted from dependencies to prevent infinite loop

  // Sync local like state with prop changes from parent
  useEffect(() => {
    setLocalLikeCount(reply.likesCount);
    setLocalIsLiked(reply.isLikedByMe);
  }, [reply.likesCount, reply.isLikedByMe, reply.id]);

  // Reset editing state if component unmounts or reply changes
  useEffect(() => {
    return () => {
      if (isEditing) {
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
        setShowDropdown(false);
      }

      // Handle edit mode - close if clicking outside edit area
      if (
        isEditing &&
        editAreaRef.current &&
        !editAreaRef.current.contains(event.target as Node)
      ) {
        handleExitEditMode();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing]);

  const handleLikeToggle = async () => {
    if (isLiking) return;

    // Optimistic update - immediately show the change
    const previousLikeCount = localLikeCount;
    const previousIsLiked = localIsLiked;

    // Calculate the new values
    const newLikeCount = previousIsLiked
      ? previousLikeCount - 1
      : previousLikeCount + 1;
    const newIsLiked = !previousIsLiked;

    // Apply optimistic update
    setLocalLikeCount(newLikeCount);
    setLocalIsLiked(newIsLiked);
    setIsLiking(true);

    try {
      const response = await toggleReplyLike(reply.id);

      // Use server response for accurate state, fallback to optimistic if server response is incomplete
      const finalLikeCount = response?.likesCount ?? newLikeCount;
      const finalIsLiked = response?.liked ?? newIsLiked;

      // Update local state with final values
      setLocalLikeCount(finalLikeCount);
      setLocalIsLiked(finalIsLiked);

      // Notify parent component with final values
      if (onLikeToggle) {
        onLikeToggle(reply.id, finalLikeCount, finalIsLiked);
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

      console.error("❌ Like toggle failed:", {
        replyId: reply.id,
        error: errorMessage,
        revertedCount: previousLikeCount,
        revertedLiked: previousIsLiked,
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleToggleAnswer = async () => {
    // Double-check permission before proceeding
    if (!isThreadOwner) {
      toast({
        title: "Permission Denied",
        description: "Only the thread owner can mark answers as accepted.",
        variant: "destructive",
      });
      return;
    }

    if (isAccepting) return;

    // Show confirmation dialog for marking answers
    const action = localIsAccepted ? "unmark" : "mark";
    const confirmMessage = localIsAccepted
      ? "Are you sure you want to unmark this as the accepted answer? The thread will return to unanswered status."
      : "Are you sure you want to mark this reply as the accepted answer? This will resolve the thread.";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsAccepting(true);
    try {
      if (localIsAccepted) {
        // Unmark as answer - call API to remove accepted answer

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
    // Check ownership first
    if (!isReplyOwner) {
      return;
    }

    // Check if already updating
    if (isUpdatingReply) {
      return;
    }

    // Check if content actually changed
    if (editContent.trim() === reply.content) {
      setIsEditing(false);
      return;
    }

    // Check if content is empty
    if (editContent.trim() === "") {
      toast({
        title: "Error",
        description: "Reply content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingReply(true);

      // Call the API directly
      const response = await updateReply(
        threadId,
        reply.id,
        editContent.trim()
      );

      // Update local state
      if (onEditReply) {
        onEditReply(reply.id, editContent.trim());
      }

      // Exit edit mode and show success
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Reply updated successfully!",
        variant: "default",
      });
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

    try {
      setIsDeleting(true); // Set loading state
      if (onDeleteReply) {
        onDeleteReply(reply.id);
        // Success message is handled by parent component
      }
    } catch (error: any) {
      console.error("❌ Error in ReplyCard delete:", error);

      // Handle specific backend errors
      if (error.message && error.message.includes("Forbidden: Not the owner")) {
        toast({
          title: "Access Denied",
          description: "You can only delete your own replies.",
          variant: "destructive",
        });
        return;
      }

      // For other errors, let parent handle them
      throw error;
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

            {/* Edit Button - Only visible to reply owner when ownership is confirmed */}
            {canShowOwnerOptions && !isEditing && (
              <button
                onClick={handleEnterEditMode}
                className="ml-2 p-1.5 bg-blue-600/20 text-blue-400 rounded-md hover:bg-blue-600/30 transition-all duration-200 border border-blue-500/30"
                title="Edit reply"
              >
                <Edit className="w-3 h-3" />
              </button>
            )}

            {/* Loading indicator when ownership check is in progress */}
            {isLoading && (
              <div className="ml-2 p-1.5 bg-gray-600/20 text-gray-400 rounded-md border border-gray-500/30">
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
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
              onClick={() => setShowDropdown(!showDropdown)} // Toggle menu
              className={`p-1.5 bg-gray-800/60 text-gray-400 rounded-md hover:bg-gray-800/80 hover:text-gray-200 transition-all duration-200 border border-gray-600/30 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              title={isLoading ? "Loading permissions..." : "More options"}
              disabled={isLoading}
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                {/* Reply Owner Options - Only show when ownership is confirmed */}
                {canShowOwnerOptions && (
                  <>
                    <button
                      onClick={() => {
                        setShowDeleteDialog(true);
                        setShowDropdown(false); // Close dropdown when opening dialog
                      }}
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
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-400 hover:bg-gray-700/50 transition-colors text-xs"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Report</span>
                    </button>
                  </>
                )}

                {/* Report Option - Available to everyone when not owner */}
                {!canShowOwnerOptions && (
                  <button
                    onClick={() => {
                      // TODO: Implement report functionality
                      toast({
                        title: "Info",
                        description: "Report functionality coming soon!",
                        variant: "default",
                      });
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-400 hover:bg-gray-700/50 transition-colors text-xs"
                  >
                    <Flag className="w-3 h-3" />
                    <span>Report</span>
                  </button>
                )}

                {/* Thread Owner Options - Mark/Unmark as Answer */}
                {isThreadOwner && (
                  <>
                    {localIsAccepted ? (
                      <button
                        onClick={handleToggleAnswer}
                        disabled={isAccepting}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-400 hover:bg-gray-700/50 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Unmark this reply as the accepted answer"
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
                        title="Mark this reply as the accepted answer (only thread owner can do this)"
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
          <div className="prose prose-invert prose-sm max-w-none text-gray-200">
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
                  <strong className="text-white font-semibold">
                    {children}
                  </strong>
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
                li: ({ children }) => (
                  <li className="text-gray-300">{children}</li>
                ),
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
              {reply.content}
            </ReactMarkdown>
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Delete Reply
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this reply? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  handleDeleteReply();
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete Reply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplyCard;
