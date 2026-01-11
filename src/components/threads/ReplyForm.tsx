import { Send, Eye, Edit } from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useToast } from "../../hooks/use-toast";

interface ReplyFormProps {
  threadId: string;
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  threadId,
  onSubmit,
  placeholder = "Write your reply...",
  buttonText = "Reply",
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔄 ReplyForm handleSubmit called with content:", content);
    if (!content.trim() || isSubmitting) {
      console.log("❌ Form submission blocked:", {
        hasContent: !!content.trim(),
        isSubmitting,
      });
      return;
    }

    setIsSubmitting(true);
    console.log("🔄 Starting reply submission...");

    // Show loading toast
    const loadingToast = toast({
      title: "Posting Reply",
      description: "Please wait while we post your reply...",
    });

    try {
      console.log("🔄 Calling onSubmit with content:", content.trim());
      await onSubmit(content.trim());
      console.log("✅ Reply submission successful");

      // Dismiss loading toast and show success
      loadingToast.dismiss();
      toast({
        title: "Reply Posted Successfully! 💬",
        description: "Your reply has been added to the discussion.",
      });

      setContent("");
    } catch (error) {
      console.error("❌ Reply submission failed:", error);
      // Dismiss loading toast and show error
      loadingToast.dismiss();

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to post reply. Please try again.";

      toast({
        title: "Failed to Post Reply",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log("🔄 Reply submission process completed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3`}>
      {/* Content Input or Preview */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        {!showPreview ? (
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
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
        ) : (
          <div className="relative">
            <div className="prose prose-invert prose-sm max-w-none text-gray-300 min-h-[100px]">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2">{children}</p>,
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => (
                    <code className="bg-gray-900 px-2 py-1 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-gray-900 p-3 rounded mb-2 overflow-auto">
                      {children}
                    </pre>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-600 pl-3 italic mb-2">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-blue-400 hover:text-blue-300 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
            <div className="absolute bottom-2 right-2">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors rounded hover:bg-gray-700/50"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          onClick={(e) => {
            console.log("🔄 Submit button clicked");
            // Don't prevent default here - let form handle it
          }}
          disabled={isSubmitting || !content.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              {/* <Loader2 className="w-4 h-4 animate-spin" /> */}
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {buttonText}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReplyForm;
