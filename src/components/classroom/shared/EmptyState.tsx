import { LucideIcon } from "lucide-react";
import React from "react";
import Button from "../../ui/button";
import { Card, CardContent } from "../../ui/card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionButton?: {
    text: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outline";
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionButton,
  className = "",
}) => {
  return (
    <Card className={`bg-[#1a2235] border-[#2d3748] ${className}`}>
      <CardContent className="p-12 text-center">
        <Icon className="h-12 w-12 mx-auto text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        {actionButton && (
          <Button
            variant={actionButton.variant || "primary"}
            onClick={actionButton.onClick}
          >
            {actionButton.text}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
