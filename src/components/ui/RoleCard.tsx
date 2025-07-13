import React from "react";

interface RoleCardProps {
  role: string;
  currentRole: string;
  onChange: (role: string) => void;
  icon: React.FC<any>;
  title: string;
  description: string;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  currentRole,
  onChange,
  icon: Icon,
  title,
  description,
}) => {
  const isSelected = currentRole === role;

  return (
    <div
      onClick={() => onChange(role)}
      className={`
        relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]
        ${
          isSelected
            ? "border-blue-500 bg-blue-500/10 shadow-lg transform scale-[1.02]"
            : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
        }
      `}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <Icon
          className={`h-8 w-8 ${
            isSelected ? "text-blue-400" : "text-gray-400"
          }`}
        />
        <div>
          <h4
            className={`font-semibold text-lg ${
              isSelected ? "text-blue-300" : "text-gray-300"
            }`}
          >
            {title}
          </h4>
          <p
            className={`text-sm mt-1 ${
              isSelected ? "text-blue-200" : "text-gray-400"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default RoleCard;
