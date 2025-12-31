import { LucideIcon } from "lucide-react";
import React from "react";
import Button from "../../ui/button";

export type UserRole = "FACULTY" | "STUDENT" | "ADMIN";

interface ActionButtonProps {
  icon?: LucideIcon;
  text: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline" | "success" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  allowedRoles?: UserRole[];
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  text,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  loadingText,
  allowedRoles,
  className = "",
}) => {
  // Get user role from localStorage
  const userRole = (
    localStorage.getItem("role") || "STUDENT"
  ).toUpperCase() as UserRole;

  // Check if user has permission to see this button
  const hasPermission = !allowedRoles || allowedRoles.includes(userRole);

  if (!hasPermission) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          {loadingText || "Loading..."}
        </>
      ) : (
        <>
          {Icon && <Icon className={`${size === 'sm' ? 'h-4 w-4' : 'h-4 w-4'} mr-2`} />}
          {text}
        </>
      )}
    </Button>
  );
};

export default ActionButton;
