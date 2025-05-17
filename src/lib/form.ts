import * as React from 'react';
import { FormProvider, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

/**
 * Form helper function to create a form with Zod schema
 * This is a simple utility to get the zodResolver with proper typing
 *
 * @example
 * const form = useForm({
 *   ...zodForm(mySchema),
 *   defaultValues: {...}
 * });
 */
export function zodForm<T extends z.ZodType>(schema: T) {
  return {
    resolver: zodResolver(schema),
  };
}

/**
 * This is a utility to validate data against a Zod schema
 * Useful for validating data before submission
 *
 * @example
 * const result = validateWithZod(mySchema, data);
 * if (result.success) {
 *   // use result.data
 * } else {
 *   // handle result.error
 * }
 */
export function validateWithZod<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

/**
 * Format Zod validation errors for API responses
 */
export function formatZodErrors(error: z.ZodError) {
  return {
    errors: error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    })),
  };
}

/**
 * Export form related utilities
 */
export { FormProvider };
