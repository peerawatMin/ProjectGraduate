// src/components/PasswordField.tsx
import React from 'react';

interface PasswordFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  autoComplete?: string;
  className?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  showPassword,
  onTogglePassword,
  autoComplete = 'current-password',
  className = '',
}) => {
  const inputClasses = [
    'w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200',
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
      <div className="relative">
        <input
          id={name}
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={inputClasses}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
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

export default PasswordField;