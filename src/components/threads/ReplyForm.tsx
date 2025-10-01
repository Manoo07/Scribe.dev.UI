import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { CreateReplyPayload } from "./threadTypes";
import { createReply } from "../../services/api";
import { useToast } from "../../hooks/use-toast";

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
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full bg-transparent border-none outline-none text-white placeholder-gray-400 resize-none"
          disabled={isSubmitting}
        />
      </div>

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
