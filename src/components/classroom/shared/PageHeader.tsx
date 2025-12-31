import { Plus } from "lucide-react";
import React from "react";
import { ActionButton } from "../shared";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
  userRole?: string;
  allowedRoles?: string[];
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showAddButton = false,
  addButtonText = "Add",
  onAddClick,
  userRole,
  allowedRoles = ["FACULTY"],
  className = "",
}) => {
  return (
    <div className={`flex justify-between items-center mb-6 ${className}`}>
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-gray-400 mt-1">{subtitle}</p>}
      </div>

      {showAddButton && userRole && allowedRoles.includes(userRole) && (
        <ActionButton
          icon={Plus}
          text={addButtonText}
          onClick={onAddClick || (() => {})}
          variant="primary"
          size="sm"
          className="bg-blue-600 hover:bg-blue-500 text-sm font-medium px-4 py-2.5"
        />
      )}
    </div>
  );
};

export default PageHeader;
