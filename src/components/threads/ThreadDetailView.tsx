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
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Thread, ThreadReply } from "./threadTypes";

interface ThreadDetailViewProps {
  threadId: string;
  onBack: () => void;
}

const ThreadDetailView: React.FC<ThreadDetailViewProps> = ({
  threadId,
  onBack,
}) => {
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<ThreadReply[]>([]);
  const [newReply, setNewReply] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showReplyPreview, setShowReplyPreview] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockThread: Thread = {
      id: threadId,
      threadType: "classroom",
      title: "How to solve quadratic equations with complex roots?",
      content:
        "I'm struggling with understanding how to handle quadratic equations when the discriminant is negative. Can someone explain the process step by step? I've been working on this problem: x² + 2x + 5 = 0, and I keep getting confused when I reach the square root of a negative number.",
      authorId: "student1",
      authorName: "Alice Johnson",
      classroomId: "classroom1",
      classroomName: "Advanced Mathematics",
      unitId: "unit1",
      unitName: "Algebra Fundamentals",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T14:20:00Z",
      isResolved: false,
      repliesCount: 3,

      tags: ["quadratic", "complex-numbers", "algebra"],
      lastReplyAt: "2024-01-15T14:20:00Z",
      lastReplyBy: "Dr. Smith",
    };

    const mockReplies: ThreadReply[] = [
      {
        id: "reply1",
        threadId: threadId,
        content:
          "Great question! When dealing with complex roots, remember that √(-1) = i. So for your equation x² + 2x + 5 = 0, using the quadratic formula: x = (-2 ± √(4-20))/2 = (-2 ± √(-16))/2 = (-2 ± 4i)/2 = -1 ± 2i",
        authorId: "teacher1",
        authorName: "Dr. Smith",
        createdAt: "2024-01-15T11:15:00Z",
        isMarkedAsAnswer: true,
      },
      {
        id: "reply2",
        threadId: threadId,
        content:
          "Thanks Dr. Smith! That makes sense. So the roots are -1 + 2i and -1 - 2i. Is there a way to verify these are correct?",
        authorId: "student1",
        authorName: "Alice Johnson",
        createdAt: "2024-01-15T12:30:00Z",
        isMarkedAsAnswer: false,
      },
      {
        id: "reply3",
        threadId: threadId,
        content:
          "Yes! You can substitute back into the original equation. For x = -1 + 2i: (-1+2i)² + 2(-1+2i) + 5 = (1-4i-4) + (-2+4i) + 5 = 0 ✓",
        authorId: "teacher1",
        authorName: "Dr. Smith",
        createdAt: "2024-01-15T14:20:00Z",
        isMarkedAsAnswer: false,
      },
    ];

    setThread(mockThread);
    setReplies(mockReplies);
    setIsLoading(false);
  }, [threadId]);

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

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    const reply: ThreadReply = {
      id: Date.now().toString(),
      threadId: threadId,
      content: newReply,
      authorId: "current-user",
      authorName: "You",
      createdAt: new Date().toISOString(),
      isMarkedAsAnswer: false,
    };

    setReplies((prev) => [...prev, reply]);
    setNewReply("");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
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
      </div>

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
      </div>

      {/* Replies with Markdown Support */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Replies ({replies.length})
        </h3>

        {replies.map((reply, index) => (
          <div
            key={reply.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-white">
                    {reply.authorName}
                  </span>
                  {reply.isMarkedAsAnswer && (
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
              <button className="text-gray-400 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="prose prose-invert max-w-none mb-3">
              <ReactMarkdown components={markdownComponents}>
                {reply.content}
              </ReactMarkdown>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">Helpful</span>
              </button>
              <button className="text-gray-400 hover:text-white text-sm transition-colors">
                Reply
              </button>
              {!reply.isMarkedAsAnswer && index > 0 && (
                <button className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                  Mark as Answer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form with Markdown Preview */}
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
              placeholder="Share your thoughts or help solve this problem... (Markdown supported: **bold**, *italic*, `code`, etc.)"
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
    </div>
  );
};

export default ThreadDetailView;
