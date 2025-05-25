import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Users, Building, CheckCircle } from "lucide-react";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (announcement: any) => void;
}

const CreateAnnouncementModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateAnnouncementModalProps) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "classroom" as "classroom" | "college",
    priority: "medium" as "low" | "medium" | "high",
    classroom: "CS101",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API
      onSubmit({
        ...formData,
        title: formData.title.trim(),
        content: formData.content.trim(),
      });
      setFormData({
        title: "",
        content: "",
        type: "classroom",
        priority: "medium",
        classroom: "CS101",
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-gray-900 rounded-xl shadow-xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Announcement
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter announcement title..."
                className="w-full dark:bg-gray-800 dark:text-white dark:border-gray-700"
                disabled={isSubmitting}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label
                htmlFor="content"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Write your announcement content here..."
                className="w-full min-h-32 resize-none dark:bg-gray-800 dark:text-white dark:border-gray-700"
                disabled={isSubmitting}
              />
            </div>

            {/* Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Announcement Type
              </Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value: "classroom" | "college") =>
                  setFormData({ ...formData, type: value })
                }
                className="flex flex-wrap gap-6"
                disabled={isSubmitting}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="classroom" id="classroom" />
                  <Label
                    htmlFor="classroom"
                    className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-300"
                  >
                    <Users size={16} className="text-blue-600" />
                    <span>Classroom</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="college" id="college" />
                  <Label
                    htmlFor="college"
                    className="flex items-center space-x-2 cursor-pointer text-gray-700 dark:text-gray-300"
                  >
                    <Building size={16} className="text-purple-600" />
                    <span>College-wide</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Classroom Selection */}
            {formData.type === "classroom" && (
              <div className="space-y-2">
                <Label
                  htmlFor="classroom-select"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Select Classroom
                </Label>
                <Select
                  value={formData.classroom}
                  onValueChange={(value) =>
                    setFormData({ ...formData, classroom: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                    <SelectValue placeholder="Choose a classroom" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:text-white">
                    <SelectItem value="CS101">
                      CS101 - Introduction to Programming
                    </SelectItem>
                    <SelectItem value="CS201">
                      CS201 - Data Structures
                    </SelectItem>
                    <SelectItem value="CS301">CS301 - Algorithms</SelectItem>
                    <SelectItem value="MATH101">
                      MATH101 - Calculus I
                    </SelectItem>
                    <SelectItem value="ENG101">
                      ENG101 - English Composition
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Priority Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="priority"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Priority Level
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData({ ...formData, priority: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:text-white">
                  <SelectItem value="low">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Low Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Medium Priority</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>High Priority</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Create Announcement
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAnnouncementModal;
