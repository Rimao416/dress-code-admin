import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ 
  children,
  label,
  error,
  required = false,
  helpText,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-800 ml-1">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;