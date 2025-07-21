import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

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
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-800 ml-1">*</span>}
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
          w-full px-4 py-3 border rounded-xl transition-all duration-200 text-gray-900 placeholder-gray-400 bg-stone-50 hover:bg-white resize-none
          ${error 
            ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent' 
            : 'border-stone-200 focus:ring-2 focus:ring-red-800 focus:border-transparent'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;