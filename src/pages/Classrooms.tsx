import axios from "axios";
import { Edit3, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import CreateClassroomForm from "../components/classroom/CreateClassroomForm";
import EditClassroomForm from "../components/classroom/EditClassroomForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useUserContext } from "../context/UserContext";
import { useToast } from "../hooks/use-toast";

const MyClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [classroomToDelete, setClassroomToDelete] = useState<any | null>(null);
  const [classroomToEdit, setClassroomToEdit] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingClassroomId, setProcessingClassroomId] = useState<
    string | null
  >(null);
  const { userRole } = useUserContext();

  const createModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(
          "Fetching classrooms with token:",
          token ? "Token exists" : "No token"
        );

        const response = await axios.get(
          "http://localhost:3000/api/v1/classroom",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("API Response:", response.data);
        console.log("Classrooms received:", response.data.classrooms);

        setClassrooms(response.data.classrooms || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching classrooms:", err);
        setError("Failed to fetch classrooms");
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  // Handle click outside to close modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        createModalRef.current &&
        !createModalRef.current.contains(event.target as Node)
      ) {
        setShowCreateForm(false);
      }
      if (
        editModalRef.current &&
        !editModalRef.current.contains(event.target as Node)
      ) {
        setShowEditForm(false);
        setClassroomToEdit(null);
      }
    };

    if (showCreateForm || showEditForm) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCreateForm, showEditForm]);

  const handleAddClassroom = () => {
    if (userRole === "FACULTY") {
      setShowCreateForm(true);
    }
  };

  const handleEditClassroom = (event: React.MouseEvent, classroom: any) => {
    event.preventDefault();
    event.stopPropagation();

    if (userRole === "FACULTY") {
      setClassroomToEdit(classroom);
      setShowEditForm(true);
    }
  };

  const handleClassroomCreated = () => {
    // Refresh the classrooms list
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Refreshing classrooms after creation...");

        const response = await axios.get(
          "http://localhost:3000/api/v1/classroom",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Refreshed classrooms:", response.data.classrooms);
        setClassrooms(response.data.classrooms || []);
      } catch (err) {
        console.error("Failed to refresh classrooms:", err);
      }
    };

    fetchClassrooms();
    setShowCreateForm(false);
  };

  const handleClassroomUpdated = (updatedClassroom: any) => {
    // Update the specific classroom in the state
    setClassrooms((prevClassrooms) =>
      prevClassrooms.map((classroom) =>
        classroom.id === updatedClassroom.id ? updatedClassroom : classroom
      )
    );

    setShowEditForm(false);
    setClassroomToEdit(null);

    toast.success("Classroom updated successfully");
  };

  const confirmDeleteClassroom = (event: React.MouseEvent, classroom: any) => {
    event.preventDefault();
    event.stopPropagation();

    setClassroomToDelete(classroom);
    setDialogOpen(true);
  };

  const handleDeleteClassroom = async () => {
    if (!classroomToDelete) return;

    try {
      setProcessingClassroomId(classroomToDelete.id);
      setDialogOpen(false);

      // Show loading toast
      const loadingToast = toast({
        title: "Deleting Classroom",
        description: "Please wait while we remove the classroom...",
      });

      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:3000/api/v1/classroom/${classroomToDelete.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Dismiss loading toast and show success
      loadingToast.dismiss();
      toast({
        title: "Classroom Deleted Successfully! 🗑️",
        description: `"${classroomToDelete.name}" has been permanently removed.`,
      });

      setClassrooms((prevClassrooms) =>
        prevClassrooms.filter(
          (classroom) => classroom.id !== classroomToDelete.id
        )
      );

      console.log("Classroom deleted successfully");
    } catch (err) {
      // Dismiss loading toast and show error
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete classroom. Please try again.";

      toast({
        title: "Failed to Delete Classroom",
        description: errorMessage,
        variant: "destructive",
      });

      console.error("Error deleting classroom:", err);
    } finally {
      setProcessingClassroomId(null);
    }
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
    setClassroomToDelete(null);
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div
      className={`p-6 md:p-8 transition-opacity duration-300 ${
        showCreateForm || showEditForm ? "opacity-70" : "opacity-100"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">My Classrooms</h2>
        {userRole === "FACULTY" && (
          <button
            onClick={handleAddClassroom}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm shadow transition"
          >
            + Add Classroom
          </button>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4)
            .fill(0)
            .map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-800 animate-pulse p-4 rounded-lg h-28"
              >
                <div className="bg-gray-700 h-4 w-3/4 mb-3 rounded" />
                <div className="bg-gray-700 h-3 w-1/2 mb-2 rounded" />
                <div className="bg-gray-700 h-3 w-1/3 rounded" />
              </div>
            ))}
        </div>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!loading && !error && (
        <>
          {classrooms.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No classrooms found</p>
              {userRole === "FACULTY" && (
                <p className="text-gray-500">
                  Click "Add Classroom" to create your first classroom
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classrooms.map((classroom) => (
                <div
                  key={classroom.id}
                  className="bg-gray-800 hover:bg-gray-700 transition p-5 rounded-xl shadow-md relative group"
                >
                  <Link
                    to={`/dashboard/classrooms/${classroom.id}`}
                    className="block"
                  >
                    <h3 className="text-xl font-semibold text-white mb-1 pr-16">
                      {classroom.name}
                    </h3>
                    {classroom.description && (
                      <p className="text-gray-300 text-sm mb-2 pr-16">
                        {classroom.description}
                      </p>
                    )}
                    <p className="text-gray-400 text-sm">
                      Section: {classroom.section?.name || "N/A"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Faculty: {classroom.faculty?.specialization || "N/A"}
                    </p>
                  </Link>

                  {userRole === "FACULTY" && (
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditClassroom(e, classroom)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition"
                        title="Edit classroom"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => confirmDeleteClassroom(e, classroom)}
                        disabled={processingClassroomId === classroom.id}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                        title="Delete classroom"
                      >
                        <Trash2 className="w-4 h-4" />
                        {processingClassroomId === classroom.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400"></div>
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <CreateClassroomForm
        ref={createModalRef}
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onClassroomCreated={handleClassroomCreated}
      />

      <EditClassroomForm
        ref={editModalRef}
        isOpen={showEditForm}
        classroom={classroomToEdit}
        onClose={() => {
          setShowEditForm(false);
          setClassroomToEdit(null);
        }}
        onClassroomUpdated={handleClassroomUpdated}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Classroom</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete the classroom "
              {classroomToDelete?.name}"? This action cannot be undone and will
              permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-gray-700 text-white hover:bg-gray-600"
              onClick={handleDialogCancel}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteClassroom}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  );
};

export default MyClassroomsPage;
