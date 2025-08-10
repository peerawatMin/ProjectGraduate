// src/components/CheckboxField.tsx
import React from 'react';

interface CheckboxFieldProps {
  name: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  checked,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  const checkboxClasses = [
    'w-4 h-4 rounded focus:ring-2 transition-colors duration-200',
    error 
      ? 'text-red-500 border-red-500 focus:ring-red-500' 
      : 'text-blue-600 border-gray-300 focus:ring-blue-500',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ].join(' ');

  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={checkboxClasses}
          />
        </div>
        <div className="ml-3 text-sm">
          <label 
            htmlFor={name} 
            className={`font-medium ${error ? 'text-red-600' : 'text-gray-700'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-start ml-7">
          <svg className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default CheckboxField;