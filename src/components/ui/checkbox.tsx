import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  checked = false,
  disabled = false,
  className = '',
  onCheckedChange,
}, ref) => {
  const { isDarkMode } = useTheme();

  const handleToggle = () => {
    if (!disabled) {
      onCheckedChange?.(!checked);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={() => onCheckedChange?.(!checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          onClick={handleToggle}
          className={`
            w-5 h-5 border-2 rounded transition-all duration-200 flex items-center justify-center outline-none focus:outline-none
            ${checked
              ? isDarkMode
                ? 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700'
                : 'bg-red-800 border-red-800 hover:bg-red-900 hover:border-red-900'
              : isDarkMode
                ? 'border-gray-600 bg-gray-700/50 hover:border-blue-500 hover:bg-gray-600/50'
                : 'border-stone-300 bg-white hover:border-red-800 hover:bg-red-50'
            }
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'cursor-pointer focus:ring-2 focus:ring-offset-2 ' + 
                (isDarkMode 
                  ? 'focus:ring-blue-500 focus:ring-offset-gray-800' 
                  : 'focus:ring-red-500 focus:ring-offset-white'
                )
            }
          `}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
              e.preventDefault();
              handleToggle();
            }
          }}
        >
          {checked && (
            <Check 
              size={14} 
              className={`text-white transition-all duration-200 ${
                checked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              }`} 
            />
          )}
        </div>
      </div>
      
      {label && (
        <label
          onClick={handleToggle}
          className={`text-sm transition-colors select-none ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          } ${
            disabled 
              ? 'cursor-not-allowed opacity-50' 
              : 'cursor-pointer hover:' + (isDarkMode ? 'text-white' : 'text-gray-900')
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;