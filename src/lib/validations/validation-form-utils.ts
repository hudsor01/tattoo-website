'use client';

/**
 * Form Validation Utilities
 *
 * This file provides utilities for client-side form validation and handling.
 * It includes helper functions for handling form errors and managing validation state.
 */

import { z } from 'zod';

/**
 * Universal error handler for form errors
 *
 * @example
 * try {
 *   // form submission code
 * } catch (error) {
 *   handleFormError(error, setError);
 * }
 */
export interface ValidationErrorWithPath {
  path: string;
  message: string;
}

export interface ErrorWithValidationErrors {
  errors: ValidationErrorWithPath[];
}

export function handleFormError(
  error: unknown,
  setError: (field: string, error: { message: string }) => void,
  form?: Record<string, unknown>,
) {
  // If the form is provided, try to set specific field errors
  if (form && error && typeof error === 'object' && 'errors' in error) {
    // Type guard for validation errors
    function isErrorWithValidationErrors(err: unknown): err is ErrorWithValidationErrors {
      return typeof err === 'object' && 
             err !== null && 
             'errors' in err && 
             Array.isArray((err as ErrorWithValidationErrors).errors);
    }
    
    if (isErrorWithValidationErrors(error)) {
      error.errors.forEach(err => {
        if (err.path) {
          setError(err.path, { message: err.message });
        }
      });
      return;
    }
  }

  // Generic error handling
  console.error('Form error:', error);
  if (error instanceof Error) {
    setError('root', { message: error.message });
  } else {
    setError('root', { message: 'An unexpected error occurred' });
  }
}

/**
 * Get field error message from Zod validation error
 *
 * @example
 * try {
 *   schema.parse(formData);
 * } catch (error) {
 *   const nameError = getFieldError(error, 'name');
 *   if (nameError) {
 *     setError('name', { message: nameError });
 *   }
 * }
 */
export function getFieldError(error: unknown, field: string): string | null {
  if (error instanceof z.ZodError) {
    const fieldError = error.errors.find(err => err.path.join('.') === field);
    return fieldError?.message || null;
  }
  return null;
}

/**
 * Create form field value getter with defaults
 *
 * @example
 * const getFieldValue = createFieldValueGetter(defaultValues);
 * const nameValue = getFieldValue('name', '');
 */
export function createFieldValueGetter<T extends Record<string, unknown>>(defaultValues: T) {
  return <K extends keyof T, D>(fieldName: K, fallback?: D): T[K] | D => {
    const value = defaultValues[fieldName];
    return value !== undefined ? value : (fallback as D);
  };
}

/**
 * Safe parser for form data
 * Returns validation result with success status
 *
 * @example
 * const result = safeParse(schema, formData);
 * if (result.success) {
 *   // Use result.data
 * } else {
 *   // Handle result.error
 * }
 */
export function safeParse<T extends z.ZodType>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Returns all validation errors for a form as a simple object
 * Keys are field names, values are error messages
 *
 * @example
 * const errors = getValidationErrors(zodError);
 * // { name: 'Name is required', email: 'Invalid email' }
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  error.errors.forEach(err => {
    const path = err.path.join('.');
    if (path) {
      errors[path] = err.message;
    }
  });

  return errors;
}
