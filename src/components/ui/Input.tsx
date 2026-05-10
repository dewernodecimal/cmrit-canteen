'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-bold text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-[var(--radius-button)] bg-surface-700 border border-surface-600
              px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary
              focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500
              transition-all duration-200
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-rose-500/50 focus:ring-rose-500/10' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        )}

      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
