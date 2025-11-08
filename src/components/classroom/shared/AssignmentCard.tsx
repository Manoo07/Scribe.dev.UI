import {
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
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

interface AssignmentCardProps {
  assignment: Assignment;
  submission?: AssignmentSubmission;
  isFaculty: boolean;
  onSubmit?: (assignment: Assignment) => void;
  onViewSubmissions?: (assignment: Assignment) => void;
  onViewSubmission?: (submission: AssignmentSubmission) => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  submission,
  isFaculty,
  onSubmit,
  onViewSubmissions,
  onViewSubmission,
}) => {
  const studentStatus = submission
    ? submission.status
    : assignmentUtils.getStudentAssignmentStatus(assignment, submission);
  const isOverdue = assignmentUtils.isOverdue(assignment.dueDate);

  return (
    <Card className="bg-[#1a2235] border-[#2d3748] hover:border-[#3a4a61] transition-colors">
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
                className={assignmentUtils.getStatusColor(assignment.status)}
              >
                {assignment.status}
              </Badge>
              {!isFaculty && (
                <Badge
                  variant={assignmentUtils.getStatusBadgeVariant(studentStatus)}
                  className={assignmentUtils.getStatusColor(studentStatus)}
                >
                  {studentStatus}
                </Badge>
              )}
            </div>

            <p className="text-gray-300 mb-3">{assignment.description}</p>

            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </div>
              {assignment.fileTypeRestrictions &&
                assignment.fileTypeRestrictions.length > 0 && (
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {assignment.fileTypeRestrictions.join(", ").toUpperCase()}
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewSubmissions?.(assignment)}
              >
                <Users className="h-4 w-4 mr-1" />
                View Submissions
              </Button>
            ) : (
              <>
                {submission ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSubmission?.(submission)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      View Submission
                    </Button>
                    {submission.status === SubmissionStatus.ACCEPTED && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {submission.status === SubmissionStatus.REJECTED && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSubmit?.(assignment)}
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
};

export default AssignmentCard;
