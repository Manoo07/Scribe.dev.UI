import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { updateUnit } from "../services/api";
import { ContentType, EducationalContent } from "../types";

interface EditUnitModalProps {
  unit: {
    id: string;
    name: string;
    description?: string;
    educationalContents: EducationalContent[];
  };
  onClose: () => void;
  onSuccess: () => void;
}

const EditUnitModal: React.FC<EditUnitModalProps> = ({ unit, onClose, onSuccess }) => {
  const [unitName, setUnitName] = useState(unit.name);
  const [description, setDescription] = useState(unit.description || "");
  const [educationalContents, setEducationalContents] = useState<EducationalContent[]>(unit.educationalContents);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const removeEducationalContent = (index: number) => {
    setEducationalContents(educationalContents.filter((_, i) => i !== index));
  };

  const addEducationalContent = () => {
    setEducationalContents([
      ...educationalContents,
      { id: '', unitId: unit.id, type: ContentType.NOTE, content: '', version: 1, createdAt: '', updatedAt: '' },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await updateUnit(unit.id, unitName.trim(), description.trim());
      // TODO: update educationalContents via separate API if needed
      onSuccess();
    } catch (err) {
      setError("Failed to update unit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl border border-gray-700 animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h3 className="text-xl font-semibold text-white">Edit Unit</h3>
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
                Educational Contents
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
                    key={content.id || index}
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
                              value={content.type}
                              onChange={(e) =>
                                updateEducationalContent(index, "type", e.target.value as ContentType)
                              }
                            >
                              <option value={ContentType.NOTE}>Note</option>
                              <option value={ContentType.DOCUMENT}>Document</option>
                              <option value={ContentType.LINK}>Link</option>
                              <option value={ContentType.VIDEO}>Video</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-gray-400 text-xs mb-1">
                              Content
                            </label>
                            <input
                              type="text"
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Content or URL"
                              value={content.content}
                              onChange={(e) =>
                                updateEducationalContent(index, "content", e.target.value)
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUnitModal;
