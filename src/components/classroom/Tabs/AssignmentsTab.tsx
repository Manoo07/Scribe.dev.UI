import {
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Plus,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from "../../../hooks/use-toast";
import {
  assignmentAPI,
  assignmentUtils,
} from "../../../services/assignmentService";
import {
  Assignment,
  AssignmentSubmission,
  SubmissionStatus,
  UserRole,
} from "../../../types/assignment";
import { Badge } from "../../ui/badge";
import Button from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";

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

  const getStudentStatus = (assignment: Assignment): SubmissionStatus => {
    const submission = getSubmissionForAssignment(assignment.id);
    return assignmentUtils.getStudentAssignmentStatus(assignment, submission);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, idx) => (
          <Card key={idx} className="bg-[#1a2235] border-[#2d3748]">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Assignments</h2>
          <p className="text-gray-400">{classroomName}</p>
        </div>

        {isFaculty && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a2235] border-[#2d3748] text-white">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">
                    Title *
                  </label>
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
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleCreateAssignment}
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Assignment"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {assignments.length === 0 ? (
        <Card className="bg-[#1a2235] border-[#2d3748]">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Assignments
            </h3>
            <p className="text-gray-400">
              {isFaculty
                ? "Create your first assignment to get started."
                : "No assignments have been created yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const submission = getSubmissionForAssignment(assignment.id);
            const studentStatus = getStudentStatus(assignment);
            const isOverdue = assignmentUtils.isOverdue(assignment.dueDate);

            return (
              <Card
                key={assignment.id}
                className="bg-[#1a2235] border-[#2d3748] hover:border-[#3a4a61] transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {assignment.title}
                        </h3>
                        <Badge
                          variant={assignmentUtils.getStatusBadgeVariant(
                            assignment.status
                          )}
                          className={assignmentUtils.getStatusColor(
                            assignment.status
                          )}
                        >
                          {assignment.status}
                        </Badge>
                        {!isFaculty && (
                          <Badge
                            variant={assignmentUtils.getStatusBadgeVariant(
                              studentStatus
                            )}
                            className={assignmentUtils.getStatusColor(
                              studentStatus
                            )}
                          >
                            {studentStatus}
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-300 mb-3">
                        {assignment.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due:{" "}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </div>
                        {assignment.fileTypeRestrictions &&
                          assignment.fileTypeRestrictions.length > 0 && (
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {assignment.fileTypeRestrictions
                                .join(", ")
                                .toUpperCase()}
                            </div>
                          )}
                        {assignment.maxFileSize && (
                          <div className="flex items-center">
                            <Upload className="h-4 w-4 mr-1" />
                            Max {assignment.maxFileSize}MB
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {isFaculty ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowSubmissionsModal(true);
                            }}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            View Submissions
                          </Button>
                        </>
                      ) : (
                        <>
                          {submission ? (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  toast.info(
                                    "View submission feature coming soon"
                                  );
                                }}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                View Submission
                              </Button>
                              {submission.status ===
                                SubmissionStatus.ACCEPTED && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                              {submission.status ===
                                SubmissionStatus.REJECTED && (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setShowSubmitModal(true);
                              }}
                              disabled={isOverdue}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              {isOverdue ? "Overdue" : "Submit"}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
        <DialogContent className="bg-[#1a2235] border-[#2d3748] text-white">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAssignment && (
              <div className="p-4 bg-[#0f1523] rounded-lg border border-[#2d3748]">
                <h4 className="font-medium text-white">
                  {selectedAssignment.title}
                </h4>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedAssignment.description}
                </p>
                <div className="text-sm text-gray-400 mt-2">
                  Due:{" "}
                  {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-300">
                Select File
              </label>
              <Input
                type="file"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedFile(e.target.files?.[0] || null)
                }
                className="bg-[#0f1523] border-[#2d3748] text-white"
                accept={selectedAssignment?.fileTypeRestrictions
                  ?.map((type: string) => `.${type}`)
                  .join(",")}
              />
              {selectedAssignment?.fileTypeRestrictions && (
                <p className="text-xs text-gray-400 mt-1">
                  Allowed formats:{" "}
                  {selectedAssignment.fileTypeRestrictions.join(", ")}
                </p>
              )}
              {selectedAssignment?.maxFileSize && (
                <p className="text-xs text-gray-400">
                  Max file size: {selectedAssignment.maxFileSize}MB
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitAssignment}
                disabled={isSubmitting || !selectedFile}
              >
                {isSubmitting ? "Submitting..." : "Submit Assignment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showSubmissionsModal}
        onOpenChange={setShowSubmissionsModal}
      >
        <DialogContent className="bg-[#1a2235] border-[#2d3748] text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>Assignment Submissions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAssignment && (
              <div className="p-4 bg-[#0f1523] rounded-lg border border-[#2d3748]">
                <h4 className="font-medium text-white">
                  {selectedAssignment.title}
                </h4>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedAssignment.description}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {submissions
                .filter((sub) => sub.assignmentId === selectedAssignment?.id)
                .map((submission) => (
                  <Card
                    key={submission.id}
                    className="bg-[#0f1523] border-[#2d3748]"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-white">
                              {submission.studentName}
                            </span>
                            <Badge
                              variant={assignmentUtils.getStatusBadgeVariant(
                                submission.status
                              )}
                              className={assignmentUtils.getStatusColor(
                                submission.status
                              )}
                            >
                              {submission.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Submitted:{" "}
                            {new Date(submission.submittedAt).toLocaleString()}
                          </div>
                          {submission.fileName && (
                            <div className="text-sm text-gray-400">
                              File: {submission.fileName}
                            </div>
                          )}
                          {submission.feedback && (
                            <div className="text-sm text-gray-300 mt-2 p-2 bg-[#1a2235] rounded">
                              Feedback: {submission.feedback}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {submission.status === SubmissionStatus.SUBMITTED && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() =>
                                  handleUpdateSubmissionStatus(
                                    submission.id,
                                    SubmissionStatus.ACCEPTED
                                  )
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleUpdateSubmissionStatus(
                                    submission.id,
                                    SubmissionStatus.REJECTED
                                  )
                                }
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {submission.fileUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(submission.fileUrl, "_blank")
                              }
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsTab;
