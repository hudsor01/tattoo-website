/**
 * Consolidated Validation Module
 * 
 * This file combines functionality from validation-common.ts and validation-core.ts
 * to provide a single source of truth for validation patterns.
 */

import * as z from 'zod';
import { safeArray } from './validation-core';

/**
 * Common validation patterns reused across schemas
 */
export const patterns = {
  // Regex patterns
  phone: /^[0-9+\-() ]+$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&//=]*)$/,
  
  // Error messages
  messages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Phone number may only contain digits and +, -, (, ), or spaces',
    password: 'Password must include uppercase, lowercase, number, and special character',
    min: (field: string, length: number) => `${field} must be at least ${length} characters`,
    max: (field: string, length: number) => `${field} cannot exceed ${length} characters`,
    agreement: 'You must agree to the terms and conditions',
  }
};

/**
 * Factory functions for creating commonly used field validators
 */
export const createField = {
  /**
   * Create a name field validator
   */
  name: (options?: { required?: boolean; minLength?: number; maxLength?: number }) => {
    const field = z
      .string()
      .min(options?.minLength ?? 2, {
        message: patterns.messages.min('Name', options?.minLength ?? 2),
      })
      .max(options?.maxLength ?? 100, {
        message: patterns.messages.max('Name', options?.maxLength ?? 100),
      });

    return options?.required === false ? field.optional() : field;
  },

  /**
   * Create an email field validator
   */
  email: (options?: { required?: boolean }) => {
    const field = z.string().email({ message: patterns.messages.email });
    return options?.required === false ? field.optional() : field;
  },

  /**
   * Create a phone field validator
   */
  phone: (options?: { required?: boolean }) => {
    const field = z
      .string()
      .min(10, { message: patterns.messages.min('Phone number', 10) })
      .regex(patterns.phone, {
        message: patterns.messages.phone,
      });

    return options?.required === false ? field.optional() : field;
  },

  /**
   * Create a text field validator
   */
  text: (options?: { 
    required?: boolean; 
    minLength?: number; 
    maxLength?: number;
    fieldName?: string;
  }) => {
    const name = options?.fieldName || 'Text';
    const field = z
      .string()
      .min(options?.minLength ?? 1, {
        message: patterns.messages.min(name, options?.minLength ?? 1),
      })
      .max(options?.maxLength ?? 1000, {
        message: patterns.messages.max(name, options?.maxLength ?? 1000),
      });

    return options?.required === false ? field.optional() : field;
  },

  /**
   * Create a password field validator
   */
  password: (options?: { required?: boolean; minLength?: number }) => {
    const field = z
      .string()
      .min(options?.minLength ?? 8, {
        message: patterns.messages.min('Password', options?.minLength ?? 8),
      })
      .regex(patterns.password, {
        message: patterns.messages.password,
      });

    return options?.required === false ? field.optional() : field;
  },

  /**
   * Create a boolean field validator
   */
  boolean: (options?: { required?: boolean }) => {
    const field = z.boolean();
    return options?.required === false ? field.optional() : field;
  },

  /**
   * Create an agreement field validator
   */
  agreement: (message = patterns.messages.agreement) => {
    return z.boolean().refine(val => val === true, { message });
  },

  /**
   * Create an array field validator - using safeArray for build compatibility
   */
  array: <T extends z.ZodTypeAny>(
    schema: T,
    options?: { required?: boolean; minLength?: number; maxLength?: number }
  ) => {
    let field = safeArray(schema);

    if (options?.minLength !== undefined) {
      field = field.min(options.minLength, {
        message: `At least ${options.minLength} items required`,
      });
    }

    if (options?.maxLength !== undefined) {
      field = field.max(options.maxLength, {
        message: `Cannot exceed ${options.maxLength} items`,
      });
    }

    return options?.required === false ? field.optional() : field;
  }
};

/**
 * Common schema definitions
 */

// Basic pagination schema for list endpoints
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortField: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  fields: safeArray(z.string()).optional(),
});

// Common address schema
export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1).max(2),
  zipCode: z.string().min(5).max(10),
  country: z.string().default('US'),
});

// Contact information schema
export const contactInfoSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

// ID parameter schemas
export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export const numericIdParamSchema = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});

// Response schemas
export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: safeArray(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

export const errorResponseSchema = z.object({
  error: z.string(),
  details: safeArray(
    z.object({
      path: z.string(),
      message: z.string(),
    })
  ).optional(),
});

// Standard response wrapper
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  });

/**
 * Create a full validation schema
 */
export function createSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

/**
 * Format Zod validation errors for API responses
 */
export function formatZodErrors(error: z.ZodError) {
  return {
    errors: error.errors.map(err => ({
      path: err.path.join('.'),
      code: err.code,
      message: err.message,
    })),
  };
}

/**
 * Validate data against a schema
 */
export function validateData<T extends z.ZodType>(
  schema: T,
  data: unknown
):
  | { success: true; data: z.infer<T>; error: null }
  | { success: false; data: null; error: ReturnType<typeof formatZodErrors> } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, error: formatZodErrors(error) };
    }
    throw error;
  }
}

// Utility to help share types between frontend and backend
export type InferResponseType<T extends z.ZodType> = z.infer<
  ReturnType<typeof apiResponseSchema<T>>
>;

// Re-export zod for convenience
export { z };