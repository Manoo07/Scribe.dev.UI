import React from "react";

interface InputFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  Icon?: React.FC<any>;
  placeholder?: string;
  required?: boolean;
  note?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  id,
  value,
  onChange,
  type = "text",
  Icon,
  placeholder,
  required = false,
  note,
}) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-medium text-gray-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          block w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-3 
          bg-gray-700/50 border border-gray-600 rounded-lg 
          text-white placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200 hover:bg-gray-700/70
        `}
        placeholder={placeholder}
        required={required}
      />
    </div>
    {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
  </div>
);

export default InputField;
