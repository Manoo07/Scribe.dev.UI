import { Eye, EyeOff, Loader2, Send } from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useToast } from "../../hooks/use-toast";
import { createReply } from "../../services/api";
import { CreateReplyPayload } from "./threadTypes";

interface ReplyFormProps {
  threadId: string;
  onReplyCreated: (reply: any) => void;
  placeholder?: string;
  className?: string;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  threadId,
  onReplyCreated,
  placeholder = "Write your reply...",
  className = "",
}) => {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const replyData: CreateReplyPayload = {
        content: content.trim(),
        threadId,
      };

      const newReply = await createReply(replyData);

      // Clear form
      setContent("");

      // Notify parent component
      onReplyCreated(newReply);

      toast({
        title: "Success",
        description: "Reply posted successfully!",
        variant: "default",
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to post reply";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {/* Content Input or Preview */}
      {showPreview ? (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Preview</span>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors rounded hover:bg-gray-700/50"
            >
              <EyeOff className="w-3 h-3" />
              Edit
            </button>
          </div>
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
              {content || "*No content to preview*"}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 resize-none pr-24"
              disabled={isSubmitting}
            />
            {/* Markdown info and preview toggle inside text box */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">Markdown supported</span>
              {content.trim() && (
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors rounded hover:bg-gray-700/50"
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Post Reply
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReplyForm;
