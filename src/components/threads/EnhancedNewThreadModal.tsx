import { BookOpen, Edit, Eye, Globe, Send, X } from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

interface EnhancedNewThreadModalProps {
  units?: Array<{ id: string; name: string }>;
  threadType: "classroom" | "generic";
  classroomName?: string;
  onClose: () => void;
  onSubmit: (threadData: {
    title: string;
    content: string;
    unitId?: string;
  }) => void;
  isCreating?: boolean;
}

const EnhancedNewThreadModal: React.FC<EnhancedNewThreadModalProps> = ({
  classroomName,
  units = [],
  threadType,
  onClose,
  onSubmit,
  isCreating = false,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  // Only show unit dropdown if units are provided and threadType is classroom
  const showUnitDropdown =
    threadType === "classroom" && units && units.length > 0;

  // Constants for limits
  const TITLE_LIMIT = 150;
  const CONTENT_LIMIT = 2500;

  console.log("Units in Threads Tab :", units);

  // Word counting function
  const countWords = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    // For classroom threads, unit selection is optional
    if (threadType === "classroom") {
      onSubmit({
        title: title.trim(),
        content: content.trim(),
        unitId: selectedUnitId || undefined,
      });
    } else {
      onSubmit({
        title: title.trim(),
        content: content.trim(),
      });
    }
  };

  const isValid =
    title.trim() &&
    content.trim() &&
    (threadType === "classroom" ? true : true); // Unit selection is optional for classroom threads
  const wordCount = countWords(content);
  const isContentOverLimit = content.length > CONTENT_LIMIT;

  const markdownComponents = {
    h1: ({ children }: any) => (
      <h1 className="text-xl font-bold text-white mb-3">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg font-semibold text-white mb-2">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base font-medium text-white mb-2">{children}</h3>
    ),
    p: ({ children }: any) => <p className="mb-2 text-gray-300">{children}</p>,
    code: ({ children, inline }: any) =>
      inline ? (
        <code className="bg-gray-700 px-1 py-0.5 rounded text-sm text-blue-300">
          {children}
        </code>
      ) : (
        <pre className="bg-gray-900 border border-gray-700 rounded p-3 overflow-x-auto mb-3">
          <code className="text-green-300 text-sm">{children}</code>
        </pre>
      ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-3 text-gray-300">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-3 text-gray-300">
        {children}
      </ol>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-3 py-1 bg-gray-800/50 rounded-r mb-3 italic text-gray-300">
        {children}
      </blockquote>
    ),
    strong: ({ children }: any) => (
      <strong className="text-white font-semibold">{children}</strong>
    ),
    em: ({ children }: any) => <em className="text-gray-200">{children}</em>,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {threadType === "classroom" ? (
              <BookOpen className="w-6 h-6 text-green-400" />
            ) : (
              <Globe className="w-6 h-6 text-blue-400" />
            )}
            <h2 className="text-xl font-semibold text-white">
              {threadType === "classroom"
                ? "Start Classroom Discussion"
                : "Start Global Discussion"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          {/* Thread Type Info */}
          <div
            className={`p-4 rounded-lg border ${
              threadType === "classroom"
                ? "bg-green-600/10 border-green-600/30"
                : "bg-blue-600/10 border-blue-600/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {threadType === "classroom" ? (
                <BookOpen className="w-5 h-5 text-green-400" />
              ) : (
                <Globe className="w-5 h-5 text-blue-400" />
              )}
              <span
                className={`font-medium ${
                  threadType === "classroom"
                    ? "text-green-400"
                    : "text-blue-400"
                }`}
              >
                {threadType === "classroom"
                  ? "Classroom Thread"
                  : "Global Thread"}
              </span>
            </div>
            <p
              className={`text-sm ${
                threadType === "classroom" ? "text-green-200" : "text-blue-200"
              }`}
            >
              {threadType === "classroom"
                ? `This discussion will be visible to all members of ${
                    classroomName || "this classroom"
                  }.`
                : "This discussion will be visible to all users across the platform."}
            </p>
          </div>

          {/* Unit Selection for Classroom Threads */}
          {showUnitDropdown && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Unit{" "}
                <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose a unit (optional)...</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                You can optionally associate this thread with a specific unit,
                or leave it as a general classroom discussion.
              </p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {threadType === "classroom"
                ? "Question Title"
                : "Discussion Title"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_LIMIT))}
              placeholder={
                threadType === "classroom"
                  ? "What's your question about?"
                  : "What would you like to discuss?"
              }
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div
              className={`text-xs mt-1 ${
                title.length > TITLE_LIMIT * 0.9
                  ? "text-yellow-400"
                  : "text-gray-400"
              }`}
            >
              {title.length}/{TITLE_LIMIT} characters
            </div>
          </div>

          {/* Content with Preview Toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                {threadType === "classroom"
                  ? "Describe Your Question"
                  : "Share Your Thoughts"}
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors ${
                    showPreview
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {showPreview ? (
                    <Edit className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                  {showPreview ? "Edit" : "Preview"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {!showPreview ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    threadType === "classroom"
                      ? "Provide details about what you're struggling with. Include any specific examples or concepts you need help understanding... (Markdown supported: **bold**, *italic*, `code`, etc.)"
                      : "Share your thoughts, insights, or start a meaningful discussion... (Markdown supported: **bold**, *italic*, `code`, etc.)"
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px] resize-vertical"
                  required
                />
              ) : (
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-3 min-h-[150px] max-h-[300px] overflow-y-auto">
                  {content.trim() ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown components={markdownComponents}>
                        {content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      Preview will appear here as you type...
                    </p>
                  )}
                </div>
              )}
            </div>

            <div
              className={`text-xs mt-1 flex justify-between ${
                isContentOverLimit
                  ? "text-red-400"
                  : content.length > CONTENT_LIMIT * 0.9
                  ? "text-yellow-400"
                  : "text-gray-400"
              }`}
            >
              <span>
                {content.length}/{CONTENT_LIMIT} characters
              </span>
              <span>
                {wordCount} words (~{Math.ceil(wordCount / 5)} minute read)
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isContentOverLimit || isCreating}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {threadType === "classroom"
                    ? "Post Question"
                    : "Start Discussion"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedNewThreadModal;
