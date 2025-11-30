import { CheckCircle, Download, XCircle } from "lucide-react";
import React from "react";
import { assignmentUtils } from "../../../services/assignmentService";
import {
  Assignment,
  AssignmentSubmission,
  SubmissionStatus,
} from "../../../types/assignment";
import { Badge } from "../../ui/badge";
import Button from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

interface SubmissionsViewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment | null;
  submissions: AssignmentSubmission[];
  onUpdateStatus: (
    submissionId: string,
    status: SubmissionStatus,
    feedback?: string
  ) => void;
}

const SubmissionsViewModal: React.FC<SubmissionsViewModalProps> = ({
  isOpen,
  onOpenChange,
  assignment,
  submissions,
  onUpdateStatus,
}) => {
  const assignmentSubmissions = submissions.filter(
    (sub) => sub.assignmentId === assignment?.id
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2235] border-[#2d3748] text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle>Assignment Submissions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {assignment && (
            <div className="p-4 bg-[#0f1523] rounded-lg border border-[#2d3748]">
              <h4 className="font-medium text-white">{assignment.title}</h4>
              <p className="text-sm text-gray-400 mt-1">
                {assignment.description}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {assignmentSubmissions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No submissions yet
              </div>
            ) : (
              assignmentSubmissions.map((submission) => (
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
                                onUpdateStatus(
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
                                onUpdateStatus(
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
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionsViewModal;
