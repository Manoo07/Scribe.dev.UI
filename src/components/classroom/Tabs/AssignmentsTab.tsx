import { FileText, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from "../../../hooks/use-toast";
import { assignmentAPI } from "../../../services/assignmentService";
import {
  Assignment,
  AssignmentSubmission,
  SubmissionStatus,
  UserRole,
} from "../../../types/assignment";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
  ActionButton,
  AssignmentCard,
  EmptyState,
  FormModal,
  LoadingState,
  SubmissionModal,
  SubmissionsViewModal,
  TabContainer,
} from "../shared";

interface AssignmentTabProps {
  classroomId: string;
  classroomName?: string;
}

const AssignmentsTab: React.FC<AssignmentTabProps> = ({
  classroomId,
  classroomName,
}) => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    fileTypeRestrictions: [] as string[],
    maxFileSize: 10,
  });

  const userRole = (
    localStorage.getItem("role") || "STUDENT"
  ).toUpperCase() as UserRole;
  const isFaculty =
    userRole === UserRole.FACULTY || userRole === UserRole.ADMIN;

  useEffect(() => {
    fetchData();
  }, [classroomId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      toast.info("Loading assignments...");
      const [assignmentsData, submissionsData] = await Promise.all([
        assignmentAPI.getClassroomAssignments(classroomId),
        assignmentAPI.getStudentSubmissions(),
      ]);

      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!createForm.title || !createForm.description || !createForm.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsCreating(true);
      toast.info("Creating assignment...");
      const newAssignment = await assignmentAPI.createAssignment({
        title: createForm.title,
        description: createForm.description,
        classroomId,
        dueDate: createForm.dueDate,
        fileTypeRestrictions: createForm.fileTypeRestrictions,
        maxFileSize: createForm.maxFileSize,
      });

      setAssignments((prev) => [newAssignment, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        title: "",
        description: "",
        dueDate: "",
        fileTypeRestrictions: [],
        maxFileSize: 10,
      });
      toast.success("Assignment created successfully");
    } catch (error) {
      console.error("Failed to create assignment:", error);
      toast.error("Failed to create assignment");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !selectedFile) {
      toast.error("Please select a file to submit");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.info("Submitting assignment...");
      const submission = await assignmentAPI.submitAssignment({
        assignmentId: selectedAssignment.id,
        file: selectedFile,
      });

      setSubmissions((prev) => [submission, ...prev]);
      setShowSubmitModal(false);
      setSelectedFile(null);
      setSelectedAssignment(null);
      toast.success("Assignment submitted successfully");
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      toast.error("Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmissionStatus = async (
    submissionId: string,
    status: SubmissionStatus,
    feedback?: string
  ) => {
    try {
      toast.info(`Updating submission to ${status.toLowerCase()}...`);
      const updatedSubmission = await assignmentAPI.updateSubmissionStatus(
        submissionId,
        {
          status,
          feedback,
        }
      );

      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === submissionId ? updatedSubmission : sub))
      );
      toast.success(`Submission ${status.toLowerCase()}`);
    } catch (error) {
      console.error("Failed to update submission:", error);
      toast.error("Failed to update submission");
    }
  };

  const getSubmissionForAssignment = (
    assignmentId: string
  ): AssignmentSubmission | undefined => {
    return submissions.find((sub) => sub.assignmentId === assignmentId);
  };

  if (loading) {
    return (
      <TabContainer title="Assignments" subtitle={classroomName}>
        <LoadingState cardCount={3} />
      </TabContainer>
    );
  }

  const createAssignmentAction = (
    <ActionButton
      icon={Plus}
      text="Create Assignment"
      onClick={() => setShowCreateModal(true)}
      allowedRoles={["FACULTY", "ADMIN"]}
    />
  );

  return (
    <TabContainer
      title="Assignments"
      subtitle={classroomName}
      actions={createAssignmentAction}
    >
      {assignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Assignments"
          description={
            isFaculty
              ? "Create your first assignment to get started."
              : "No assignments have been created yet."
          }
          actionButton={
            isFaculty
              ? {
                  text: "Create Assignment",
                  onClick: () => setShowCreateModal(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const submission = getSubmissionForAssignment(assignment.id);

            return (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                submission={submission}
                isFaculty={isFaculty}
                onSubmit={(assignment) => {
                  setSelectedAssignment(assignment);
                  setShowSubmitModal(true);
                }}
                onViewSubmissions={(assignment) => {
                  setSelectedAssignment(assignment);
                  setShowSubmissionsModal(true);
                }}
                onViewSubmission={() => {
                  toast.info("View submission feature coming soon");
                }}
              />
            );
          })}
        </div>
      )}

      {/* Submit Assignment Modal */}
      <SubmissionModal
        isOpen={showSubmitModal}
        onOpenChange={setShowSubmitModal}
        assignment={selectedAssignment}
        selectedFile={selectedFile}
        onFileSelect={setSelectedFile}
        onSubmit={handleSubmitAssignment}
        onCancel={() => setShowSubmitModal(false)}
        isSubmitting={isSubmitting}
      />

      {/* View Submissions Modal */}
      <SubmissionsViewModal
        isOpen={showSubmissionsModal}
        onOpenChange={setShowSubmissionsModal}
        assignment={selectedAssignment}
        submissions={submissions}
        onUpdateStatus={handleUpdateSubmissionStatus}
      />

      {/* Create Assignment Modal */}
      <FormModal
        trigger={<div />} // Empty trigger since we're controlling it externally
        title="Create New Assignment"
        isOpen={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateAssignment}
        onCancel={() => setShowCreateModal(false)}
        submitText="Create Assignment"
        submitLoading={isCreating}
        submitLoadingText="Creating..."
        submitDisabled={
          !createForm.title || !createForm.description || !createForm.dueDate
        }
      >
        <div>
          <label className="text-sm font-medium text-gray-300">Title *</label>
          <Input
            value={createForm.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCreateForm((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            className="bg-[#0f1523] border-[#2d3748] text-white"
            placeholder="Assignment title"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">
            Description *
          </label>
          <Textarea
            value={createForm.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setCreateForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="bg-[#0f1523] border-[#2d3748] text-white"
            placeholder="Assignment description"
            rows={4}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">
            Due Date *
          </label>
          <Input
            type="datetime-local"
            value={createForm.dueDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCreateForm((prev) => ({
                ...prev,
                dueDate: e.target.value,
              }))
            }
            className="bg-[#0f1523] border-[#2d3748] text-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">
            Max File Size (MB)
          </label>
          <Input
            type="number"
            value={createForm.maxFileSize}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCreateForm((prev) => ({
                ...prev,
                maxFileSize: parseInt(e.target.value) || 10,
              }))
            }
            className="bg-[#0f1523] border-[#2d3748] text-white"
          />
        </div>
      </FormModal>
    </TabContainer>
  );
};

export default AssignmentsTab;
