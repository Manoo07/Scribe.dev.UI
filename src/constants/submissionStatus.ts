export enum SubmissionStatus {
  PENDING = 'PENDING',           // Not yet submitted
  SUBMITTED = 'SUBMITTED',       // Submitted, waiting for review
  OVERDUE = 'OVERDUE',          // Late submission
  ACCEPTED = 'ACCEPTED',        // Reviewed and approved
  REJECTED = 'REJECTED'         // Rejected, needs resubmission
}

export const SUBMISSION_STATUS_LABELS = {
  [SubmissionStatus.PENDING]: 'Not Submitted Yet',
  [SubmissionStatus.SUBMITTED]: 'Submission Uploaded', 
  [SubmissionStatus.OVERDUE]: 'Submitted Late',
  [SubmissionStatus.ACCEPTED]: 'Reviewed ',
  [SubmissionStatus.REJECTED]: 'Resubmission Required'
};

export const FACULTY_STATUS_LABELS = {
  [SubmissionStatus.PENDING]: 'No Submission Received',
  [SubmissionStatus.SUBMITTED]: 'Pending Review',
  [SubmissionStatus.OVERDUE]: 'Late Submission',
  [SubmissionStatus.ACCEPTED]: 'Reviewed & Approved',
  [SubmissionStatus.REJECTED]: 'Rejected'
};

export const STATUS_COLORS = {
  [SubmissionStatus.PENDING]: 'bg-gray-600',
  [SubmissionStatus.SUBMITTED]: 'bg-blue-600',
  [SubmissionStatus.OVERDUE]: 'bg-orange-600',
  [SubmissionStatus.ACCEPTED]: 'bg-green-600',
  [SubmissionStatus.REJECTED]: 'bg-red-600'
};

// Student permission rules
export const STUDENT_PERMISSIONS = {
  canSubmit: (status: string, isBeforeDeadline: boolean) => {
    return (
      status === SubmissionStatus.PENDING && isBeforeDeadline
    ) || (
      status === SubmissionStatus.REJECTED && isBeforeDeadline
    );
  },
  
  canEdit: (status: string, isBeforeDeadline: boolean) => {
    return (
      status === SubmissionStatus.SUBMITTED && isBeforeDeadline
    ) || (
      status === SubmissionStatus.REJECTED && isBeforeDeadline
    );
  },
  
  canResubmit: (status: string, isBeforeDeadline: boolean) => {
    return status === SubmissionStatus.REJECTED && isBeforeDeadline;
  },
  
  isReadOnly: (status: string) => {
    return status === SubmissionStatus.ACCEPTED;
  }
};

// Faculty permission rules
export const FACULTY_PERMISSIONS = {
  canStartReview: (status: string) => {
    return [
      SubmissionStatus.SUBMITTED,
      SubmissionStatus.OVERDUE
    ].includes(status as SubmissionStatus);
  },
  
  canReview: (status: string) => {
    return [SubmissionStatus.SUBMITTED, SubmissionStatus.OVERDUE].includes(status as SubmissionStatus);
  },
  
  canReject: (status: string) => {
    return [
      SubmissionStatus.SUBMITTED,
      SubmissionStatus.OVERDUE,
      SubmissionStatus.ACCEPTED
    ].includes(status as SubmissionStatus);
  }
};

export const getSubmissionStatusInfo = (status: string, isStudent: boolean, isBeforeDeadline: boolean) => {
  const normalizedStatus = status as SubmissionStatus;
  
  return {
    status: normalizedStatus,
    label: isStudent ? SUBMISSION_STATUS_LABELS[normalizedStatus] : FACULTY_STATUS_LABELS[normalizedStatus],
    color: STATUS_COLORS[normalizedStatus],
    studentPermissions: {
      canSubmit: STUDENT_PERMISSIONS.canSubmit(normalizedStatus, isBeforeDeadline),
      canEdit: STUDENT_PERMISSIONS.canEdit(normalizedStatus, isBeforeDeadline),
      canResubmit: STUDENT_PERMISSIONS.canResubmit(normalizedStatus, isBeforeDeadline),
      isReadOnly: STUDENT_PERMISSIONS.isReadOnly(normalizedStatus)
    },
    facultyPermissions: {
      canStartReview: FACULTY_PERMISSIONS.canStartReview(normalizedStatus),
      canReview: FACULTY_PERMISSIONS.canReview(normalizedStatus),
      canReject: FACULTY_PERMISSIONS.canReject(normalizedStatus)
    }
  };
};