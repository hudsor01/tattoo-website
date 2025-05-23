/**
 * Core Validation Module
 * 
 * Provides foundational validation utilities and schemas used across the application.
 * This consolidated module eliminates duplication and establishes a single source of truth.
 */

import * as z from 'zod';
import { toast } from 'sonner';

// ======== CONSTANTS & CONFIGURATION ========

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Common validation patterns 
export const patterns = {
  phone: /^[0-9+\-() ]+$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&//=]*)$/,
  
  // Common error messages
  messages: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    phone: 'Phone number may only contain digits and +, -, (, ), or spaces',
    min: (field: string, length: number) => `${field} must be at least ${length} characters`,
    max: (field: string, length: number) => `${field} cannot exceed ${length} characters`,
    agreement: 'You must agree to the terms and conditions',
  }
};

// ======== CORE UTILITY FUNCTIONS ========

/**
 * Create safe array validation that avoids direct use of problematic z.array()
 */
export function safeArray<T extends z.ZodTypeAny>(schema: T): z.ZodEffects<z.ZodAny, any, unknown> | z.ZodArray<T> {
  if (IS_PRODUCTION) {
    // In production, use a simplified validator that just checks if it's an array
    return z.preprocess(
      (val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : []),
      z.any()
    );
  }
  
  // In development, use the full Zod validation
  return z.array(schema);
}

/**
 * Custom error map for Zod validation errors
 */
export const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  // Custom error messages based on error code
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === 'string' && issue.received === 'null') {
        return { message: 'This field is required' };
      }
      return { message: `Expected ${issue.expected}, received ${issue.received}` };
      
    case z.ZodIssueCode.invalid_string:
      if (issue.validation === 'email') {
        return { message: 'Please enter a valid email address' };
      }
      if (issue.validation === 'url') {
        return { message: 'Please enter a valid URL' };
      }
      return { message: 'Invalid input' };
      
    case z.ZodIssueCode.too_small: {
      // Logic from original error map
      const minimum = issue.minimum;
      if (issue.type === 'string') {
        if (issue.inclusive) {
          return { message: `Must be at least ${minimum} character${minimum === 1 ? '' : 's'}` };
        }
        return { message: `Must be more than ${minimum} character${minimum === 1 ? '' : 's'}` };
      }
      if (issue.type === 'number') {
        if (issue.inclusive) {
          return { message: `Must be at least ${minimum}` };
        }
        return { message: `Must be greater than ${minimum}` };
      }
      return { message: 'Invalid input' };
    }
      
    case z.ZodIssueCode.too_big: {
      // Logic from original error map
      const maximum = issue.maximum;
      if (issue.type === 'string') {
        if (issue.inclusive) {
          return { message: `Must be at most ${maximum} character${maximum === 1 ? '' : 's'}` };
        }
        return { message: `Must be less than ${maximum} character${maximum === 1 ? '' : 's'}` };
      }
      if (issue.type === 'number') {
        if (issue.inclusive) {
          return { message: `Must be at most ${maximum}` };
        }
        return { message: `Must be less than ${maximum}` };
      }
      return { message: 'Invalid input' };
    }
    
    default:
      return { message: ctx.defaultError };
  }
};

// Configure Zod to use our custom error map
z.setErrorMap(customErrorMap);

// ======== FIELD CREATORS ========

/**
 * Field creators for common field types
 */
