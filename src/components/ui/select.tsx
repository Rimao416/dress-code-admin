import React, { useState, forwardRef } from 'react'
import { ChevronDown, Check, AlertCircle } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

interface Option {
  value: string
  label: string
}

interface SelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  options?: Option[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(({
  options = [],
  value,
  onValueChange,
  placeholder = "Sélectionnez une option",
  error,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { isDarkMode } = useTheme()

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedOption = options.find(option => option.value === value)

  return (
    <div className={`relative ${className}`}>
      <button
        ref={ref}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 border rounded-xl transition-all duration-200 text-left flex items-center justify-between
          ${isDarkMode
            ? 'text-white bg-slate-700/50 hover:bg-slate-700/70'
            : 'text-slate-900 bg-slate-50 hover:bg-white'}
          ${error
            ? isDarkMode
              ? 'border-rose-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent'
              : 'border-rose-500 focus:ring-2 focus:ring-rose-500 focus:border-transparent'
            : isDarkMode
              ? 'border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              : 'border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${error ? 'pr-12' : ''}
        `}
        {...props}
      >
        <span className={selectedOption ? '' : (isDarkMode ? 'text-slate-400' : 'text-gray-400')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
            isDarkMode ? 'text-slate-400' : 'text-gray-400'
          }`}
        />
      </button>

      {error && (
        <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
          isDarkMode ? 'text-rose-400' : 'text-rose-500'
        }`}>
          <AlertCircle size={18} />
        </div>
      )}

      {isOpen && (
        <div className={`
          absolute z-50 w-full mt-1 border rounded-xl shadow-lg max-h-60 overflow-hidden
          ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}
        `}>
          <div className={`p-2 border-b ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:border-transparent
                ${isDarkMode
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400 focus:ring-indigo-500'
                  : 'border-slate-200 text-slate-900 placeholder-gray-400 focus:ring-indigo-600'}
              `}
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onValueChange?.(option.value)
                    setIsOpen(false)
                    setSearchTerm('')
                  }}
                  className={`
                    w-full px-4 py-3 text-left transition-colors flex items-center justify-between
                    ${isDarkMode
                      ? value === option.value
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'hover:bg-slate-600/50 text-slate-200'
                      : value === option.value
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'hover:bg-slate-100 text-slate-800'}
                  `}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Check size={16} className={isDarkMode ? 'text-indigo-300' : 'text-indigo-700'} />
                  )}
                </button>
              ))
            ) : (
              <div className={`px-4 py-3 text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                Aucune option trouvée
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
