import React, { useState } from "react";
import { X, Users, Building, CheckCircle } from "lucide-react";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (announcement: any) => void;
}

const CreateAnnouncementModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateAnnouncementModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "classroom" as "classroom" | "college",
    priority: "medium" as "low" | "medium" | "high",
    classroom: "CS101",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API
      onSubmit({
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
      });
      setFormData({
        title: "",
        content: "",
        type: "classroom",
        priority: "medium",
        classroom: "CS101",
      });
      onClose();
    } catch (error) {
      console.error(error);
      setError("Failed to create announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: "",
        content: "",
        type: "classroom",
        priority: "medium",
        classroom: "CS101",
      });
      setError(null);
      onClose();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
          disabled={isSubmitting}
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-6">Create New Announcement</h3>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter announcement title..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your announcement content here..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-32 resize-none"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Announcement Type
            </label>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="classroom"
                  checked={formData.type === "classroom"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                  disabled={isSubmitting}
                />
                <Users size={16} className="text-blue-500" />
                <span className="text-gray-300">Classroom</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="college"
                  checked={formData.type === "college"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                  disabled={isSubmitting}
                />
                <Building size={16} className="text-purple-500" />
                <span className="text-gray-300">College-wide</span>
              </label>
            </div>
          </div>

          {/* Classroom Selection */}
          {formData.type === "classroom" && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Classroom
              </label>
              <select
                name="classroom"
                value={formData.classroom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={isSubmitting}
              >
                <option value="CS101">CS101 - Introduction to Programming</option>
                <option value="CS201">CS201 - Data Structures</option>
                <option value="CS301">CS301 - Algorithms</option>
                <option value="MATH101">MATH101 - Calculus I</option>
                <option value="ENG101">ENG101 - English Composition</option>
              </select>
            </div>
          )}

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priority Level
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              <option value="low">
                🟢 Low Priority
              </option>
              <option value="medium">
                🟡 Medium Priority
              </option>
              <option value="high">
                🔴 High Priority
              </option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Create Announcement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;