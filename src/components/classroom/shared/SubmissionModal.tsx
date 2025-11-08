import React from "react";
import { Assignment } from "../../../types/assignment";
import { Input } from "../../ui/input";
import FormModal from "./FormModal";

interface SubmissionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment | null;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onOpenChange,
  assignment,
  selectedFile,
  onFileSelect,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  return (
    <FormModal
      trigger={<div />}
      title="Submit Assignment"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      onCancel={onCancel}
      submitText="Submit Assignment"
      submitLoading={isSubmitting}
      submitLoadingText="Submitting..."
      submitDisabled={!selectedFile}
    >
      {assignment && (
        <div className="p-4 bg-[#0f1523] rounded-lg border border-[#2d3748]">
          <h4 className="font-medium text-white">{assignment.title}</h4>
          <p className="text-sm text-gray-400 mt-1">{assignment.description}</p>
          <div className="text-sm text-gray-400 mt-2">
            Due: {new Date(assignment.dueDate).toLocaleDateString()}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-300">Select File</label>
        <Input
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFileSelect(e.target.files?.[0] || null)
          }
          className="bg-[#0f1523] border-[#2d3748] text-white"
          accept={assignment?.fileTypeRestrictions
            ?.map((type: string) => `.${type}`)
            .join(",")}
        />
        {assignment?.fileTypeRestrictions && (
          <p className="text-xs text-gray-400 mt-1">
            Allowed formats: {assignment.fileTypeRestrictions.join(", ")}
          </p>
        )}
        {assignment?.maxFileSize && (
          <p className="text-xs text-gray-400">
            Max file size: {assignment.maxFileSize}MB
          </p>
        )}
      </div>
    </FormModal>
  );
};

export default SubmissionModal;
