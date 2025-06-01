import React, { useState, useEffect, forwardRef } from "react";
import { X } from "lucide-react";
import axios from "axios";

interface Department {
  id: string;
  name: string;
  collegeId: string;
  createdAt: string;
  updatedAt: string;
  college: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface Year {
  id: string;
  name: string;
  departmentId: string;
  createdAt: string;
  updatedAt: string;
  department: {
    id: string;
    name: string;
    collegeId: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface CreateClassroomFormProps {
  isOpen: boolean;
  onClose: () => void;
  onClassroomCreated: () => void;
}

const CreateClassroomForm = forwardRef<HTMLDivElement, CreateClassroomFormProps>(({
  isOpen,
  onClose,
  onClassroomCreated,
}, ref) => {
  const [formData, setFormData] = useState({
    name: "",
    departmentId: "",
    yearId: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch departments on component mount
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  // Fetch years when department changes
  useEffect(() => {
    if (formData.departmentId) {
      fetchYears(formData.departmentId);
      // Reset year selection when department changes
      setFormData(prev => ({ ...prev, yearId: "" }));
    } else {
      setYears([]);
    }
  }, [formData.departmentId]);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:3000/api/v1/department",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Departments fetched:", response.data);
      setDepartments(response.data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to fetch departments");
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchYears = async (departmentId: string) => {
    setLoadingYears(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3000/api/v1/year?departmentId=${departmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Years fetched for department:", departmentId, response.data);
      setYears(response.data || []);
    } catch (err) {
      console.error("Error fetching years:", err);
      setError("Failed to fetch years");
    } finally {
      setLoadingYears(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.departmentId || !formData.yearId) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      
      // Send the form data with departmentId and yearId
      const payload = {
        name: formData.name,
        departmentId: formData.departmentId,
        yearId: formData.yearId,
      };
      
      console.log("Creating classroom with payload:", payload);
      
      await axios.post(
        "http://localhost:3000/api/v1/classroom",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      setFormData({ name: "", departmentId: "", yearId: "" });
      onClassroomCreated();
      onClose();
    } catch (err: any) {
      console.error("Error creating classroom:", err);
      setError(err.response?.data?.message || "Failed to create classroom");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", departmentId: "", yearId: "" });
    setError(null);
    setYears([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div ref={ref} className="bg-gray-800 rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-6">Create New Classroom</h3>

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
                {loadingDepartments ? "Loading departments..." : "Select Department"}
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
                  : "Select Year"
                }
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
              disabled={loading || loadingDepartments || loadingYears}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

CreateClassroomForm.displayName = "CreateClassroomForm";

export default CreateClassroomForm;