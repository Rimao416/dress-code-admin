import React, { forwardRef } from 'react';

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checked?: boolean;
  onChange?: () => void;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(({ 
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          type="radio"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          onClick={() => !disabled && onChange?.()}
          className={`
            w-5 h-5 border-2 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center
            ${checked 
              ? 'bg-red-800 border-red-800' 
              : 'border-stone-300 bg-white hover:border-red-800'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {checked && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </div>
      {label && (
        <label 
          onClick={() => !disabled && onChange?.()}
          className={`text-sm text-gray-700 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
});

Radio.displayName = 'Radio';

export default Radio;