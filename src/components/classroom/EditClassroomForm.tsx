import axios from "axios";
import { X } from "lucide-react";
import React, { forwardRef, useEffect, useState } from "react";

interface EditClassroomFormProps {
  isOpen: boolean;
  classroom: any;
  onClose: () => void;
  onClassroomUpdated: (updatedClassroom: any) => void;
}

const EditClassroomForm = forwardRef<HTMLDivElement, EditClassroomFormProps>(
  ({ isOpen, classroom, onClose, onClassroomUpdated }, ref) => {
    const [formData, setFormData] = useState({
      name: "",
      description: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Update form data when classroom prop changes
    useEffect(() => {
      if (classroom) {
        setFormData({
          name: classroom.name || "",
          description: classroom.description || "",
        });
        setErrors({});
      }
    }, [classroom]);

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    };

    const validateForm = () => {
      const newErrors: { [key: string]: string } = {};

      if (!formData.name.trim()) {
        newErrors.name = "Classroom name is required";
      } else if (formData.name.trim().length < 2) {
        newErrors.name = "Classroom name must be at least 2 characters";
      } else if (formData.name.trim().length > 100) {
        newErrors.name = "Classroom name must not exceed 100 characters";
      }

      if (formData.description && formData.description.length > 500) {
        newErrors.description = "Description must not exceed 500 characters";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setLoading(true);

      // Show loading toast
      const loadingToast = toast({
        title: "Updating Classroom",
        description: "Please wait while we save your changes...",
      });

      try {
        const token = localStorage.getItem("token");

        const updateData = {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        };

        console.log("Updating classroom with data:", updateData);

        const response = await axios.put(
          `http://localhost:3000/api/v1/classroom/${classroom.id}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Classroom updated successfully:", response.data);

        // Dismiss loading toast and show success
        loadingToast.dismiss();
        toast({
          title: "Classroom Updated Successfully! ✨",
          description: `"${formData.name.trim()}" has been updated.`,
        });

        // Notify other parts of the app that classroom was updated
        localStorage.setItem("classroom-updated", classroom.id);

        // Call the callback with the updated classroom data
        onClassroomUpdated(
          response.data.classroom || { ...classroom, ...updateData }
        );
        toast.success("Classroom updated successfully");
      } catch (error) {
        console.error("Error updating classroom:", error);

        // Dismiss loading toast and show error
        loadingToast.dismiss();

        if (axios.isAxiosError(error)) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to update classroom";
          console.error("Server error:", error.response?.data);

          toast({
            title: "Failed to Update Classroom",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Failed to Update Classroom",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    const handleClose = () => {
      if (!loading) {
        setFormData({ name: "", description: "" });
        setErrors({});
        onClose();
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div
          ref={ref}
          className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Edit Classroom</h3>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Classroom Name */}
            <div className="mb-4">
              <label
                htmlFor="edit-name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Classroom Name *
              </label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Enter classroom name"
                disabled={loading}
                maxLength={100}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label
                htmlFor="edit-description"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                  errors.description ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Enter classroom description (optional)"
                disabled={loading}
                maxLength={500}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-400">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Classroom"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

EditClassroomForm.displayName = "EditClassroomForm";

export default EditClassroomForm;
