import { X } from "lucide-react";
import React, { forwardRef, useState } from "react";
import { useCreateClassroomMutation } from "../../hooks/classroom";
import { useDepartmentsQuery, useYearsQuery } from "../../hooks/department";
import { useToast } from "../../hooks/use-toast";

interface CreateClassroomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onClassroomCreated: () => void;
}

const CreateClassroomForm = forwardRef<
  HTMLDivElement,
  CreateClassroomFormProps
>(({ isOpen, onClose, onClassroomCreated }, ref) => {
  const [formData, setFormData] = useState({
    name: "",
    departmentId: "",
    yearId: "",
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // ===== TanStack Query Hooks =====

  // Fetch departments
  const { data: departments = [], isLoading: loadingDepartments } =
    useDepartmentsQuery();

  // Fetch years for selected department
  const { data: years = [], isLoading: loadingYears } = useYearsQuery(
    formData.departmentId
  );

  // Create classroom mutation
  const createClassroomMutation = useCreateClassroomMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Reset yearId when department changes
    if (name === "departmentId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        yearId: "", // Reset year selection
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.departmentId || !formData.yearId) {
      setError("Please fill in all fields");
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Show loading toast
    const loadingToast = toast({
      title: "Creating Classroom",
      description: "Please wait while we set up your new classroom...",
    });

    const classroomData = {
      name: formData.name.trim(),
      departmentId: formData.departmentId,
      yearId: formData.yearId,
    };

    createClassroomMutation.mutate(classroomData, {
      onSuccess: () => {
        console.log("Classroom created successfully");

        // Dismiss loading toast and show success
        loadingToast.dismiss();
        toast({
          title: "Classroom Created Successfully! 🎉",
          description: `"${formData.name.trim()}" is now ready for your students.`,
        });

        // Call the callback
        onClassroomCreated();

        // Reset form
        setFormData({
          name: "",
          departmentId: "",
          yearId: "",
        });
      },
      onError: (error: any) => {
        console.error("Error creating classroom:", error);

        // Dismiss loading toast and show error
        loadingToast.dismiss();

        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to create classroom";

        toast({
          title: "Failed to Create Classroom",
          description: errorMessage,
          variant: "destructive",
        });
      },
    });
  };

  const handleClose = () => {
    setFormData({ name: "", departmentId: "", yearId: "" });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={ref}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-6">
          Create New Classroom
        </h3>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Classroom Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter classroom name"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Department
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={loadingDepartments}
            >
              <option value="">
                {loadingDepartments
                  ? "Loading departments..."
                  : "Select Department"}
              </option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} - {dept.college.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Year
            </label>
            <select
              name="yearId"
              value={formData.yearId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={!formData.departmentId || loadingYears}
            >
              <option value="">
                {!formData.departmentId
                  ? "Select department first"
                  : loadingYears
                  ? "Loading years..."
                  : "Select Year"}
              </option>
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                createClassroomMutation.isPending ||
                loadingDepartments ||
                loadingYears
              }
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              {createClassroomMutation.isPending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

CreateClassroomForm.displayName = "CreateClassroomForm";

export default CreateClassroomForm;
