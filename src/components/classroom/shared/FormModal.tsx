import React from "react";
import Button from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

interface FormModalProps {
  trigger: React.ReactNode;
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  onSubmit: () => void;
  onCancel: () => void;
  submitText?: string;
  cancelText?: string;
  submitDisabled?: boolean;
  submitLoading?: boolean;
  submitLoadingText?: string;
  className?: string;
}

const FormModal: React.FC<FormModalProps> = ({
  trigger,
  title,
  isOpen,
  onOpenChange,
  children,
  onSubmit,
  onCancel,
  submitText = "Submit",
  cancelText = "Cancel",
  submitDisabled = false,
  submitLoading = false,
  submitLoadingText = "Submitting...",
  className = "",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className={`bg-[#1a2235] border-[#2d3748] text-white ${className}`}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {children}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
            <Button
              variant="primary"
              onClick={onSubmit}
              disabled={submitDisabled || submitLoading}
            >
              {submitLoading ? submitLoadingText : submitText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormModal;
