import { ZodError } from 'zod';

/**
 * Format Zod errors into a user-friendly format
 */
export function formatZodError(error: ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const fieldName = err.path.join('.');
    if (fieldName) {
      formatted[fieldName] = err.message;
    }
  });
  
  return formatted;
}

/**
 * Get the first error message from a Zod error
 */
export function getFirstError(error: ZodError): string {
  if (error.errors.length > 0) {
    return error.errors[0].message;
  }
  return 'Validation failed';
}

/**
 * Check if a field has an error
 */
export function hasFieldError(
  errors: Record<string, string>,
  fieldName: string
): boolean {
  return !!errors[fieldName];
}

/**
 * Get error message for a field
 */
export function getFieldErrorMessage(
  errors: Record<string, string>,
  fieldName: string
): string | undefined {
  return errors[fieldName];
}

/**
 * Common validation messages
 */
export const ValidationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be no more than ${max}`,
  uuid: 'Invalid ID format',
  phone: 'Please enter a valid phone number',
  url: 'Please enter a valid URL',
  date: 'Please enter a valid date',
  number: 'Please enter a valid number',
  integer: 'Must be a whole number',
  positive: 'Must be a positive number',
};

