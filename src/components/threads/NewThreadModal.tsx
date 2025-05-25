import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { X, Tag, Brain, Send, Eye, Edit } from "lucide-react";
import { Thread } from "../../types/thread";

interface NewThreadModalProps {
  classroomId: string;
  units: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSubmit: (
    threadData: Omit<
      Thread,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "repliesCount"
      | "isResolved"
      | "hasAiInsights"
    >
  ) => void;
}

const NewThreadModal: React.FC<NewThreadModalProps> = ({
  classroomId,
  units,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isGeneratingAiSuggestion, setIsGeneratingAiSuggestion] =
    useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Constants for limits
  const TITLE_LIMIT = 150;
  const CONTENT_LIMIT = 2500; // ~500 words

  // Word counting function
  const countWords = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim().toLowerCase())) {
        setTags([...tags, currentTag.trim().toLowerCase()]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const generateAiSuggestion = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsGeneratingAiSuggestion(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock AI suggestions based content
    const suggestions = [
      "Consider breaking down the problem into smaller steps",
      "Try looking at similar examples in your textbook",
      "This concept is related to the fundamental theorem discussed in Unit 2",
      "Have you tried using the formula we learned last week?",
      "This is a common question - check the practice problems for similar examples",
    ];

    const randomSuggestion =
      suggestions[Math.floor(Math.random() * suggestions.length)];

    // Auto-generate tags based on content
    const autoTags = [];
    if (content.toLowerCase().includes("equation")) autoTags.push("equations");
    if (content.toLowerCase().includes("graph")) autoTags.push("graphing");
    if (content.toLowerCase().includes("formula")) autoTags.push("formulas");
    if (content.toLowerCase().includes("proof")) autoTags.push("proofs");

    setTags((prev) => [...new Set([...prev, ...autoTags])]);
    setIsGeneratingAiSuggestion(false);

    console.log("AI Suggestion:", randomSuggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !selectedUnitId) {
      return;
    }

    const selectedUnit = units.find((unit) => unit.id === selectedUnitId);

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      authorId: "current-user-id",
      authorName: "Current User",
      unitId: selectedUnitId,
      unitName: selectedUnit?.name || "",
      tags,
      aiSummary: undefined,
      aiSuggestedAnswer: undefined,
    });
  };

  const isValid = title.trim() && content.trim() && selectedUnitId;
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
          <h2 className="text-xl font-semibold text-white">
            Start New Discussion
          </h2>
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
          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Unit
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a unit...</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Question Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, TITLE_LIMIT))}
              placeholder="What's your question about?"
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
                Describe Your Question
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
                  placeholder="Provide details about what you're struggling with. Include any specific examples or concepts you need help understanding... (Markdown supported: **bold**, *italic*, `code`, etc.)"
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

          {/* AI Suggestion Button */}
          <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-medium">AI Assistant</span>
            </div>
            <p className="text-purple-200 text-sm mb-3">
              Get AI-powered suggestions and automatically generated tags for
              your question.
            </p>
            <button
              type="button"
              onClick={generateAiSuggestion}
              disabled={
                !title.trim() || !content.trim() || isGeneratingAiSuggestion
              }
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              <Brain className="w-4 h-4" />
              {isGeneratingAiSuggestion ? "Analyzing..." : "Get AI Suggestions"}
            </button>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (Optional)
            </label>
            <div className="space-y-3">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags to categorize your question (press Enter to add)"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <Tag className="w-3 h-3" />#{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-300 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
              disabled={!isValid || isContentOverLimit}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              Post Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewThreadModal;
