import React from 'react';
import { SubmissionStatus, getSubmissionStatusInfo } from '../../constants/submissionStatus';

interface StatusBadgeProps {
  status: string;
  isStudent?: boolean;
  deadline?: string | Date | null;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  isStudent = false, 
  deadline 
}) => {
  const isBeforeDeadline = deadline ? new Date(deadline) > new Date() : true;
  const statusInfo = getSubmissionStatusInfo(status, isStudent, isBeforeDeadline);
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium text-white ${statusInfo.color}`}>
      {statusInfo.label}
    </span>
  );
};

interface StatusMessageProps {
  status: string;
  isStudent?: boolean;
  deadline?: string | Date | null;
  assignmentTitle?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ 
  status, 
  isStudent = false, 
  deadline,
  assignmentTitle 
}) => {
  const isBeforeDeadline = deadline ? new Date(deadline) > new Date() : true;
  const statusInfo = getSubmissionStatusInfo(status, isStudent, isBeforeDeadline);
  
  const getDetailedMessage = () => {
    if (isStudent) {
      switch (statusInfo.status) {
        case SubmissionStatus.PENDING:
          if (isBeforeDeadline) {
            return "You haven't submitted this assignment yet. Click 'Upload Submission' to get started.";
          }
          return "This assignment's deadline has passed and no submission was made.";
          
        case SubmissionStatus.SUBMITTED:
          return "Your submission has been uploaded successfully. You can still edit it until faculty starts reviewing.";
          
        case SubmissionStatus.OVERDUE:
          return "Your submission was made after the deadline and has been marked as late.";
          
        case SubmissionStatus.ACCEPTED:
          return "Your submission has been reviewed and accepted by faculty.";
          
        case SubmissionStatus.REJECTED:
          return "Your submission needs improvements. Please make revisions and resubmit before the deadline.";
          
        default:
          return statusInfo.label;
      }
    } else {
      // Faculty view messages
      switch (statusInfo.status) {
        case SubmissionStatus.PENDING:
          return "No submission has been received from this student yet.";
          
        case SubmissionStatus.SUBMITTED:
          return "Student has submitted their work. Click 'Accept' or 'Reject' to complete review.";
          
        case SubmissionStatus.OVERDUE:
          return "Student submitted after the deadline. Review when ready.";
          
        case SubmissionStatus.ACCEPTED:
          return "Review completed. Submission has been approved.";
          
        case SubmissionStatus.REJECTED:
          return "Submission was rejected and student has been asked to resubmit.";
          
        default:
          return statusInfo.label;
      }
    }
  };

  return (
    <div className="space-y-2">
      <StatusBadge status={status} isStudent={isStudent} deadline={deadline} />
      <p className="text-sm text-gray-300">{getDetailedMessage()}</p>
    </div>
  );
};

interface ActionButtonsProps {
  status: string;
  isStudent?: boolean;
  deadline?: string | Date | null;
  onSubmit?: () => void;
  onEdit?: () => void;
  onResubmit?: () => void;
  onStartReview?: () => void;
  onCompleteReview?: () => void;
  onReject?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  status,
  isStudent = false,
  deadline,
  onSubmit,
  onEdit,
  onResubmit,
  onStartReview,
  onCompleteReview,
  onReject
}) => {
  const isBeforeDeadline = deadline ? new Date(deadline) > new Date() : true;
  const statusInfo = getSubmissionStatusInfo(status, isStudent, isBeforeDeadline);

  if (isStudent) {
    return (
      <div className="flex gap-2">
        {statusInfo.studentPermissions.canSubmit && (
          <button 
            onClick={onSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Upload Submission
          </button>
        )}
        
        {statusInfo.studentPermissions.canEdit && (
          <button 
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Submission
          </button>
        )}
        
        {statusInfo.studentPermissions.canResubmit && (
          <button 
            onClick={onResubmit}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Re-submit
          </button>
        )}
      </div>
    );
  } else {
    // Faculty buttons
    return (
      <div className="flex gap-2">
        {statusInfo.facultyPermissions.canStartReview && (
          <button 
            onClick={onStartReview}
            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
          >
            Start Review
          </button>
        )}
        
        {statusInfo.facultyPermissions.canReview && (
          <button 
            onClick={onCompleteReview}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Complete Review
          </button>
        )}
        
        {statusInfo.facultyPermissions.canReject && (
          <button 
            onClick={onReject}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Reject
          </button>
        )}
      </div>
    );
  }
};