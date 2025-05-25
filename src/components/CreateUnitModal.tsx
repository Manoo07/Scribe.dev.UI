import React, { useState } from "react";
import { X } from "lucide-react";
import { createUnit } from "../services/api";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await createUnit(classroomId, unitName);
      onSuccess();
    } catch (err) {
      console.error("Failed to create unit:", err);
      setError("Failed to create unit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md border border-gray-700 animate-fadeIn">
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
              Unit Name
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
