import {
  ArrowLeft,
  Brain,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Filter,
  Heart,
  Loader2,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/use-toast";
import { useOwnership } from "../../hooks/useOwnership";
import {
  createReply,
  deleteThread,
  fetchThreadDetail,
  toggleThreadLike,
  updateThread,
} from "../../services/api";
import ConfirmationDialog from "../ui/ConfirmationDialog";
import ReplyCard from "./ReplyCard";
import ReplyForm from "./ReplyForm";
import { Thread, ThreadReply } from "./threadTypes";

interface ThreadDetailViewProps {
  threadId: string;
  onBack: () => void;
  onChangesOccurred?: () => void;
}

const ThreadDetailView: React.FC<ThreadDetailViewProps> = ({
  threadId,
  onBack,
  onChangesOccurred,
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isOwner, currentUserId } = useOwnership();
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isEditingThread, setIsEditingThread] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isUpdatingThread, setIsUpdatingThread] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isClosingThread, setIsClosingThread] = useState(false);
  const [isDeletingThread, setIsDeletingThread] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Pagination state for replies
  const [currentPage, setCurrentPage] = useState(1);
  const [repliesPerPage] = useState(10);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  // Replies sorting state
  const [repliesSortBy, setRepliesSortBy] = useState<string>("newest");
  const [isRepliesSortOpen, setIsRepliesSortOpen] = useState(false);
  const [selectedRepliesSortOption, setSelectedRepliesSortOption] =
    useState("Newest First");

  // Replies sort options - mapped to API endpoints
  const repliesSortOptions = [
    {
      value: "newest",
      label: "Newest First",
      order: "desc",
    },
    {
      value: "mostLiked",
      label: "Most Liked",
      order: "desc",
    },
    {
      value: "alphabetical",
      label: "Alphabetical",
      order: "asc",
    },
  ];

  // Ref for click outside handling
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Click outside handler to close more menu and replies sort dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Close more menu if clicking outside
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setIsMoreMenuOpen(false);
      }

      // Close replies sort dropdown if clicking outside
      if (isRepliesSortOpen && !target.closest(".filter-dropdown-container")) {
        setIsRepliesSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isRepliesSortOpen]);

  const loadThread = async (page = 1) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingReplies(true);
      }
      setError(null);

      const threadData = await fetchThreadDetail(
        threadId,
        page,
        repliesPerPage,
        { sortBy: repliesSortBy } // Use current sort setting
      );

      // Check if there are multiple accepted replies (this shouldn't happen)
      const acceptedReplies =
        threadData.replies?.data.filter((r: ThreadReply) => r.isAccepted) || [];
      if (acceptedReplies.length > 1) {
        console.error(
          "🚨 CRITICAL: Multiple replies are already marked as accepted in initial data:",
          acceptedReplies.map((r: ThreadReply) => ({
            id: r.id,
            content: r.content.substring(0, 30) + "...",
          }))
        );
      } else if (acceptedReplies.length === 1) {
      } else {
      }

      if (page === 1) {
        setThread(threadData);
      } else {
        // Update only replies for pagination
        setThread((prev) =>
          prev
            ? {
                ...prev,
                replies: threadData.replies,
              }
            : null
        );
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to load thread";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingReplies(false);
    }
  };

  useEffect(() => {
    loadThread(1);
  }, [threadId]);

  // Handle page change for replies
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadThread(newPage);
  };

  // Handle replies sorting with API calls
  const handleRepliesSort = async (sortBy: string) => {
    if (!thread) return;

    setIsLoadingReplies(true);
    try {
      // Map UI sort values to API parameters
      let apiSortBy = sortBy;
      let limit = 15; // Default limit

      switch (sortBy) {
        case "newest":
          apiSortBy = "newest";
          limit = 15;
          break;
        case "mostLiked":
          apiSortBy = "mostLiked";
          limit = 15;
          break;
        case "alphabetical":
          apiSortBy = "alphabetical";
          limit = 25;
          break;
        default:
          apiSortBy = "newest";
          limit = 15;
          break;
      }

      console.log("🔄 Fetching replies with API filters:", {
        threadId: thread.id,
        sortBy: apiSortBy,
        page: 1,
        limit: limit,
      });

      // Fetch replies with new sorting from API
      const threadData = await fetchThreadDetail(
        thread.id,
        1, // Reset to first page
        limit,
        { sortBy: apiSortBy } // Pass sort parameter
      );

      // Update thread with new replies data
      setThread((prev) =>
        prev
          ? {
              ...prev,
              replies: threadData.replies,
            }
          : null
      );

      // Reset pagination
      setCurrentPage(1);

      console.log("🔄 Replies sorted by API:", sortBy, "->", apiSortBy);
    } catch (error) {
      console.error("❌ Error sorting replies:", error);
      toast({
        title: "Error",
        description: "Failed to sort replies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingReplies(false);
    }
  };

  // Calculate pagination info
  const getPaginationInfo = () => {
    if (!thread?.replies?.pagination) return null;

    const { total, page, limit, hasNext } = thread.replies.pagination;
    const totalPages = Math.ceil(total / limit);
    const hasPrev = page > 1;

    return {
      currentPage: page,
      totalPages,
      hasNext,
      hasPrev,
      total,
      startItem: (page - 1) * limit + 1,
      endItem: Math.min(page * limit, total),
    };
  };

  const paginationInfo = getPaginationInfo();

  const handleThreadLikeToggle = async () => {
    if (!thread || isLiking) return;

    setIsLiking(true);
    try {
      const response = await toggleThreadLike(thread.id);

      // Update local state optimistically
      setThread((prev) =>
        prev
          ? {
              ...prev,
              likesCount: response.likesCount,
              isLikedByMe: response.liked,
            }
          : null
      );

      toast({
        title: "Success",
        description: response.liked ? "Thread liked!" : "Thread unliked!",
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

  const handleReplyLikeToggle = (
    replyId: string,
    newLikeCount: number,
    isLiked: boolean
  ) => {
    if (!thread) return;

    setThread((prev) =>
      prev
        ? {
            ...prev,
            replies: prev.replies
              ? {
                  ...prev.replies,
                  data: prev.replies.data.map((reply) =>
                    reply.id === replyId
                      ? {
                          ...reply,
                          likesCount: newLikeCount,
                          isLikedByMe: isLiked,
                        }
                      : reply
                  ),
                }
              : undefined,
          }
        : null
    );
  };

  const handleReplyCreated = (newReply: ThreadReply) => {
    if (!thread) return;

    setThread((prev) =>
      prev
        ? {
            ...prev,
            replies: prev.replies
              ? {
                  ...prev.replies,
                  data: [newReply, ...prev.replies.data],
                  pagination: {
                    ...prev.replies.pagination,
                    total: prev.replies.pagination.total + 1,
                  },
                }
              : {
                  data: [newReply],
                  pagination: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    hasNext: false,
                  },
                },
          }
        : null
    );

    // Mark that changes occurred
    if (onChangesOccurred) {
      onChangesOccurred();
    }
  };

  const handleCreateReply = async (content: string) => {
    console.log("🔄 handleCreateReply called with content:", content);
    if (!thread) {
      console.error("❌ No thread available");
      return;
    }

    try {
      console.log("🔄 Calling createReply API with:", {
        threadId: thread.id,
        content,
      });
      const newReply = await createReply({
        threadId: thread.id,
        content: content,
      });
      console.log("✅ Reply created successfully:", newReply);

      // Handle the reply created
      handleReplyCreated(newReply);
    } catch (error: any) {
      console.error("❌ Error creating reply:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to post reply";
      throw new Error(errorMessage);
    }
  };

  const handleAnswerAccepted = (replyId: string) => {
    if (!thread) return;

    // Check if there's already an accepted answer
    const currentAcceptedReply = thread.replies?.data.find((r) => r.isAccepted);
    if (currentAcceptedReply) {
    }

    setThread((prev) => {
      if (!prev) return null;

      const updatedThread = {
        ...prev,
        threadStatus: "RESOLVED" as const,
        acceptedAnswerId: replyId,
        replies: prev.replies
          ? {
              ...prev.replies,
              data: prev.replies.data.map((reply) => {
                const newIsAccepted = reply.id === replyId;

                return {
                  ...reply,
                  isAccepted: newIsAccepted,
                };
              }),
            }
          : undefined,
      };

      return updatedThread;
    });

    // Mark that changes occurred
    if (onChangesOccurred) {
      onChangesOccurred();
    }
  };

  const handleAnswerUnmarked = () => {
    if (!thread) return;

    setThread((prev) =>
      prev
        ? {
            ...prev,
            threadStatus: "UNANSWERED",
            acceptedAnswerId: null,
            replies: prev.replies
              ? {
                  ...prev.replies,
                  data: prev.replies.data.map((reply) => {
                    return {
                      ...reply,
                      isAccepted: false,
                    };
                  }),
                }
              : undefined,
          }
        : null
    );

    // Mark that changes occurred
    if (onChangesOccurred) {
      onChangesOccurred();
    }
  };

  const handleEditReply = async (replyId: string, newContent: string) => {
    if (!thread) return;

    // Update local state optimistically
    setThread((prev) =>
      prev
        ? {
            ...prev,
            replies: prev.replies
              ? {
                  ...prev.replies,
                  data: prev.replies.data.map((reply) =>
                    reply.id === replyId
                      ? { ...reply, content: newContent }
                      : reply
                  ),
                }
              : undefined,
          }
        : null
    );

    // TODO: Implement API call to update reply
    // await updateReply(replyId, newContent);
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!thread) return;

    try {
      // Call the API to delete the reply
      await deleteThread(replyId);

      // Remove reply from local state after successful API call
      setThread((prev) => {
        if (!prev) return null;

        const updatedThread = {
          ...prev,
          replies: prev.replies
            ? {
                ...prev.replies,
                data: prev.replies.data.filter((reply) => reply.id !== replyId),
                pagination: {
                  ...prev.replies.pagination,
                  total: prev.replies.pagination.total - 1,
                },
              }
            : undefined,
        };
        return updatedThread;
      });

      // Mark that changes occurred
      if (onChangesOccurred) {
        onChangesOccurred();
      }

      toast({
        title: "Success",
        description: "Reply deleted successfully!",
        variant: "default",
      });
    } catch (error: any) {
      // Handle errors
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete reply";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEditThread = () => {
    if (!thread) return;
    setEditTitle(thread.title);
    setEditContent(thread.content);
    setIsEditingThread(true);
  };

  const handleUpdateThread = async () => {
    if (!thread || !editTitle.trim() || !editContent.trim()) return;

    setIsUpdatingThread(true);
    try {
      const updatedThread = await updateThread(thread.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      });

      // Update local state
      setThread((prev) =>
        prev
          ? {
              ...prev,
              title: updatedThread.title || editTitle.trim(),
              content: updatedThread.content || editContent.trim(),
              updatedAt: new Date().toISOString(),
            }
          : null
      );

      setIsEditingThread(false);
      toast({
        title: "Success",
        description: "Thread updated successfully!",
        variant: "default",
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update thread";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingThread(false);
    }
  };

  const handleCancelEditThread = () => {
    setIsEditingThread(false);
    setEditTitle("");
    setEditContent("");
  };

  const handleCloseThread = async () => {
    if (!thread) return;

    setIsClosingThread(true);
    try {
      // TODO: Implement close thread API endpoint
      // await closeThread(thread.id);

      // Update local state optimistically
      setThread((prev) =>
        prev
          ? {
              ...prev,
              threadStatus: "CLOSED",
            }
          : null
      );

      setIsMoreMenuOpen(false);
      toast({
        title: "Success",
        description: "Thread closed successfully!",
        variant: "default",
      });

      // Mark that changes occurred
      if (onChangesOccurred) {
        onChangesOccurred();
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to close thread";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsClosingThread(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!thread) return;

    setIsDeletingThread(true);
    try {
      // Call the delete thread API endpoint
      await deleteThread(thread.id);

      toast({
        title: "Success",
        description: "Thread deleted successfully!",
        variant: "default",
      });

      // Mark that changes occurred
      if (onChangesOccurred) {
        onChangesOccurred();
      }

      // Navigate back to threads list
      onBack();
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
      setIsDeletingThread(false);
      setShowDeleteDialog(false);
    }
  };

  const openDeleteDialog = () => {
    setShowDeleteDialog(true);
    setIsMoreMenuOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Threads
          </button>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Threads
          </button>
        </div>
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-2">Failed to load thread</p>
            <p className="text-red-300 text-sm">
              {error || "Thread not found"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const replies = thread.replies?.data || [];
  const totalReplies = thread.replies?.pagination?.total || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Threads
        </button>
      </div>

      {/* Thread Content */}
      <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 shadow-lg">
        {/* Thread Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold text-white">{thread.title}</h1>

            <div className="flex items-center gap-2">
              {/* Thread Status Badge */}
              <div className="flex flex-col items-start gap-1">
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    thread.threadStatus === "RESOLVED"
                      ? "bg-gradient-to-r from-emerald-500/30 to-green-500/30 text-emerald-200 border border-emerald-400/40 shadow-sm"
                      : thread.threadStatus === "ANSWERED"
                      ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-200 border border-blue-400/40 shadow-sm"
                      : thread.threadStatus === "CLOSED"
                      ? "bg-gradient-to-r from-slate-500/30 to-gray-500/30 text-slate-200 border border-slate-400/40 shadow-sm"
                      : "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-400/30 shadow-sm"
                  }`}
                >
                  {thread.threadStatus === "RESOLVED" && "✓ Resolved"}
                  {thread.threadStatus === "ANSWERED" && "○ Answered"}
                  {thread.threadStatus === "CLOSED" && "🔒 Closed"}
                  {thread.threadStatus === "UNANSWERED" && "○ Unanswered"}
                </span>
              </div>

              {/* 3-dots Menu - Only visible to thread owner */}
              {isOwner(thread.user.id) && (
                <div className="relative" ref={moreMenuRef}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsMoreMenuOpen(!isMoreMenuOpen);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="p-1.5 bg-gray-800/60 text-gray-400 rounded-md hover:bg-gray-800/70 hover:text-gray-200 transition-all duration-300 border border-gray-600/30"
                    title="More options"
                  >
                    <MoreHorizontal className="w-2.5 h-2.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {isMoreMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 w-40 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10"
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
                          handleCloseThread();
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        disabled={isClosingThread}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-yellow-400 hover:bg-gray-700/30 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Lock className="w-2.5 h-2.5" />
                        <span>
                          {isClosingThread ? "Closing..." : "Close Thread"}
                        </span>
                      </button>
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
                        disabled={isDeletingThread}
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

          {/* Thread Meta with Edit Button */}
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{thread.user.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{totalReplies} replies</span>
            </div>

            {/* Edit Button - Beside timestamp like replies */}
            {isOwner(thread.user.id) && (
              <button
                onClick={handleEditThread}
                disabled={isEditingThread}
                className="ml-2 p-1.5 bg-blue-600/20 text-blue-400 rounded-md hover:bg-blue-600/30 transition-all duration-200 border border-blue-500/30"
                title="Edit thread"
              >
                <Edit className="w-2.5 h-2.5" />
              </button>
            )}

            {thread.threadType === "classroom" && (
              <span className="bg-purple-600/20 text-purple-400 px-1.5 py-0.5 rounded text-xs">
                {thread.classroomName}
              </span>
            )}
            {thread.threadType === "generic" && (
              <span className="bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded text-xs">
                {thread.category}
              </span>
            )}
          </div>
        </div>

        {/* Thread Content */}
        {isEditingThread ? (
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Thread title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={6}
                placeholder="Thread content..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpdateThread}
                disabled={
                  isUpdatingThread || !editTitle.trim() || !editContent.trim()
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUpdatingThread ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-3.5 h-3.5" />
                    Update Thread
                  </>
                )}
              </button>
              <button
                onClick={handleCancelEditThread}
                disabled={isUpdatingThread}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-600/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-300 mb-5 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-0 leading-relaxed text-sm">{children}</p>
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
              {thread.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Thread Actions */}
        <div className="flex items-center justify-between border-t border-slate-600/50 pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleThreadLikeToggle}
              disabled={isLiking}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                thread.isLikedByMe
                  ? "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 hover:from-red-500/30 hover:to-pink-500/30 border border-red-400/40 shadow-sm"
                  : "bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-slate-200 hover:from-slate-600/50 hover:to-slate-500/50 border border-slate-500/30 shadow-sm"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  thread.isLikedByMe ? "fill-current" : ""
                }`}
              />
              <span className="font-medium">{thread.likesCount}</span>
              {isLiking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            </button>

            <button className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-700/50 to-slate-600/50 text-slate-200 rounded-lg hover:from-slate-600/50 hover:to-slate-500/50 transition-all duration-200 font-medium border border-slate-500/30 text-sm shadow-sm">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>

          {/* Space for future actions */}
          <div className="flex items-center gap-2">
            {/* Future actions can be added here */}
          </div>
        </div>

        {/* Tags */}
        {Array.isArray(thread.tags) && thread.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-600/50">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex flex-wrap gap-2">
              {thread.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-slate-700/80 to-slate-600/80 text-slate-200 px-3 py-1.5 rounded-full text-sm border border-slate-500/40 shadow-sm hover:from-slate-600/80 hover:to-slate-500/80 transition-all duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {thread.hasAiInsights && (
          <div className="border-t border-slate-600/50 pt-6 mt-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                <Brain className="w-5 h-5 text-purple-300" />
              </div>
              <span className="text-purple-200 font-semibold text-lg">
                AI Insights
              </span>
            </div>

            {thread.aiSummary && (
              <div className="bg-gradient-to-br from-purple-600/15 to-pink-600/15 border border-purple-500/30 rounded-xl p-4 mb-4 shadow-sm">
                <h3 className="text-purple-200 font-semibold mb-3">Summary</h3>
                <p className="text-purple-100 text-sm leading-relaxed">
                  {thread.aiSummary}
                </p>
              </div>
            )}

            {thread.aiSuggestedAnswer && (
              <div className="bg-gradient-to-br from-blue-600/15 to-cyan-600/15 border border-blue-500/30 rounded-xl p-4 shadow-sm">
                <h3 className="text-blue-200 font-semibold mb-3">
                  Suggested Answer
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  {thread.aiSuggestedAnswer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Last Updated Info */}
      <div className="text-sm text-gray-400 text-center">
        {thread.updatedAt && (
          <>Last updated: {new Date(thread.updatedAt).toLocaleDateString()}</>
        )}
      </div>

      {/* Replies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              Replies ({thread.replies?.data?.length || 0})
            </h2>
            {thread.acceptedAnswerId && (
              <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded-full text-xs">
                ✓ Has Accepted Answer
              </span>
            )}
          </div>

          {/* Replies Sort Dropdown */}
          <div className="relative filter-dropdown-container">
            <button
              onClick={() => {
                console.log(
                  "🔄 Replies dropdown clicked, current state:",
                  isRepliesSortOpen
                );
                setIsRepliesSortOpen(!isRepliesSortOpen);
                console.log(
                  "🔄 Setting replies dropdown to:",
                  !isRepliesSortOpen
                );
              }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border border-gray-600"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">{selectedRepliesSortOption}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Replies Sort Dropdown Menu */}
            {isRepliesSortOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {repliesSortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setRepliesSortBy(option.value);
                        setSelectedRepliesSortOption(option.label);
                        setIsRepliesSortOpen(false);

                        // Sort replies based on selection
                        handleRepliesSort(option.value);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reply Form */}
        <ReplyForm
          threadId={thread.id}
          onSubmit={handleCreateReply}
          placeholder="Share your thoughts..."
        />

        {/* Replies List */}
        {(() => {
          // Debug logging for thread ownership

          return null;
        })()}

        {isLoadingReplies ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-500 animate-spin" />
            <p className="text-gray-400 text-lg">Loading replies...</p>
          </div>
        ) : thread.replies?.data && thread.replies.data.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 text-lg">No replies yet</p>
            <p className="text-gray-500 text-sm">Be the first to respond!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {thread.replies?.data?.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                threadId={thread.id}
                isThreadOwner={isOwner(thread.user.id)}
                threadStatus={thread.threadStatus || "UNANSWERED"}
                onLikeToggle={handleReplyLikeToggle}
                onAnswerAccepted={handleAnswerAccepted}
                onAnswerUnmarked={handleAnswerUnmarked}
                onEditReply={handleEditReply}
                onDeleteReply={handleDeleteReply}
              />
            ))}
            {paginationInfo && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationInfo.hasPrev}
                  className="p-2 rounded-md text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-gray-400 text-sm">
                  {paginationInfo.startItem}-{paginationInfo.endItem} of{" "}
                  {paginationInfo.total}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationInfo.hasNext}
                  className="p-2 rounded-md text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
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
        isLoading={isDeletingThread}
      />
    </div>
  );
};

export default ThreadDetailView;
