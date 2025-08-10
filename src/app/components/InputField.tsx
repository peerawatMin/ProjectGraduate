// src/components/InputField.tsx
import React from 'react';

interface InputFieldProps {
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  maxLength?: number;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  autoComplete,
  maxLength,
  className = '',
}) => {
  const inputClasses = [
    'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200',
    error 
      ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].join(' ');

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={inputClasses}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-start">
          <svg className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default InputField;