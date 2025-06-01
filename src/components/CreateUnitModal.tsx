import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createUnit } from "../services/api";

interface EducationalContent {
  contentType: "DOCUMENT" | "NOTE" | "LINK" | "VIDEO";
  url: string;
}

interface CreateUnitModalProps {
  classroomId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUnitModal: React.FC<CreateUnitModalProps> = ({
  classroomId,
  onClose,
  onSuccess,
}) => {
  const [unitName, setUnitName] = useState("");
  const [description, setDescription] = useState("");
  const [educationalContents, setEducationalContents] = useState<
    EducationalContent[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("Classroom ID", classroomId);

  const addEducationalContent = () => {
    setEducationalContents([
      ...educationalContents,
      { contentType: "NOTE", url: "" },
    ]);
  };

  const removeEducationalContent = (index: number) => {
    setEducationalContents(educationalContents.filter((_, i) => i !== index));
  };

  const updateEducationalContent = (
    index: number,
    field: keyof EducationalContent,
    value: string
  ) => {
    const updated = educationalContents.map((content, i) =>
      i === index ? { ...content, [field]: value } : content
    );
    setEducationalContents(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) return;

    // Filter out educational contents with empty URLs
    const validEducationalContents = educationalContents.filter((content) =>
      content.url.trim()
    );

    setIsSubmitting(true);
    setError(null);

    try {
      const unitData = {
        name: unitName.trim(),
        classroomId,
        description: description.trim(),
        educationalContents: validEducationalContents,
      };

      await createUnit(unitData);
      onSuccess();
    } catch (err) {
      console.error("Failed to create unit:", err);
      setError("Failed to create unit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl border border-gray-700 animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h3 className="text-xl font-semibold text-white">Create New Unit</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="unitName" className="block text-gray-300 mb-2">
              Unit Name <span className="text-red-400">*</span>
            </label>
            <input
              id="unitName"
              type="text"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Introduction to Calculus"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              placeholder="Brief description of the unit (optional)"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-gray-300">
                Educational Contents (Optional)
              </label>
              <button
                type="button"
                onClick={addEducationalContent}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg flex items-center gap-2 transition-colors text-sm"
              >
                <Plus size={16} />
                Add Content
              </button>
            </div>

            {educationalContents.length === 0 ? (
              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-2">
                  No educational contents added
                </p>
                <p className="text-gray-500 text-xs">
                  You can add documents, notes, links, or videos to this unit
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {educationalContents.map((content, index) => (
                  <div
                    key={index}
                    className="bg-gray-700/50 border border-gray-600 rounded-lg p-3"
                  >
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-gray-400 text-xs mb-1">
                              Type
                            </label>
                            <select
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={content.contentType}
                              onChange={(e) =>
                                updateEducationalContent(
                                  index,
                                  "contentType",
                                  e.target.value
                                )
                              }
                            >
                              <option value="NOTE">Note</option>
                              <option value="DOCUMENT">Document</option>
                              <option value="LINK">Link</option>
                              <option value="VIDEO">Video</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-gray-400 text-xs mb-1">
                              URL
                            </label>
                            <input
                              type="url"
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="https://example.com/resource"
                              value={content.url}
                              onChange={(e) =>
                                updateEducationalContent(
                                  index,
                                  "url",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEducationalContent(index)}
                        className="text-red-400 hover:text-red-300 transition-colors mt-5"
                        aria-label="Remove content"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
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
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
              disabled={isSubmitting || !unitName.trim()}
            >
              {isSubmitting ? "Creating..." : "Create Unit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUnitModal;
