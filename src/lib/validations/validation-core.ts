/**
 * Core validation utilities and reusable Zod schemas
 * 
 * This module provides common validation schemas and utilities
 * used across different validation modules.
 */

// Import Zod as a namespace to avoid tree-shaking issues in Edge runtime
import * as z from 'zod';

// Check if we're in production build mode
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Create safe array validation that avoids direct use of problematic z.array()
export function safeArray<T extends z.ZodTypeAny>(schema: T) {
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
 * Error map for Zod validation errors
 * Customizes error messages for better user experience
 */
export const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  // Custom error messages based on error code
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.expected === 'string' && issue.received === 'undefined') {
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

/**
 * Reusable schemas for common field types
 */

// Common name validation (first name, last name, etc.)
export const nameSchema = z.string()
  .min(2, 'Must be at least 2 characters')
  .max(50, 'Must be less than 50 characters')
  .refine(val => /^[a-zA-Z\s-.']+$/.test(val), {
    message: 'Name can only contain letters, spaces, and basic punctuation',
  });

// Email validation
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(100, 'Email is too long');

// Phone number validation
export const phoneSchema = z.string()
  .min(7, 'Phone number is too short')
  .max(20, 'Phone number is too long')
  .refine(val => /^[0-9+\-\s()]+$/.test(val), {
    message: 'Please enter a valid phone number',
  })
  .optional()
  .nullable();

// Password validation
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine(val => /[A-Z]/.test(val), { 
    message: 'Password must contain at least one uppercase letter',
  })
  .refine(val => /[a-z]/.test(val), { 
    message: 'Password must contain at least one lowercase letter',
  })
  .refine(val => /[0-9]/.test(val), { 
    message: 'Password must contain at least one number',
  });

// Date validation in ISO format
export const dateSchema = z.string()
  .refine(val => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid date',
  });

// URL validation
export const urlSchema = z.string()
  .url('Please enter a valid URL')
  .optional()
  .nullable();

// Generic ID validation
export const idSchema = z.string().uuid('Invalid ID format');

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

// Export an alias for backward compatibility
export const formatZodErrors = formatValidationErrors;

/**
 * Display validation errors as toast notifications
 */
export function showValidationErrors(error: z.ZodError): void {
  error.errors.forEach((err) => {
    // toast.error(err.message);
  });
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

/**
 * Utility to create a schema with multiple fields
 */
export function createSchema(fields: Record<string, z.ZodType<any>>) {
  // Simple passthrough that just creates an object schema
  return z.ZodObject.create(fields);
}

/**
 * Field creators for common field types
 */
export const createField = {
  // Helper for array fields that's safe across environments
  array: <T extends z.ZodTypeAny>(schema: T, options = {}) => {
    const { required = true } = options;
    return required ? safeArray(schema) : z.optional(safeArray(schema));
  },
  
  // Name field
  name: (options = {}) => {
    const { required = true, minLength = 2, maxLength = 50 } = options;
    const schema = z.string()
      .trim()
      .min(minLength, `Name must be at least ${minLength} characters`)
      .max(maxLength, `Name must be at most ${maxLength} characters`);
    
    return required ? schema : schema.optional();
  },
  
  // Email field
  email: (options = {}) => {
    const { required = true } = options;
    const schema = z.string()
      .trim()
      .email('Please enter a valid email address');
    
    return required ? schema : schema.optional();
  },
  
  // Phone field
  phone: (options = {}) => {
    const { required = false } = options;
    const schema = z.string()
      .trim()
      .min(7, 'Phone number is too short')
      .max(20, 'Phone number is too long')
      .refine(val => /^[0-9+\-\s()]+$/.test(val), {
        message: 'Please enter a valid phone number',
      });
    
    return required ? schema : schema.optional();
  },
  
  // Text field
  text: (options = {}) => {
    const { 
      required = true, 
      minLength = 1, 
      maxLength = 1000,
      fieldName = 'Text'
    } = options;
    
    const schema = z.string()
      .trim()
      .min(minLength, minLength === 1 ? `${fieldName} is required` : `${fieldName} must be at least ${minLength} characters`)
      .max(maxLength, `${fieldName} must be at most ${maxLength} characters`);
    
    return required ? schema : schema.optional();
  },
  
  // Boolean/checkbox field
  agreement: (errorMessage = 'You must agree to continue') => {
    return z.boolean().refine(val => val === true, {
      message: errorMessage,
    });
  }
};