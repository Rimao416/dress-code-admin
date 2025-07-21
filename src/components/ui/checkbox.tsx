import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';

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
          onClick={() => !disabled && onCheckedChange?.(!checked)}
          className={`
            w-5 h-5 border-2 rounded cursor-pointer transition-all duration-200 flex items-center justify-center
            ${checked 
              ? 'bg-red-800 border-red-800' 
              : 'border-stone-300 bg-white hover:border-red-800'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {checked && <Check size={14} className="text-white" />}
        </div>
      </div>
      {label && (
        <label 
          onClick={() => !disabled && onCheckedChange?.(!checked)}
          className={`text-sm text-gray-700 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
