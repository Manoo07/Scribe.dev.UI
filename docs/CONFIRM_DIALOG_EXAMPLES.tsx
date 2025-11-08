/**
 * Example: Using ConfirmDialog in Different Scenarios
 * Copy these examples to quickly implement confirmation dialogs in your components
 */

import { useState } from "react";
import { ConfirmDialog } from "../components/ui/confirm-dialog";
import { useToast } from "../hooks/use-toast";

// ============================================
// Example 1: Simple Delete Confirmation
// ============================================
export function SimpleDeleteExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    // Your delete logic here
    await deleteItem();

    toast({
      title: "Deleted Successfully! 🗑️",
      description: "Item has been removed.",
    });
  };

  return (
    <>
      <button onClick={() => setDialogOpen(true)}>Delete Item</button>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}

// ============================================
// Example 2: With TanStack Query Mutation
// ============================================
export function TanStackQueryExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const deleteMutation = useDeleteMutation();
  const { toast } = useToast();

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(selectedItem.id, {
      onSuccess: () => {
        toast({
          title: "Success!",
          description: "Item deleted successfully.",
        });
        setDialogOpen(false);
        setSelectedItem(null);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <>
      <button onClick={() => handleDeleteClick(item)}>Delete</button>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Delete Item"
        description={`Delete "${selectedItem?.name}"? This cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

// ============================================
// Example 3: Rich Description with JSX
// ============================================
export function RichDescriptionExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const classroom = { name: "Math 101", students: 25, assignments: 10 };

  return (
    <ConfirmDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      title="Delete Classroom"
      description={
        <>
          Are you sure you want to delete{" "}
          <strong className="text-white">{classroom.name}</strong>?
          <br />
          <br />
          This will permanently delete:
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>{classroom.students} student enrollments</li>
            <li>{classroom.assignments} assignments</li>
            <li>All announcements and discussions</li>
          </ul>
          <br />
          <span className="text-red-400 font-semibold">
            This action cannot be undone!
          </span>
        </>
      }
      confirmText="Delete Classroom"
      variant="destructive"
      onConfirm={handleDelete}
    />
  );
}

// ============================================
// Example 4: Non-Destructive Action
// ============================================
export function PublishExample() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePublish = async () => {
    await publishAssignment();
    toast({
      title: "Published! 🎉",
      description: "Students have been notified.",
    });
  };

  return (
    <ConfirmDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      title="Publish Assignment"
      description="Are you sure you want to publish this assignment? Students will be notified immediately."
      confirmText="Publish Now"
      cancelText="Keep as Draft"
      variant="default" // Blue/indigo variant
      onConfirm={handlePublish}
    />
  );
}

// ============================================
// Example 5: Custom Cancel Handler
// ============================================
export function CustomCancelExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

  const handleSaveAndLeave = async () => {
    await saveChanges();
    navigate("/dashboard");
  };

  const handleDiscardAndLeave = () => {
    setHasUnsavedChanges(false);
    navigate("/dashboard");
  };

  return (
    <ConfirmDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      title="Unsaved Changes"
      description="You have unsaved changes. Do you want to save before leaving?"
      confirmText="Save and Leave"
      cancelText="Discard Changes"
      variant="default"
      onConfirm={handleSaveAndLeave}
      onCancel={handleDiscardAndLeave}
    />
  );
}

// ============================================
// Example 6: Bulk Delete
// ============================================
export function BulkDeleteExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleBulkDelete = async () => {
    await Promise.all(selectedItems.map((item) => deleteItem(item.id)));

    toast({
      title: "Bulk Delete Complete",
      description: `${selectedItems.length} items deleted.`,
    });

    setSelectedItems([]);
    setDialogOpen(false);
  };

  return (
    <ConfirmDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      title="Delete Multiple Items"
      description={
        <>
          Are you sure you want to delete{" "}
          <strong>{selectedItems.length} items</strong>?
          <br />
          This action cannot be undone.
        </>
      }
      confirmText={`Delete ${selectedItems.length} Items`}
      variant="destructive"
      onConfirm={handleBulkDelete}
    />
  );
}

// ============================================
// Example 7: Archive/Restore Action
// ============================================
export function ArchiveExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  const handleToggleArchive = async () => {
    if (isArchived) {
      await restoreClassroom();
      toast({ title: "Restored!" });
    } else {
      await archiveClassroom();
      toast({ title: "Archived!" });
    }
    setIsArchived(!isArchived);
    setDialogOpen(false);
  };

  return (
    <ConfirmDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      title={isArchived ? "Restore Classroom" : "Archive Classroom"}
      description={
        isArchived
          ? "Students will be able to access this classroom again."
          : "Students won't be able to access archived classrooms."
      }
      confirmText={isArchived ? "Restore" : "Archive"}
      variant="default"
      onConfirm={handleToggleArchive}
    />
  );
}

// ============================================
// Example 8: With Form Validation
// ============================================
export function FormValidationExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    // Validate before confirming
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Submit form
    await submitForm();
    setDialogOpen(false);

    toast({
      title: "Form Submitted! ✅",
      description: "Your changes have been saved.",
    });
  };

  return (
    <ConfirmDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      title="Submit Form"
      description="Are you sure you want to submit this form? All fields will be validated."
      confirmText="Submit"
      variant="default"
      onConfirm={handleSubmit}
    />
  );
}

// ============================================
// Example 9: Logout Confirmation
// ============================================
export function LogoutExample() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    toast({
      title: "Logged Out",
      description: "See you next time! 👋",
    });
  };

  return (
    <ConfirmDialog
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      title="Confirm Logout"
      description="Are you sure you want to logout? Any unsaved changes will be lost."
      confirmText="Logout"
      cancelText="Stay Logged In"
      variant="default"
      onConfirm={handleLogout}
    />
  );
}

// ============================================
// Example 10: Multiple Dialogs in One Component
// ============================================
export function MultipleDialogsExample() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);

  return (
    <>
      <button onClick={() => setDeleteDialogOpen(true)}>Delete</button>
      <button onClick={() => setPublishDialogOpen(true)}>Publish</button>
      <button onClick={() => setArchiveDialogOpen(true)}>Archive</button>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Item"
        description="Confirm deletion?"
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />

      {/* Publish Dialog */}
      <ConfirmDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        title="Publish Item"
        description="Confirm publication?"
        confirmText="Publish"
        variant="default"
        onConfirm={handlePublish}
      />

      {/* Archive Dialog */}
      <ConfirmDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        title="Archive Item"
        description="Confirm archiving?"
        confirmText="Archive"
        variant="default"
        onConfirm={handleArchive}
      />
    </>
  );
}
