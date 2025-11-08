import {
  Check,
  RefreshCw,
  Search,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Student } from "../../../api/endpoints/classroom.api";
import {
  useAddStudentMutation,
  useBulkAddStudentsMutation,
  useBulkRemoveStudentsMutation,
  useEligibleStudentsQuery,
  useEnrolledStudentsQuery,
  useRemoveStudentMutation,
} from "../../../hooks/classroom";
import { useToast } from "../../../hooks/use-toast";
import Button from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import { Checkbox } from "../../ui/checkbox";
import { ConfirmDialog } from "../../ui/confirm-dialog";
import { Input } from "../../ui/input";

// Temporary skeleton component (can be moved to /ui/skeleton.tsx)
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-700 rounded-md ${className}`} />
);

const StudentsTab = ({ classroomId }: { classroomId: string }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [processingStudentId, setProcessingStudentId] = useState<string | null>(
    null
  );
  const { toast } = useToast();
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<"add" | "remove">("add");

  // Bulk selection states
  const [selectedEnrolledStudents, setSelectedEnrolledStudents] = useState<
    Set<string>
  >(new Set());
  const [selectedAvailableStudents, setSelectedAvailableStudents] = useState<
    Set<string>
  >(new Set());

  // ===== TanStack Query Hooks =====

  // Fetch enrolled students (those already in classroom)
  const {
    data: enrolledStudents = [],
    isLoading: enrolledLoading,
    refetch: refetchEnrolled,
  } = useEnrolledStudentsQuery(classroomId);

  // Fetch eligible students (those who can be added to classroom)
  const {
    data: eligibleStudents = [],
    isLoading: eligibleLoading,
    refetch: refetchEligible,
  } = useEligibleStudentsQuery(classroomId);

  // Combined loading state
  const loading = enrolledLoading || eligibleLoading;

  // For backward compatibility with existing code
  const students = enrolledStudents;
  const availableStudents = eligibleStudents;

  // Combined refresh function
  const refreshStudentsData = () => {
    refetchEnrolled();
    refetchEligible();
  };

  // Mutations
  const addStudentMutation = useAddStudentMutation();
  const removeStudentMutation = useRemoveStudentMutation();
  const bulkAddMutation = useBulkAddStudentsMutation();
  const bulkRemoveMutation = useBulkRemoveStudentsMutation();

  // Get user role from localStorage (or context if you prefer)
  const userRole = (localStorage.getItem("role") || "STUDENT").toUpperCase();

  // Clear selections when data changes - use stable IDs to prevent infinite loop
  useEffect(() => {
    setSelectedEnrolledStudents(new Set());
    setSelectedAvailableStudents(new Set());
  }, [enrolledStudents, eligibleStudents]); // Use the actual data arrays

  const handleAddStudent = async (userId: string) => {
    setProcessingStudentId(userId);

    addStudentMutation.mutate(
      { classroomId, userId },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Student added to the classroom",
          });
          setProcessingStudentId(null);
        },
        onError: (error: any) => {
          console.error("Failed to add student:", error);
          toast({
            title: "Error",
            description: "Failed to add student to the classroom",
            variant: "destructive",
          });
          setProcessingStudentId(null);
        },
      }
    );
  };

  const confirmRemoveStudent = (student: Student) => {
    setStudentToRemove(student);
    setDialogOpen(true);
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    setProcessingStudentId(studentToRemove.userId);
    setDialogOpen(false);

    removeStudentMutation.mutate(
      { classroomId, userId: studentToRemove.userId },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Student removed from the classroom",
          });
          setProcessingStudentId(null);
          setStudentToRemove(null);
        },
        onError: (error: any) => {
          console.error("Failed to remove student:", error);
          toast({
            title: "Error",
            description: "Failed to remove student from the classroom",
            variant: "destructive",
          });
          setProcessingStudentId(null);
          setStudentToRemove(null);
        },
      }
    );
  };

  // Bulk operations
  const handleBulkAdd = async () => {
    if (selectedAvailableStudents.size === 0) return;

    setBulkDialogOpen(false);
    const userIds = Array.from(selectedAvailableStudents);
    const count = selectedAvailableStudents.size;

    bulkAddMutation.mutate(
      { classroomId, userIds },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: `${count} students added to the classroom`,
          });
          setSelectedAvailableStudents(new Set());
        },
        onError: (error: any) => {
          console.error("Failed to add students:", error);
          toast({
            title: "Error",
            description: "Failed to add some students to the classroom",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleBulkRemove = async () => {
    if (selectedEnrolledStudents.size === 0) return;

    setBulkDialogOpen(false);
    const userIds = Array.from(selectedEnrolledStudents);
    const count = selectedEnrolledStudents.size;

    bulkRemoveMutation.mutate(
      { classroomId, userIds },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: `${count} students removed from the classroom`,
          });
          setSelectedEnrolledStudents(new Set());
        },
        onError: (error: any) => {
          console.error("Failed to remove students:", error);
          toast({
            title: "Error",
            description: "Failed to remove some students from the classroom",
            variant: "destructive",
          });
        },
      }
    );
  };

  const confirmBulkOperation = (operation: "add" | "remove") => {
    setBulkOperation(operation);
    setBulkDialogOpen(true);
  };

  // Selection handlers
  const toggleEnrolledStudent = (userId: string) => {
    const newSelected = new Set(selectedEnrolledStudents);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedEnrolledStudents(newSelected);
  };

  const toggleAvailableStudent = (userId: string) => {
    const newSelected = new Set(selectedAvailableStudents);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedAvailableStudents(newSelected);
  };

  const selectAllEnrolled = () => {
    if (selectedEnrolledStudents.size === students.length) {
      setSelectedEnrolledStudents(new Set());
    } else {
      setSelectedEnrolledStudents(
        new Set(students.map((s: Student) => s.userId))
      );
    }
  };

  const selectAllAvailable = () => {
    if (selectedAvailableStudents.size === filteredAvailableStudents.length) {
      setSelectedAvailableStudents(new Set());
    } else {
      setSelectedAvailableStudents(
        new Set(filteredAvailableStudents.map((s: Student) => s.userId))
      );
    }
  };

  const filteredAvailableStudents = availableStudents.filter(
    (student: Student) =>
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canShowBulkActions = userRole === "FACULTY" || userRole === "ADMIN";

  return (
    <div className="space-y-6 min-h-screen bg-[#121827] text-white p-8 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students Management</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Users className="h-4 w-4" />
            <span>{students.length} enrolled</span>
          </div>
          {canShowBulkActions && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshStudentsData()}
              disabled={loading}
              className="border-[#2d3748] hover:bg-[#1a2235] text-white"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Search bar for FACULTY/ADMIN */}
      {canShowBulkActions && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search students by name or email..."
            className="pl-10 py-3 bg-[#0f1523] border-[#2d3748] text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Enrolled Students */}
      <div className="bg-[#0f1523] rounded-xl border border-[#2d3748] p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-400" />
            Enrolled Students
            <span className="ml-2 text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
              {students.length}
            </span>
          </h2>

          {canShowBulkActions && students.length > 0 && (
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllEnrolled}
                className="border-[#2d3748] bg-gray-700 hover:bg-[#1a2235] text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                {selectedEnrolledStudents.size === students.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>

              {selectedEnrolledStudents.size > 0 && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => confirmBulkOperation("remove")}
                  disabled={
                    bulkAddMutation.isPending || bulkRemoveMutation.isPending
                  }
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove Selected ({selectedEnrolledStudents.size})
                </Button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <Card
                key={`enrolled-skeleton-${idx}`}
                className="bg-[#1a2235] border-[#2d3748]"
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-5 w-5" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg">
              No students enrolled in this classroom yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student: Student) => (
              <Card
                key={`enrolled-${student.id}-${student.userId}`}
                className={`bg-[#1a2235] border-[#2d3748] transition-all duration-200 hover:border-[#3a4a61] ${
                  selectedEnrolledStudents.has(student.userId)
                    ? "border-blue-500 bg-blue-950/20"
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {canShowBulkActions && (
                      <Checkbox
                        checked={selectedEnrolledStudents.has(student.userId)}
                        onCheckedChange={() =>
                          toggleEnrolledStudent(student.userId)
                        }
                        className="border-[#2d3748] data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    )}

                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-white text-lg">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {student.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="bg-[#2d3748] px-2 py-1 rounded font-mono">
                          {student.enrollmentNo}
                        </span>
                      </div>
                    </div>

                    {canShowBulkActions && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => confirmRemoveStudent(student)}
                        disabled={
                          processingStudentId === student.userId ||
                          bulkAddMutation.isPending ||
                          bulkRemoveMutation.isPending
                        }
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        {processingStudentId === student.userId
                          ? "Removing..."
                          : "Remove"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add New Students (only for FACULTY/ADMIN) */}
      {canShowBulkActions && (
        <div className="bg-[#0f1523] rounded-xl border border-[#2d3748] p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center">
              <UserPlus className="h-6 w-6 mr-2 text-green-400" />
              Available Students
              <span className="ml-2 text-sm bg-green-600 text-white px-2 py-1 rounded-full">
                {filteredAvailableStudents.length}
              </span>
            </h2>

            {filteredAvailableStudents.length > 0 && (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllAvailable}
                  className="border-[#2d3748] bg-gray-700 hover:bg-[#1a2235] text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {selectedAvailableStudents.size ===
                  filteredAvailableStudents.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>

                {selectedAvailableStudents.size > 0 && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => confirmBulkOperation("add")}
                    disabled={
                      bulkAddMutation.isPending || bulkRemoveMutation.isPending
                    }
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Selected ({selectedAvailableStudents.size})
                  </Button>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, idx) => (
                <Card
                  key={`available-skeleton-${idx}`}
                  className="bg-[#1a2235] border-[#2d3748]"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-5 w-5" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-28" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAvailableStudents.length === 0 ? (
            <div className="py-12 text-center">
              <UserPlus className="h-12 w-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 text-lg">
                {searchQuery
                  ? "No students found matching your search."
                  : "No eligible students available."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAvailableStudents.map((student: Student) => (
                <Card
                  key={`available-${student.id}-${student.userId}`}
                  className={`bg-[#1a2235] border-[#2d3748] transition-all duration-200 hover:border-[#3a4a61] ${
                    selectedAvailableStudents.has(student.userId)
                      ? "border-green-500 bg-green-950/20"
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={selectedAvailableStudents.has(student.userId)}
                        onCheckedChange={() =>
                          toggleAvailableStudent(student.userId)
                        }
                        className="border-[#2d3748] data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />

                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-white text-lg">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {student.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="bg-[#2d3748] px-2 py-1 rounded font-mono">
                            {student.enrollmentNo}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleAddStudent(student.userId)}
                        disabled={
                          processingStudentId === student.userId ||
                          bulkAddMutation.isPending ||
                          bulkRemoveMutation.isPending
                        }
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {processingStudentId === student.userId
                          ? "Adding..."
                          : "Add"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Single Student Removal Dialog */}
      {canShowBulkActions && (
        <ConfirmDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Remove Student"
          description={`Are you sure you want to remove ${studentToRemove?.firstName} ${studentToRemove?.lastName} from this classroom? This action cannot be undone.`}
          confirmText="Remove Student"
          variant="destructive"
          isLoading={removeStudentMutation.isPending}
          onConfirm={handleRemoveStudent}
        />
      )}

      {/* Bulk Operation Dialog */}
      {canShowBulkActions && (
        <ConfirmDialog
          open={bulkDialogOpen}
          onOpenChange={setBulkDialogOpen}
          title={bulkOperation === "add" ? "Add Students" : "Remove Students"}
          description={
            bulkOperation === "add"
              ? `Are you sure you want to add ${selectedAvailableStudents.size} students to this classroom?`
              : `Are you sure you want to remove ${selectedEnrolledStudents.size} students from this classroom? This action cannot be undone.`
          }
          confirmText={
            bulkOperation === "add" ? "Add Students" : "Remove Students"
          }
          variant={bulkOperation === "add" ? "default" : "destructive"}
          isLoading={
            bulkOperation === "add"
              ? bulkAddMutation.isPending
              : bulkRemoveMutation.isPending
          }
          onConfirm={bulkOperation === "add" ? handleBulkAdd : handleBulkRemove}
        />
      )}

      {/* Loader Overlay for Bulk Update */}
      {(bulkAddMutation.isPending || bulkRemoveMutation.isPending) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-[#1a2235]/90 p-8 rounded-xl border border-[#2d3748]/50 shadow-2xl">
            <svg
              className="animate-spin h-12 w-12 text-blue-400 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="text-white text-lg font-semibold">
              Updating students...
            </span>
            <span className="text-gray-400 text-sm mt-2">
              Please wait while we process your request
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTab;
