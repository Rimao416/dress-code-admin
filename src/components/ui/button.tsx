import React, { forwardRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  const { isDarkMode } = useTheme();
  
  const baseClasses = 'font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 outline-none focus:outline-none';
 
  const getVariantClasses = (variant: ButtonVariant) => {
    const variants = {
      primary: isDarkMode
        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800'
        : 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-700 hover:to-indigo-600 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
       
      secondary: isDarkMode
        ? 'border border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500 hover:shadow-md focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800'
        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md focus:ring-2 focus:ring-slate-300 focus:ring-offset-2',
       
      outline: isDarkMode
        ? 'border border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800'
        : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
       
      ghost: isDarkMode
        ? 'text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800'
        : 'text-indigo-600 hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2',
       
      danger: isDarkMode
        ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:from-rose-700 hover:to-rose-600 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-slate-800'
        : 'bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:from-rose-700 hover:to-rose-600 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-rose-500 focus:ring-offset-2'
    };
   
    return variants[variant];
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${getVariantClasses(variant)}
        ${sizeClasses[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${
          variant === 'primary' || variant === 'danger'
            ? 'border-white'
            : isDarkMode
              ? 'border-indigo-400'
              : 'border-indigo-600'
        }`}></div>
      )}
      {leftIcon && !loading && leftIcon}
      {children}
      {rightIcon && !loading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;