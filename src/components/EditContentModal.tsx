import React, { useState } from "react";
import { Unit } from "../types";
import { X } from "lucide-react";
import { updateUnit } from "../services/api";

interface EditContentModalProps {
  unit: Unit;
  onClose: () => void;
  onSuccess: () => void;
}

const EditContentModal: React.FC<EditContentModalProps> = ({
  unit,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unitName, setUnitName] = useState(unit.name);
  const [unitDescription, setUnitDescription] = useState((unit as any).description || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (unitName !== unit.name || unitDescription !== (unit as any).description) {
        await updateUnit(unit.id, unitName, unitDescription);
      }
      setIsSubmitting(false);
      onSuccess();
    } catch (err) {
      console.error("Update failed:", err);
      setError(
        err instanceof Error ? err.message : "Update failed. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <h3 className="text-xl font-semibold text-white">
          Edit "{unit.name}"
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
          <label htmlFor="unitName" className="block text-gray-300 mb-2">
            Unit Name <span className="text-red-400">*</span>
          </label>
          <input
            id="unitName"
            type="text"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Introduction to Calculus"
            value={unitName}
            onChange={e => setUnitName(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="unitDescription" className="block text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="unitDescription"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            placeholder="Brief description of the unit (optional)"
            rows={3}
            value={unitDescription}
            onChange={e => setUnitDescription(e.target.value)}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-400">
            {error}
          </div>
        )}

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
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditContentModal;
