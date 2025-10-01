import {
  Brain,
  CheckCircle,
  Clock,
  MessageCircle,
  Reply,
  Tag,
  User,
} from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Thread } from "./threadTypes";

interface ThreadCardProps {
  thread: Thread;
  onClick?: () => void;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ thread, onClick }) => {
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

  return (
    <div
      className="bg-gray-800 border border-gray-600 rounded-lg p-6 hover:border-gray-600/80 hover:bg-gray-800/95 transition-all duration-300 cursor-pointer shadow-sm"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium text-white hover:text-blue-400/80 transition-colors">
              {thread.title}
            </h3>
            {thread.isResolved && (
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <User className="w-2.5 h-2.5" />
              <span>{thread.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              <span>{formatTimeAgo(thread.createdAt)}</span>
            </div>
            <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
              {thread.threadType === "classroom"
                ? thread.unitName
                : thread.category}
            </span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-col items-end gap-2">
          {thread.hasAiInsights && (
            <div className="flex items-center gap-1 bg-purple-600/20 text-purple-400 px-2 py-1 rounded-full text-xs">
              <Brain className="w-2 h-2" />
              <span>AI Insights</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <MessageCircle className="w-2.5 h-2.5" />
            <span>{thread.repliesCount}</span>
          </div>
        </div>
      </div>

      {/* Content Preview with Markdown */}
      <div className="text-gray-300 mb-4 line-clamp-2 prose prose-invert prose-sm max-w-none">
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
              <strong className="text-white font-semibold">{children}</strong>
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
            li: ({ children }) => <li className="text-gray-300">{children}</li>,
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
                className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-600/80 transition-colors"
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
                Last reply by {thread.lastReplyBy} •{" "}
                {formatTimeAgo(thread.lastReplyAt)}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!thread.isResolved && thread.repliesCount === 0 && (
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

export default ThreadCard;
