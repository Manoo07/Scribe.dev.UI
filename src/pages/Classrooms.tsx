import React, { useEffect, useRef, useState } from "react";

import type { Classroom } from "../api/endpoints/classroom.api";
import CreateClassroomForm from "../components/classroom/CreateClassroomForm";
import EditClassroomForm from "../components/classroom/EditClassroomForm";
import { ClassroomGrid, PageHeader } from "../components/classroom/shared";
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

    deleteClassroomMutation.mutate(classroomToDelete._id, {
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
        <PageHeader
          title="My Classrooms"
          showAddButton={userRole === "FACULTY"}
          addButtonText="Add Classroom"
          onAddClick={handleAddClassroom}
          userRole={userRole || undefined}
        />

        <ClassroomGrid
          classrooms={classrooms}
          isLoading={loading}
          error={error}
          userRole={userRole || undefined}
          onEditClassroom={handleEditClassroom}
          onDeleteClassroom={confirmDeleteClassroom}
          deletingClassroomId={classroomToDelete?._id}
          isDeleting={deleteClassroomMutation.isPending}
          renderValue={renderValue}
          emptyActionButton={{
            text: "Add Classroom",
            onClick: handleAddClassroom,
          }}
        />

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
