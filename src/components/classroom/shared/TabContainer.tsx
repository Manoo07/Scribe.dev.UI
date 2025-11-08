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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-gray-400">{subtitle}</p>}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">{actions}</div>
        )}
      </div>
      {children}
    </div>
  );
};

export default TabContainer;
