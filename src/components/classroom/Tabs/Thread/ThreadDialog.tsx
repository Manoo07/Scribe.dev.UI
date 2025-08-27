// components/CreateThreadDialog.tsx
import { X } from "lucide-react";
import React from "react";
import { ThreadFormData, Unit } from "../Thread/threadTypes";

interface CreateThreadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ThreadFormData;
  onFormDataChange: (data: ThreadFormData) => void;
  units: Unit[];
  onSubmit: () => void;
}

export const CreateThreadDialog: React.FC<CreateThreadDialogProps> = ({
  isOpen,
  onClose,
  formData,
  onFormDataChange,
  units,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">
            Create New Thread
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                onFormDataChange({ ...formData, title: e.target.value })
              }
              placeholder="What's your question or topic?"
              className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Unit (Optional)
            </label>
            <select
              value={formData.unitId}
              onChange={(e) =>
                onFormDataChange({ ...formData, unitId: e.target.value })
              }
              className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">
                Select a unit (or leave for general discussion)
              </option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description * (Max 1000 characters)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  onFormDataChange({
                    ...formData,
                    description: e.target.value,
                  });
                }
              }}
              placeholder="Describe your question or start the discussion... (Markdown supported: **bold**, *italic*, `code`)"
              className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:border-indigo-500 focus:outline-none resize-none"
              rows={6}
            />
            <div className="flex justify-between items-center mt-1">
              <div className="text-xs text-gray-400">
                Supports: **bold**, *italic*, `code`, • bullet points
              </div>
              <div className="text-right text-sm text-gray-400">
                {formData.description.length}/1000 characters
              </div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded border border-gray-600">
            <p className="text-sm text-gray-300 flex items-center gap-2">
              <span>📷</span>
              Image upload will be supported in a future version
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors border border-gray-600 rounded hover:border-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!formData.title.trim() || !formData.description.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded transition-colors"
          >
            Create Thread
          </button>
        </div>
      </div>
    </div>
  );
};
