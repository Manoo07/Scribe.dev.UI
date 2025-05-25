import React from "react";

interface AttendanceStatusBadgeProps {
  percentage: number;
  size?: "small" | "medium" | "large" | "xlarge";
}

const AttendanceStatusBadge: React.FC<AttendanceStatusBadgeProps> = ({
  percentage,
  size = "medium",
}) => {
  let bgColor = "";
  let textColor = "";
  let ringColor = "";
  let label = "";

  if (percentage >= 90) {
    bgColor = "bg-green-100 dark:bg-green-900/30";
    textColor = "text-green-600 dark:text-green-400";
    ringColor = "ring-green-500";
    label = "Excellent";
  } else if (percentage >= 75) {
    bgColor = "bg-blue-100 dark:bg-blue-900/30";
    textColor = "text-blue-600 dark:text-blue-400";
    ringColor = "ring-blue-500";
    label = "Good";
  } else if (percentage >= 60) {
    bgColor = "bg-amber-100 dark:bg-amber-900/30";
    textColor = "text-amber-600 dark:text-amber-400";
    ringColor = "ring-amber-500";
    label = "Average";
  } else {
    bgColor = "bg-red-100 dark:bg-red-900/30";
    textColor = "text-red-600 dark:text-red-400";
    ringColor = "ring-red-500";
    label = "Poor";
  }

  const sizeClasses = {
    small: {
      circle: "w-6 h-6 text-xs",
      label: "text-xs",
    },
    medium: {
      circle: "w-8 h-8 text-sm",
      label: "text-sm",
    },
    large: {
      circle: "w-10 h-10 text-base",
      label: "text-base",
    },
    xlarge: {
      circle: "w-16 h-16 text-xl",
      label: "text-base",
    },
  }[size];

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${bgColor} ${textColor} ${sizeClasses.circle} font-semibold rounded-full ring-2 ${ringColor} flex items-center justify-center`}
        aria-label={`Attendance: ${percentage} percent, rated ${label}`}
      >
        {percentage}%
      </div>
      <span className={`${textColor} font-medium mt-1 ${sizeClasses.label}`}>
        {label}
      </span>
    </div>
  );
};

export default AttendanceStatusBadge;
