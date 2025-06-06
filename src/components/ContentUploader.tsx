import React, { useState } from "react";
import { Unit, ContentType } from "../types";
import { FileText, Link2, Video, File, Upload, X } from "lucide-react";
import { createContent } from "../services/api";
import { marked } from "marked";

interface ContentUploaderProps {
  unit: Unit;
  onClose: () => void;
  onSuccess: () => void;
}

const ContentUploader: React.FC<ContentUploaderProps> = ({
  unit,
  onClose,
  onSuccess,
}) => {
  const [contentType, setContentType] = useState<ContentType>(ContentType.NOTE);
  const [noteContent, setNoteContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      switch (contentType) {
        case ContentType.NOTE:
          if (!noteContent.trim()) {
            throw new Error("Note content cannot be empty");
          }
          await createContent(unit.id, ContentType.NOTE, noteContent);
          break;

        case ContentType.LINK:
          if (!linkUrl.trim()) {
            throw new Error("Link URL cannot be empty");
          }
          await createContent(unit.id, ContentType.LINK, linkUrl);
          break;

        case ContentType.VIDEO:
          if (!videoUrl.trim()) {
            throw new Error("Video URL cannot be empty");
          }
          await createContent(unit.id, ContentType.VIDEO, videoUrl);
          break;

        case ContentType.DOCUMENT:
          if (!files.length) {
            throw new Error("No file selected");
          }
          await createContent(unit.id, ContentType.DOCUMENT, files[0]);
          break;
      }

      onSuccess();
    } catch (err) {
      console.error("Upload failed:", err);
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const contentTypeOptions = [
    { value: ContentType.NOTE, label: "Note", icon: <FileText size={18} /> },
    { value: ContentType.LINK, label: "Link", icon: <Link2 size={18} /> },
    { value: ContentType.VIDEO, label: "Video", icon: <Video size={18} /> },
    {
      value: ContentType.DOCUMENT,
      label: "Document",
      icon: <File size={18} />,
    },
  ];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <h3 className="text-xl font-semibold text-white">
          Add Content to "{unit.name}"
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Content Type</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {contentTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border ${
                  contentType === option.value
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                } transition-colors`}
                onClick={() => setContentType(option.value)}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <div className="mb-6">
          {contentType === ContentType.NOTE && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="noteContent" className="block text-gray-300">
                  Note Content (Markdown supported)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
              </div>
              <div className={`${showPreview ? "grid grid-cols-2 gap-4" : ""}`}>
                <div>
                  <textarea
                    id="noteContent"
                    rows={8}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="# Title&#10;Your note content here..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                </div>
                {showPreview && (
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-3">
                    <div
                      className="prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: marked(
                          noteContent || "*Preview will appear here*"
                        ),
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {contentType === ContentType.LINK && (
            <div>
              <label htmlFor="linkUrl" className="block text-gray-300 mb-2">
                Link URL
              </label>
              <input
                id="linkUrl"
                type="url"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          )}

          {contentType === ContentType.VIDEO && (
            <div>
              <label htmlFor="videoUrl" className="block text-gray-300 mb-2">
                Video URL (YouTube, Vimeo, etc.)
              </label>
              <input
                id="videoUrl"
                type="url"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          )}

          {contentType === ContentType.DOCUMENT && (
            <div>
              <label htmlFor="document" className="block text-gray-300 mb-2">
                Upload Document
              </label>
              <div className="relative">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    files.length
                      ? "border-blue-500 bg-blue-900/10"
                      : "border-gray-600"
                  }`}
                >
                  {files.length ? (
                    <div>
                      <p className="text-white mb-2">
                        {files.length} file(s) selected:
                      </p>
                      <ul className="text-gray-300 mb-4">
                        {Array.from(files).map((file, i) => (
                          <li key={i} className="truncate">
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => setFiles([])}
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Choose different files
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload
                        size={24}
                        className="mx-auto text-gray-400 mb-2"
                      />
                      <p className="text-gray-300 mb-2">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="text-gray-400 text-sm">
                        PDF, Word, Excel, PowerPoint, etc.
                      </p>
                    </div>
                  )}
                </div>
                <input
                  id="document"
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                  multiple
                  style={{
                    display:
                      contentType === ContentType.DOCUMENT ? "block" : "none",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Content"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContentUploader;
