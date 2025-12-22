import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Custom hook for form validation with Zod schemas
 * Provides real-time validation feedback and error handling
 */
export function useFormValidation<T extends Record<string, any>>(
  schema: ZodSchema<T>,
  initialValues?: Partial<T>
) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (fieldName: keyof T, value: any): boolean => {
      try {
        // Create a partial object with just this field
        const partialData = { [fieldName]: value };
        
        // Use Zod's safeParse with partial validation
        const fieldSchema = schema.shape?.[fieldName as string];
        if (fieldSchema) {
          fieldSchema.parse(value);
        } else {
          // Fallback: validate the entire object but only check this field's error
          schema.parse({ ...initialValues, [fieldName]: value } as T);
        }
        
        // Clear error for this field
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName as string];
          return newErrors;
        });
        
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.errors.find(
            (e) => e.path[0] === fieldName
          );
          if (fieldError) {
            setErrors((prev) => ({
              ...prev,
              [fieldName as string]: fieldError.message,
            }));
            return false;
          }
        }
        return false;
      }
    },
    [schema, initialValues]
  );

  /**
   * Validate the entire form
   */
  const validateForm = useCallback(
    (data: Partial<T>): ValidationResult => {
      try {
        schema.parse(data);
        setErrors({});
        return { isValid: true, errors: {} };
      } catch (error) {
        if (error instanceof ZodError) {
          const formErrors: Record<string, string> = {};
          error.errors.forEach((err) => {
            const fieldName = err.path[0] as string;
            if (fieldName) {
              formErrors[fieldName] = err.message;
            }
          });
          setErrors(formErrors);
          return { isValid: false, errors: formErrors };
        }
        return { isValid: false, errors: {} };
      }
    },
    [schema]
  );

  /**
   * Mark a field as touched
   */
  const setFieldTouched = useCallback((fieldName: keyof T, isTouched = true) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName as string]: isTouched,
    }));
  }, []);

  /**
   * Get error for a specific field
   */
  const getFieldError = useCallback(
    (fieldName: keyof T): string | undefined => {
      return errors[fieldName as string];
    },
    [errors]
  );

  /**
   * Check if a field has been touched and has an error
   */
  const getFieldHasError = useCallback(
    (fieldName: keyof T): boolean => {
      return touched[fieldName as string] === true && !!errors[fieldName as string];
    },
    [errors, touched]
  );

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName as string];
      return newErrors;
    });
  }, []);

  /**
   * Reset validation state
   */
  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    setFieldTouched,
    getFieldError,
    getFieldHasError,
    clearErrors,
    clearFieldError,
    reset,
  };
}

