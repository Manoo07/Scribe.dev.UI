import { Check, Minus } from "lucide-react";
import React from "react";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  indeterminate?: boolean;
  id?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  label?: string;
  description?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onCheckedChange,
  disabled = false,
  indeterminate = false,
  id,
  className = "",
  size = "md",
  variant = "default",
  label,
  description,
}) => {
  const handleChange = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleChange();
    }
  };

  // Size variants
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  // Color variants
  const variantClasses = {
    default: {
      unchecked: "border-[#2d3748] hover:border-[#3a4a61]",
      checked: "bg-blue-600 border-blue-600 hover:bg-blue-700",
      disabled: "border-gray-600 bg-gray-800 cursor-not-allowed",
    },
    success: {
      unchecked: "border-[#2d3748] hover:border-[#3a4a61]",
      checked: "bg-green-600 border-green-600 hover:bg-green-700",
      disabled: "border-gray-600 bg-gray-800 cursor-not-allowed",
    },
    warning: {
      unchecked: "border-[#2d3748] hover:border-[#3a4a61]",
      checked: "bg-yellow-600 border-yellow-600 hover:bg-yellow-700",
      disabled: "border-gray-600 bg-gray-800 cursor-not-allowed",
    },
    danger: {
      unchecked: "border-[#2d3748] hover:border-[#3a4a61]",
      checked: "bg-red-600 border-red-600 hover:bg-red-700",
      disabled: "border-gray-600 bg-gray-800 cursor-not-allowed",
    },
  };

  const getCheckboxClasses = () => {
    const baseClasses = `
      ${sizeClasses[size]}
      border-2 
      rounded-md 
      flex 
      items-center 
      justify-center 
      transition-all 
      duration-200 
      focus:outline-none 
      focus:ring-2 
      focus:ring-offset-2 
      focus:ring-offset-[#121827]
    `;

    const variant_config = variantClasses[variant];

    if (disabled) {
      return `${baseClasses} ${variant_config.disabled}`;
    }

    if (checked || indeterminate) {
      return `${baseClasses} ${variant_config.checked} focus:ring-blue-500`;
    }

    return `${baseClasses} ${variant_config.unchecked} bg-transparent hover:bg-[#1a2235] focus:ring-blue-500 cursor-pointer`;
  };

  const renderIcon = () => {
    if (indeterminate) {
      return <Minus className={`${iconSizes[size]} text-white`} />;
    }

    if (checked) {
      return <Check className={`${iconSizes[size]} text-white`} />;
    }

    return null;
  };

  const checkboxElement = (
    <div
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={`${getCheckboxClasses()} ${className}`}
      onClick={handleChange}
      onKeyDown={handleKeyDown}
      id={id}
    >
      {renderIcon()}
    </div>
  );

  // If no label or description, return just the checkbox
  if (!label && !description) {
    return checkboxElement;
  }

  // Return checkbox with label and description
  return (
    <div className="flex items-start space-x-3">
      {checkboxElement}
      <div className="flex-1">
        {label && (
          <label
            htmlFor={id}
            className={`
              text-sm font-medium text-white cursor-pointer
              ${
                disabled
                  ? "text-gray-500 cursor-not-allowed"
                  : "hover:text-gray-200"
              }
            `}
            onClick={disabled ? undefined : handleChange}
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export { Checkbox };