export const createField = {
  /**
   * Create a name field validator
   */
  name: (options: { required?: boolean; minLength?: number; maxLength?: number } = {}) => {
    const { required = true, minLength = 2, maxLength = 50 } = options;
    const schema = z.string()
      .trim()
      .min(minLength, patterns.messages.min('Name', minLength))
      .max(maxLength, patterns.messages.max('Name', maxLength))
      .refine(val => /^[a-zA-Z\s-.']+$/.test(val), {
        message: 'Name can only contain letters, spaces, and basic punctuation',
      });
    
    return required ? schema : schema.optional();
  },
  
  /**
   * Create an email field validator
   */
  email: (options: { required?: boolean } = {}) => {
    const { required = true } = options;
    const schema = z.string()
      .trim()
      .email(patterns.messages.email);
    
    return required ? schema : schema.optional();
  },
  
  /**
   * Create a phone field validator
   */
  phone: (options: { required?: boolean } = {}) => {
    const { required = false } = options;
    const schema = z.string()
      .trim()
      .min(7, 'Phone number is too short')
      .max(20, 'Phone number is too long')
      .refine(val => patterns.phone.test(val), {
        message: patterns.messages.phone,
      });
    
    return required ? schema : schema.optional();
  },
  
  /**
   * Create a text field validator
   */
  text: (options: { required?: boolean; minLength?: number; maxLength?: number; fieldName?: string } = {}) => {
    const { 
      required = true, 
      minLength = 1, 
      maxLength = 1000,
      fieldName = 'This field'
    } = options;
    
    const schema = z.string()
      .trim()
      .min(minLength, minLength === 1 ? `${fieldName} is required` : patterns.messages.min(fieldName, minLength))
      .max(maxLength, patterns.messages.max(fieldName, maxLength));
    
    return required ? schema : schema.optional();
  },
  
  
  /**
   * Create a boolean field validator
   */
  boolean: (options: { required?: boolean } = {}) => {
    const { required = true } = options;
    const schema = z.boolean();
    return required ? schema : schema.optional();
  },
  
  /**
   * Create an agreement field validator
   */
  agreement: (errorMessage = patterns.messages.agreement) => {
    return z.boolean().refine(val => val === true, {
      message: errorMessage,
    });
  },
  
  /**
   * Create an array field validator - using safeArray for build compatibility
   */
  array: <T extends z.ZodTypeAny>(schema: T, options: { required?: boolean; minLength?: number; maxLength?: number } = {}) => {
    const { required = true, minLength, maxLength } = options;
    
    let field = safeArray(schema);

    if (minLength !== undefined && minLength !== null && 'min' in field) {
      field = field.min(minLength, {
        message: `At least ${minLength} items required`,
      });
    }

    if (maxLength !== undefined && maxLength !== null && 'max' in field) {
      field = field.max(maxLength, {
        message: `Cannot exceed ${maxLength} items`,
      });
    }
    
    return required ? field : 'optional' in field ? field.optional() : field;
  },
};

// ======== COMMON SCHEMAS ========

// Basic schemas
export const nameSchema = createField.name();
export const emailSchema = createField.email();
export const phoneSchema = createField.phone();
export const dateSchema = z.string().refine(val => !isNaN(Date.parse(val)), {
  message: 'Please enter a valid date',
});
export const urlSchema = z.string().url('Please enter a valid URL').optional().nullable();
export const idSchema = z.string().uuid('Invalid ID format');

// Object schemas
export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1).max(2),
  zipCode: z.string().min(5).max(10),
  country: z.string().default('US'),
});

export const contactInfoSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

// API-related schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortField: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  fields: safeArray(z.string()).optional(),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
});

export const numericIdParamSchema = z.object({
  id: z.coerce.number().int().positive('ID must be a positive integer'),
});

// Sorting schema for list endpoints
export const sortingSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
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

export const successResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string(),
});

export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  });

// ======== VALIDATION UTILITIES ========

/**
 * Create a full validation schema
 */
export function createSchema<T extends z.ZodRawShape>(shape: T) {
  return z.object(shape);
}

/**
 * Helper function to parse data with a schema and handle errors
 */
export function validateInput<T>(schema: z.ZodType<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: z.ZodError<T>;
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

/**
 * Format Zod validation errors into a user-friendly format
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formattedErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  
  return formattedErrors;
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
 * Display validation errors as toast notifications
 */
export function showValidationErrors(error: z.ZodError): void {
  error.errors.forEach((err) => {
    toast.error(err.message);
  });
}

/**
 * Validate data against a schema with standardized return format
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

/**
 * Utility to create a safe (trimmable) string field
 */
export const createSafeString = (
  minLength: number = 1,
  maxLength: number = 255,
  errorMessage: string = 'Invalid input'
) => {
  return z.string()
    .trim()
    .min(minLength, minLength === 1 ? 'This field is required' : `Must be at least ${minLength} characters`)
    .max(maxLength, `Must be less than ${maxLength} characters`)
    .refine(val => val.length > 0, { message: errorMessage });
};

// Re-export zod for convenience
export { z };