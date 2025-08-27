import {
  Award,
  ChevronDown as ChevronDownIcon,
  ChevronUp,
  Minus,
  MoreHorizontal,
  Plus,
  Reply as ReplyIcon,
  Share,
} from "lucide-react";
import React from "react";
import { MarkdownRenderer } from "../Thread/MarkdownRenderer";
import { Reply } from "../Thread/threadTypes";
import { getTimeAgo } from "../Thread/threadsUtils";

interface ReplyComponentProps {
  reply: Reply;
  isCollapsed: boolean;
  onToggleCollapse: (replyId: string) => void;
  onVote: (replyId: string, voteType: "up" | "down") => void;
  onReply: (replyId: string) => void;
  replyingTo: string | null;
  replyContent: string;
  onReplyContentChange: (content: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
  currentUser: { id: string; name: string };
}

export const ReplyComponent: React.FC<ReplyComponentProps> = ({
  reply,
  isCollapsed,
  onToggleCollapse,
  onVote,
  onReply,
  replyingTo,
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  onCancelReply,
  currentUser,
}) => {
  const hasReplies = reply.replies && reply.replies.length > 0;

  return (
    <div className="relative">
      {/* Threading lines for nested replies with continuous vertical lines */}
      {reply.depth > 0 && (
        <>
          {/* Continuous vertical lines for all parent thread levels */}
          {Array.from({ length: reply.depth - 1 }, (_, i) => (
            <div
              key={`parent-thread-line-${i}`}
              className="absolute w-0.5 bg-gray-400 dark:bg-gray-500"
              style={{
                top: "0px",
                height: "100%",
                left: `${24 + i * 24}px`,
              }}
            />
          ))}

          {/* Current level vertical line */}
          <div
            className="absolute w-0.5 bg-gray-400 dark:bg-gray-500"
            style={{
              top: "0px",
              height: hasReplies && !isCollapsed ? "100%" : "40px",
              left: `${24 + (reply.depth - 1) * 24}px`,
            }}
          />

          {/* Rounded corner connector for this comment */}
          <div
            className="absolute w-3 h-3 border-l-2 border-b-2 border-gray-400 dark:border-gray-500 rounded-bl-lg bg-white dark:bg-gray-900"
            style={{
              top: "24px",
              left: `${24 + (reply.depth - 1) * 24}px`,
            }}
          />

          {/* Horizontal line to comment */}
          <div
            className="absolute h-0.5 bg-gray-400 dark:bg-gray-500"
            style={{
              top: "36px",
              width: "12px",
              left: `${27 + (reply.depth - 1) * 24}px`,
            }}
          />
        </>
      )}

      {/* Main comment container with proper indentation */}
      <div
        className="mb-2"
        style={{
          marginLeft: reply.depth > 0 ? `${reply.depth * 24 + 16}px` : "0px",
        }}
      >
        {/* Comment card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
          <div className="flex">
            {/* Left voting panel - Clean sidebar */}
            <div className="flex flex-col items-center py-2 px-3 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 w-12">
              {/* Upvote button - Reddit orange */}
              <button
                onClick={() => onVote(reply.id, "up")}
                className={`p-1 rounded transition-all ${
                  reply.userVote === "up"
                    ? "text-orange-500 bg-orange-100 dark:bg-orange-900/30"
                    : "text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                }`}
                title="Upvote"
              >
                <ChevronUp className="w-4 h-4" />
              </button>

              {/* Vote count with clear styling */}
              <div
                className={`text-center font-bold text-sm py-1 min-w-[20px] ${
                  reply.userVote === "up"
                    ? "text-orange-500"
                    : reply.userVote === "down"
                    ? "text-blue-500"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {reply.upvotes - reply.downvotes}
              </div>

              {/* Downvote button - Reddit blue */}
              <button
                onClick={() => onVote(reply.id, "down")}
                className={`p-1 rounded transition-all ${
                  reply.userVote === "down"
                    ? "text-blue-500 bg-blue-100 dark:bg-blue-900/30"
                    : "text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                }`}
                title="Downvote"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Comment content area */}
            <div className="flex-1 p-3">
              {/* Header with user info and collapse button */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* User avatar */}
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {reply.author.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Username */}
                  <span className="text-gray-900 dark:text-gray-100 font-medium text-sm">
                    u/{reply.author.name}
                  </span>

                  {/* OP badge */}
                  {reply.author.name === "jain-nivedit" && (
                    <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                      OP
                    </span>
                  )}

                  {/* Timestamp */}
                  <span className="text-gray-500 text-xs">
                    {getTimeAgo(reply.createdAt)}
                  </span>
                </div>

                {/* Clear collapse/expand button */}
                {hasReplies && (
                  <button
                    onClick={() => onToggleCollapse(reply.id)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                    title={isCollapsed ? "Expand replies" : "Collapse replies"}
                  >
                    {isCollapsed ? (
                      <Plus className="w-4 h-4" />
                    ) : (
                      <Minus className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {/* Comment content */}
              {!isCollapsed && (
                <>
                  {/* Comment text */}
                  <div className="mb-3 text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                    {reply.content ? (
                      <MarkdownRenderer content={reply.content} />
                    ) : (
                      <div className="text-gray-500 italic">[deleted]</div>
                    )}
                  </div>

                  {/* Consistent action buttons */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <button
                      onClick={() => onReply(reply.id)}
                      className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
                    >
                      <ReplyIcon className="w-3 h-3" />
                      Reply
                    </button>

                    <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
                      <Award className="w-3 h-3" />
                      Award
                    </button>

                    <button className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
                      <Share className="w-3 h-3" />
                      Share
                    </button>

                    <button className="ml-auto p-1 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                      <MoreHorizontal className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Reply form */}
                  {replyingTo === reply.id && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded">
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-1">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={replyContent}
                            onChange={(e) =>
                              onReplyContentChange(e.target.value)
                            }
                            placeholder="What are your thoughts?"
                            className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 rounded border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none resize-none text-sm"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={onCancelReply}
                              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1 text-xs font-medium transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={onSubmitReply}
                              disabled={!replyContent.trim()}
                              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-1 rounded text-xs font-medium transition-colors"
                            >
                              Comment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Collapsed state */}
              {isCollapsed && (
                <div className="text-gray-500 text-sm">
                  <span className="font-medium">u/{reply.author.name}</span>
                  <span> comment collapsed</span>
                  {hasReplies && (
                    <span>
                      {" "}
                      • {reply.replies?.length} repl
                      {reply.replies?.length === 1 ? "y" : "ies"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nested replies with proper threading */}
        {!isCollapsed && hasReplies && (
          <div className="mt-1">
            {reply.replies?.map((nestedReply) => (
              <ReplyComponent
                key={nestedReply.id}
                reply={nestedReply}
                isCollapsed={false}
                onToggleCollapse={onToggleCollapse}
                onVote={onVote}
                onReply={onReply}
                replyingTo={replyingTo}
                replyContent={replyContent}
                onReplyContentChange={onReplyContentChange}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
