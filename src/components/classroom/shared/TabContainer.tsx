import React from "react";

interface TabContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const TabContainer: React.FC<TabContainerProps> = ({
  title,
  subtitle,
  children,
  actions,
  className = "",
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
        {actions && (
          <div className="flex items-center space-x-2">{actions}</div>
        )}
      {children}
    </div>
  );
};

export default TabContainer;
