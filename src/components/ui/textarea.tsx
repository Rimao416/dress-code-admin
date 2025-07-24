import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}, ref) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className={`block text-sm font-semibold transition-colors ${
          isDarkMode ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {label}
          {required && (
            <span className={`ml-1 ${
              isDarkMode ? 'text-red-400' : 'text-red-800'
            }`}>
              *
            </span>
          )}
        </label>
      )}
      
      <textarea
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-4 py-3 border rounded-xl transition-all duration-200 resize-none outline-none focus:outline-none
          ${isDarkMode
            ? 'text-white placeholder-gray-400 bg-gray-700/50 hover:bg-gray-700/70'
            : 'text-gray-900 placeholder-gray-400 bg-stone-50 hover:bg-white'
          }
          ${error
            ? isDarkMode
              ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
              : 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent'
            : isDarkMode
              ? 'border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              : 'border-stone-200 focus:ring-2 focus:ring-red-800 focus:border-transparent'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        {...props}
      />
      
      {error && (
        <p className={`text-sm flex items-center gap-1 transition-colors ${
          isDarkMode ? 'text-red-400' : 'text-red-600'
        }`}>
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;