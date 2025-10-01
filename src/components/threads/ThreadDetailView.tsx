import axios from "axios";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  MessageCircle,
  MoreVertical,
  Send,
  Tag,
  ThumbsUp,
  User,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  acceptAnswer,
  deleteThread,
  fetchThreadDetail,
  toggleThreadLike,
} from "../../services/api";

interface ThreadDetailViewProps {
  threadId: string;
  onBack: () => void;
}

import { formatDistanceToNow } from "../../utils/dateUtils";
import { Thread, ThreadReply } from "./threadTypes";

// Extend ThreadReply for local state to include like info
type ThreadReplyWithLike = ThreadReply & {
  isLikedByMe?: boolean;
  likesCount?: number;
};

const ThreadDetailView: React.FC<ThreadDetailViewProps> = ({
  threadId,
  onBack,
}) => {
  // Like state for thread
  const [isLikedByMe, setIsLikedByMe] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  // State for which reply's menu is open
  const [replyMenuOpen, setReplyMenuOpen] = useState<string | null>(null);
  // Ref for reply menu dropdown
  const replyMenuRef = useRef<HTMLDivElement | null>(null);

  // Close reply menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        replyMenuRef.current &&
        !replyMenuRef.current.contains(event.target as Node)
      ) {
        setReplyMenuOpen(null);
      }
    }
    if (replyMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [replyMenuOpen]);

  // Format a date string to "x time ago"
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    return formatDistanceToNow(new Date(dateString));
  };

  // Handle submit reply
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.post(
        `http://localhost:3000/api/v1/threads/${threadId}/reply`,
        { content: newReply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewReply("");
      setShowReplyPreview(false);
      // Refresh replies
      fetchThreadDetail(threadId, replyPage, replyPageSize).then((data) => {
        const mappedReplies = (data.replies?.data || []).map((reply: any) => ({
          id: reply.id,
          content: reply.content,
          user: reply.user,
          createdAt: reply.createdAt,
          isAccepted: reply.isAccepted,
          likesCount: reply.likesCount,
        }));
        setReplies(mappedReplies);
        setReplyHasNext(data.replies?.pagination?.hasNext || false);
        setReplyTotal(data.replies?.pagination?.total || 0);
      });
    } catch (err) {
      // Optionally show error toast
    }
  };
  const [thread, setThread] = useState<Thread | null>(null);
  // Store accepted answer id
  const [acceptedAnswerId, setAcceptedAnswerId] = useState<string | null>(null);
  const [replies, setReplies] = useState<ThreadReplyWithLike[]>([]);
  const [newReply, setNewReply] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showReplyPreview, setShowReplyPreview] = useState(false);
  const [replyPage, setReplyPage] = useState(1);
  const [replyHasNext, setReplyHasNext] = useState(false);
  const [replyTotal, setReplyTotal] = useState(0);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showThreadMenu, setShowThreadMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const replyPageSize = 10;

  // Delete thread handler
  const handleDeleteThread = async () => {
    if (!thread) return;
    setDeleting(true);
    try {
      await deleteThread(thread.id);
      // Optionally show a toast here
      onBack(); // Go back after delete
    } catch (err) {
      // Optionally show error toast
    } finally {
      setDeleting(false);
      setShowThreadMenu(false);
    }
  };

  // Fetch current user for delete permission
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("http://localhost:3000/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCurrentUser(res.data))
      .catch(() => setCurrentUser(null));
  }, []);

  // Fetch thread and replies
  useEffect(() => {
    setIsLoading(true);
    fetchThreadDetail(threadId, replyPage, replyPageSize)
      .then((data) => {
        const threadData = {
          id: data.id,
          title: data.title,
          content: data.content,
          authorId: data.user?.id || "",
          authorName: data.user?.name || "",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt || data.createdAt,
          isResolved: data.threadStatus === "ANSWERED" || false,
          repliesCount: data.replies?.pagination?.total || 0,
          tags: data.tags || [],
          lastReplyAt: data.lastReplyAt,
          lastReplyBy: data.lastReplyBy,
          threadType: data.threadType || "classroom",
          classroomId: data.classroomId,
          classroomName: data.classroomName,
          unitId: data.unitId,
          unitName: data.unitName,
          category: data.category,
        };
        setThread(threadData);
        setAcceptedAnswerId(data.acceptedAnswerId || null);
        setIsLikedByMe(!!data.isLikedByMe);
        setLikesCount(data.likesCount || 0);
        // Map replies with like state
        const mappedReplies: ThreadReplyWithLike[] = (
          data.replies?.data || []
        ).map((reply: any) => ({
          id: reply.id,
          content: reply.content,
          user: reply.user,
          createdAt: reply.createdAt,
          isAccepted: reply.isAccepted,
          likesCount: reply.likesCount || 0,
          isLikedByMe: !!reply.isLikedByMe,
        }));
        setReplies(mappedReplies);
        setReplyHasNext(data.replies?.pagination?.hasNext || false);
        setReplyTotal(data.replies?.pagination?.total || 0);
      })
      .catch(() => {
        setThread(null);
        setReplies([]);
      })
      .finally(() => setIsLoading(false));
  }, [threadId, replyPage]);
  // Handle like toggle for reply
  const handleReplyLike = async (replyId: string) => {
    try {
      // Use the same endpoint as thread like, but with replyId
      const res = await axios.post(
        `http://localhost:3000/api/v1/threads/like/${replyId}`
      );
      setReplies((prevReplies) =>
        prevReplies.map((reply) =>
          reply.id === replyId
            ? {
                ...reply,
                isLikedByMe: res.data.liked,
                likesCount: res.data.likesCount,
              }
            : reply
        )
      );
    } catch (e) {
      // Optionally show error toast
    }
  };
  // Handle like toggle
  const handleThreadLike = async () => {
    if (!thread) return;
    try {
      const res = await toggleThreadLike(thread.id);
      setIsLikedByMe(res.liked);
      setLikesCount(res.likesCount);
    } catch (e) {
      // Optionally show error toast
    }
  };
  // Accept or unmark answer handler
  const handleAcceptAnswer = async (
    replyId: string,
    isCurrentlyAccepted: boolean
  ) => {
    if (!thread) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await acceptAnswer(thread.id, replyId);
      setAcceptedAnswerId(isCurrentlyAccepted ? null : replyId);
      // Optionally, refetch thread/replies for up-to-date state
      fetchThreadDetail(threadId, replyPage, replyPageSize).then((data) => {
        setAcceptedAnswerId(
          data.acceptedAnswerId || (isCurrentlyAccepted ? null : replyId)
        );
        const mappedReplies = (data.replies?.data || []).map((reply: any) => ({
          id: reply.id,
          content: reply.content,
          user: reply.user,
          createdAt: reply.createdAt,
          isAccepted: reply.isAccepted,
          likesCount: reply.likesCount,
        }));
        setReplies(mappedReplies);
      });
    } catch (err) {
      // Optionally show error toast
    }
  };

  // Delete reply handler
  const handleDeleteReply = async (replyId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.delete(`http://localhost:3000/api/v1/threads/${replyId}`, {
        headers: {
          "Content-Type": "text/plain",
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh replies after delete
      fetchThreadDetail(threadId, replyPage, replyPageSize).then((data) => {
        const mappedReplies = (data.replies?.data || []).map((reply: any) => ({
          id: reply.id,
          content: reply.content,
          user: reply.user,
          createdAt: reply.createdAt,
          isAccepted: reply.isAccepted,
          likesCount: reply.likesCount,
        }));
        setReplies(mappedReplies);
        setReplyHasNext(data.replies?.pagination?.hasNext || false);
        setReplyTotal(data.replies?.pagination?.total || 0);
      });
    } catch (err) {
      // Optionally show error toast
    }
  };

  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold text-white mb-4">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-semibold text-white mb-3">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-medium text-white mb-2">{children}</h3>
    ),
    p: ({ children }: any) => <p className="mb-3 text-gray-300">{children}</p>,
    code: ({ children, inline }: any) =>
      inline ? (
        <code className="bg-gray-700 px-1.5 py-0.5 rounded text-sm text-blue-300">
          {children}
        </code>
      ) : (
        <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto mb-4">
          <code className="text-green-300 text-sm">{children}</code>
        </pre>
      ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-800/50 rounded-r-lg mb-4 italic text-gray-300">
        {children}
      </blockquote>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-4 text-gray-300 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }: any) => <li className="text-gray-300">{children}</li>,
    strong: ({ children }: any) => (
      <strong className="text-white font-semibold">{children}</strong>
    ),
    em: ({ children }: any) => <em className="text-gray-200">{children}</em>,
    a: ({ children, href }: any) => (
      <a
        href={href}
        className="text-blue-400 hover:text-blue-300 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading thread...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Thread not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 relative">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          {/* Like button */}
          <button
            className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
              isLikedByMe
                ? "bg-blue-700/30 text-blue-400"
                : "text-gray-400 hover:text-blue-400 hover:bg-gray-700/40"
            }`}
            onClick={handleThreadLike}
            aria-label={isLikedByMe ? "Unlike" : "Like"}
          >
            <ThumbsUp
              className={`w-5 h-5 ${isLikedByMe ? "fill-blue-400" : ""}`}
            />
            <span>{likesCount}</span>
          </button>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-semibold text-white">
              {thread.title}
            </h1>
            {thread.isResolved && (
              <CheckCircle className="w-6 h-6 text-green-400" />
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{thread.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTimeAgo(thread.createdAt)}</span>
            </div>
            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
              {thread.threadType === "classroom"
                ? thread.unitName
                : thread.category}
            </span>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{replies.length} replies</span>
            </div>
          </div>
        </div>
        {/* 3-dot menu for thread actions */}
        <div className="relative">
          <button
            className="text-gray-400 hover:text-white p-2 rounded-full focus:outline-none"
            onClick={() => setShowThreadMenu((v) => !v)}
            aria-label="Thread actions"
          >
            <MoreVertical className="w-6 h-6" />
          </button>
          {showThreadMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20">
              <ul className="py-1">
                {/* Only show delete if current user is thread author */}
                {currentUser && thread.authorId === currentUser.id && (
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700 hover:text-red-600 text-sm disabled:opacity-60"
                      onClick={handleDeleteThread}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </li>
                )}
                <li>
                  <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 text-sm">
                    Update
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 text-sm">
                    Report
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Reply Form with Markdown Preview (moved above replies) */}

      {/* Thread Content with Markdown */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="prose prose-invert prose-lg max-w-none">
          <ReactMarkdown components={markdownComponents}>
            {thread.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {thread.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-700">
            <Tag className="w-4 h-4 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {thread.tags.map((tag: string) => (
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
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white">Add a Reply</h4>
          <button
            type="button"
            onClick={() => setShowReplyPreview(!showReplyPreview)}
            className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors ${
              showReplyPreview
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {showReplyPreview ? (
              <Edit className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
            {showReplyPreview ? "Edit" : "Preview"}
          </button>
        </div>

        <form onSubmit={handleSubmitReply} className="space-y-4">
          {!showReplyPreview ? (
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Share your thoughts or help solve this problem... Markdown supported: **bold**, *italic*, `code`, lists, links, images, etc."
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-vertical"
              required
            />
          ) : (
            <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 min-h-[100px] max-h-[300px] overflow-y-auto">
              {newReply.trim() ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown components={markdownComponents}>
                    {newReply}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-400 italic">
                  Preview will appear here as you type...
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Supports Markdown formatting • Be respectful and helpful
            </div>
            <button
              type="submit"
              disabled={!newReply.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              Post Reply
            </button>
          </div>
        </form>
      </div>

      {/* Replies with Markdown Support */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Replies ({replyTotal})
        </h3>

        {replies.map((reply) => {
          const isAccepted = acceptedAnswerId && reply.id === acceptedAnswerId;
          return (
            <div
              key={reply.id}
              className={`bg-gray-800 border ${
                isAccepted ? "border-green-500" : "border-gray-700"
              } rounded-lg p-4 ${
                isAccepted ? "shadow-green-700/30 shadow-lg" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-white">
                      {reply.user?.name || "Unknown"}
                    </span>
                    {isAccepted && (
                      <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs">
                        ✓ Accepted Answer
                      </span>
                    )}
                    {reply.isFromAi && (
                      <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded text-xs">
                        🤖 AI Response
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(reply.createdAt)}</span>
                  </div>
                </div>
                <div className="relative flex items-center gap-2">
                  <button
                    className="text-gray-400 hover:text-white p-2 rounded-full focus:outline-none"
                    onClick={() =>
                      setReplyMenuOpen(
                        replyMenuOpen === reply.id ? null : reply.id
                      )
                    }
                    aria-label="Reply actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {replyMenuOpen === reply.id && (
                    <div
                      ref={replyMenuRef}
                      className="absolute right-0 mt-2 w-36 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20"
                    >
                      <ul className="py-1">
                        {currentUser && reply.user?.id === currentUser.id && (
                          <li>
                            <button
                              className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-700 hover:text-red-600 text-sm"
                              onClick={() => {
                                setReplyMenuOpen(null);
                                handleDeleteReply(reply.id);
                              }}
                            >
                              Delete
                            </button>
                          </li>
                        )}
                        {/* Only thread author can accept or unmark answer */}
                        {currentUser &&
                          thread &&
                          thread.authorId === currentUser.id && (
                            <li>
                              {isAccepted ? (
                                <button
                                  className="w-full text-left px-4 py-2 text-yellow-500 hover:bg-gray-700 hover:text-yellow-600 text-sm"
                                  onClick={() => {
                                    setReplyMenuOpen(null);
                                    handleAcceptAnswer(reply.id, true);
                                  }}
                                >
                                  Unmark as Answer
                                </button>
                              ) : (
                                <button
                                  className="w-full text-left px-4 py-2 text-green-500 hover:bg-gray-700 hover:text-green-600 text-sm"
                                  onClick={() => {
                                    setReplyMenuOpen(null);
                                    handleAcceptAnswer(reply.id, false);
                                  }}
                                >
                                  Mark as Answer
                                </button>
                              )}
                            </li>
                          )}
                        <li>
                          <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 text-sm">
                            Update
                          </button>
                        </li>
                        <li>
                          <button className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 text-sm">
                            Report
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="prose prose-invert max-w-none mb-3">
                <ReactMarkdown components={markdownComponents}>
                  {reply.content}
                </ReactMarkdown>
              </div>

              <div className="flex items-center gap-4">
                <button
                  className={`flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors ${
                    reply.isLikedByMe ? "text-blue-400" : ""
                  }`}
                  onClick={() => handleReplyLike(reply.id)}
                  aria-label={reply.isLikedByMe ? "Unlike" : "Like"}
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${
                      reply.isLikedByMe ? "fill-blue-400" : ""
                    }`}
                  />
                  <span className="text-sm">{reply.likesCount || 0}</span>
                  <span className="text-xs ml-1">Helpful</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Replies Pagination Controls */}
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded mr-2 disabled:opacity-50"
            disabled={replyPage === 1 || isLoading}
            onClick={() => setReplyPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-400">Page {replyPage}</span>
          <button
            className="px-4 py-2 bg-gray-700 text-white rounded ml-2 disabled:opacity-50"
            disabled={!replyHasNext || isLoading}
            onClick={() => setReplyPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreadDetailView;
