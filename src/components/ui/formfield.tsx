import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface FormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  className?: string;
  htmlFor?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  error,
  required = false,
  helpText,
  className = '',
  htmlFor
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={`block text-sm font-semibold transition-colors ${
            isDarkMode ? 'text-slate-200' : 'text-slate-700'
          }`}
        >
          {label}
          {required && (
            <span className={`ml-1 ${
              isDarkMode ? 'text-amber-400' : 'text-amber-600'
            }`}>
              *
            </span>
          )}
        </label>
      )}
     
      {children}
     
      {helpText && !error && (
        <p className={`text-sm transition-colors ${
          isDarkMode ? 'text-slate-400' : 'text-slate-500'
        }`}>
          {helpText}
        </p>
      )}
     
      {error && (
        <p className={`text-sm flex items-center gap-1.5 transition-colors ${
          isDarkMode ? 'text-rose-400' : 'text-rose-600'
        }`}>
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;