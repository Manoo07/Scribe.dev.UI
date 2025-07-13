import React from "react";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { id: string; name: string }[];
  required?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full bg-gray-700/50 text-white border border-gray-600 rounded-lg py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-700/70"
      required={required}
    >
      <option value="">Select {label}</option>
      {options.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
