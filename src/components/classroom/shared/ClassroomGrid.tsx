import React from "react";
import ClassroomCard from "./ClassroomCard";

interface ClassroomGridProps {
  classrooms: any[];
  isLoading: boolean;
  error?: any;
  userRole?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionButton?: {
    text: string;
    onClick: () => void;
  };
  onEditClassroom?: (classroom: any) => void;
  onDeleteClassroom?: (classroom: any) => void;
  deletingClassroomId?: string;
  isDeleting?: boolean;
  renderValue?: (value: any, fallback?: string) => string;
  className?: string;
}

const ClassroomGrid: React.FC<ClassroomGridProps> = ({
  classrooms,
  isLoading,
  error,
  userRole,
  emptyTitle = "No classrooms found",
  emptyDescription,
  emptyActionButton,
  onEditClassroom,
  onDeleteClassroom,
  deletingClassroomId,
  isDeleting = false,
  renderValue,
  className = "",
}) => {
  // Custom loading component for classroom grid
  const ClassroomLoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6)
        .fill(0)
        .map((_, idx) => (
          <div
            key={idx}
            className="bg-gray-800 animate-pulse p-4 rounded-lg h-28"
          >
            <div className="bg-gray-700 h-4 w-3/4 mb-3 rounded" />
            <div className="bg-gray-700 h-3 w-1/2 mb-2 rounded" />
            <div className="bg-gray-700 h-3 w-1/3 rounded" />
          </div>
        ))}
    </div>
  );

  if (isLoading) {
    return <ClassroomLoadingState />;
  }

  if (error) {
    return (
      <p className="text-red-500 mb-4">
        {error instanceof Error ? error.message : "Failed to fetch classrooms"}
      </p>
    );
  }

  if (classrooms.length === 0) {
    const defaultDescription =
      userRole === "FACULTY"
        ? 'Click "Add Classroom" to create your first classroom'
        : undefined;

    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-4">{emptyTitle}</p>
        {(emptyDescription || defaultDescription) && (
          <p className="text-gray-500">
            {emptyDescription || defaultDescription}
          </p>
        )}
        {emptyActionButton && userRole === "FACULTY" && (
          <button
            onClick={emptyActionButton.onClick}
            className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition"
          >
            {emptyActionButton.text}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {classrooms.map((classroom) => {
        // Support both id formats (API returns 'id', but some places use '_id')
        const classroomId = classroom.id || classroom._id;
        return (
          <ClassroomCard
            key={classroomId}
            classroom={classroom}
            userRole={userRole}
            onEdit={
              onEditClassroom
                ? (classroom) => onEditClassroom(classroom)
                : undefined
            }
            onDelete={
              onDeleteClassroom
                ? (classroom) => onDeleteClassroom(classroom)
                : undefined
            }
            isDeleting={isDeleting && deletingClassroomId === classroomId}
            renderValue={renderValue}
          />
        );
      })}
    </div>
  );
};

export default ClassroomGrid;
