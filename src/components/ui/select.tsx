import React, { useState, forwardRef } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  label?: string;
  options?: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(({ 
  label,
  options = [],
  value,
  onValueChange,
  placeholder = "Sélectionnez une option",
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`space-y-2 relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-800 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          ref={ref}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 border rounded-xl transition-all duration-200 text-left bg-stone-50 hover:bg-white flex items-center justify-between
            ${error 
              ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-transparent' 
              : 'border-stone-200 focus:ring-2 focus:ring-red-800 focus:border-transparent'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          {...props}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown 
            size={18} 
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-stone-200">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-transparent"
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors flex items-center justify-between
                      ${value === option.value ? 'bg-red-50 text-red-800' : 'text-gray-900'}
                    `}
                  >
                    <span>{option.label}</span>
                    {value === option.value && <Check size={16} className="text-red-800" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-sm">
                  Aucune option trouvée
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
