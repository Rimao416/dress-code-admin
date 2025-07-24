import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const { isDarkMode } = useTheme();
  
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border rounded-xl transition-all duration-200 outline-none focus:outline-none
          ${isDarkMode
            ? 'text-white placeholder-slate-400 bg-slate-700/50 hover:bg-slate-700/70'
            : 'text-slate-900 placeholder-slate-400 bg-slate-50 hover:bg-white'
          }
          ${error
            ? isDarkMode
              ? 'border-rose-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent'
              : 'border-rose-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent'
            : isDarkMode
              ? 'border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              : 'border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${(type === 'password' && showPasswordToggle) || error ? 'pr-12' : ''}
        `}
        {...props}
      />
      
      {type === 'password' && showPasswordToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors p-1 rounded-lg outline-none focus:outline-none ${
            isDarkMode
              ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-600/50'
              : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
          }`}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
      
      {error && (
        <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
          isDarkMode ? 'text-rose-400' : 'text-rose-500'
        }`}>
          <AlertCircle size={18} />
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;