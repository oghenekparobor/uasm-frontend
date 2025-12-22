'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  hint?: string;
}

/**
 * Reusable form field wrapper with label, error, and hint support
 */
export function FormField({
  label,
  error,
  required,
  children,
  className,
  hint,
}: FormFieldProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface FormFieldGroupProps {
  children: ReactNode;
  className?: string;
}

/**
 * Group form fields together (e.g., for grid layouts)
 */
export function FormFieldGroup({
  children,
  className,
}: FormFieldGroupProps) {
  return <div className={cn('space-y-4', className)}>{children}</div>;
}

