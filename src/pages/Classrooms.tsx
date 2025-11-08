import { Edit3, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import type { Classroom } from "../api/endpoints/classroom.api";
import CreateClassroomForm from "../components/classroom/CreateClassroomForm";
import EditClassroomForm from "../components/classroom/EditClassroomForm";
import { ConfirmDialog } from "../components/ui/confirm-dialog";
import { Toaster } from "../components/ui/toast";
import { useUserContext } from "../context/UserContext";
import { useDeleteClassroomMutation } from "../hooks/classroom/useClassroomMutations";
import { useClassroomsQuery } from "../hooks/classroom/useClassroomQueries";
import { useToast } from "../hooks/use-toast";

const MyClassroomsPage = () => {
  // TanStack Query hooks
  const {
    data: classroomsData,
    isLoading: loading,
    error,
  } = useClassroomsQuery();
  const deleteClassroomMutation = useDeleteClassroomMutation();

  // Local state for UI
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(
    null
  );
  const [classroomToEdit, setClassroomToEdit] = useState<Classroom | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const { toast } = useToast();
  const { userRole } = useUserContext();

  const createModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);

  // Extract classrooms array (API already returns Classroom[])
  const classrooms: Classroom[] = classroomsData || [];

  // Helper function to safely render section/faculty
  const renderValue = (value: any, fallback = "N/A"): string => {
    if (!value) return fallback;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return value.name || value.specialization || fallback;
    }
    return fallback;
  };

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
    // Query automatically refreshes due to cache invalidation in mutation hook
    setShowCreateForm(false);
    toast({
      title: "Classroom Created Successfully! 🎉",
      description: "Your new classroom is ready.",
    });
  };

  const handleClassroomUpdated = () => {
    // Query automatically refreshes due to cache invalidation in mutation hook
    setShowEditForm(false);
    setClassroomToEdit(null);

    toast({
      title: "Classroom Updated Successfully! ✨",
      description: "Your changes have been saved.",
    });
  };

  const confirmDeleteClassroom = (event: React.MouseEvent, classroom: any) => {
    event.preventDefault();
    event.stopPropagation();

    setClassroomToDelete(classroom);
    setDialogOpen(true);
  };

  const handleDeleteClassroom = async () => {
    if (!classroomToDelete) return;

    setDialogOpen(false);

    deleteClassroomMutation.mutate(classroomToDelete.id, {
      onSuccess: () => {
        toast({
          title: "Classroom Deleted Successfully! 🗑️",
          description: `"${classroomToDelete.name}" has been permanently removed.`,
        });
        setClassroomToDelete(null);
      },
      onError: (err: any) => {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete classroom. Please try again.";

        toast({
          title: "Failed to Delete Classroom",
          description: errorMessage,
          variant: "destructive",
        });
      },
    });
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

        {error && (
          <p className="text-red-500 mb-4">
            {error instanceof Error
              ? error.message
              : "Failed to fetch classrooms"}
          </p>
        )}

        {!loading && !error && (
          <>
            {classrooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-4">
                  No classrooms found
                </p>
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
                        Section: {renderValue(classroom.section)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Faculty: {renderValue(classroom.faculty)}
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
                          disabled={
                            deleteClassroomMutation.isPending &&
                            classroomToDelete?.id === classroom.id
                          }
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
                          title="Delete classroom"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deleteClassroomMutation.isPending &&
                            classroomToDelete?.id === classroom.id && (
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
        <ConfirmDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Delete Classroom"
          description={
            <>
              Are you sure you want to delete the classroom "
              <strong>{classroomToDelete?.name}</strong>"? This action cannot be
              undone and will permanently remove all associated data.
            </>
          }
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={handleDeleteClassroom}
          onCancel={handleDialogCancel}
          isLoading={deleteClassroomMutation.isPending}
        />
      </div>
    </>
  );
};

export default MyClassroomsPage;
