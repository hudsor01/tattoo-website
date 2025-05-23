/**
 * Consolidated Validations
 * 
 * This file consolidates all validation schemas and utilities that are actually used.
 * Cleaned up from 13 separate files to remove redundancy and unused code.
 */

import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// ========================================
// CORE PATTERNS & UTILITIES
// ========================================

export const patterns = {
  phone: /^[0-9+\-() ]+$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&//=]*)$/,
};

/**
 * Format Zod validation errors into readable messages
 */
export function formatZodErrors(error: z.ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
    return `${path}${err.message}`;
  });
}

// ========================================
// FIELD BUILDERS
// ========================================

export const createField = {
  name: (options: { required?: boolean; minLength?: number; maxLength?: number } = {}) => {
    const { required = true, minLength = 2, maxLength = 50 } = options;
    
    const schema = z.string()
      .min(minLength, { message: `Name must be at least ${minLength} characters` })
      .max(maxLength, { message: `Name cannot exceed ${maxLength} characters` })
      .refine(val => /^[a-zA-Z\s-.']+$/.test(val), {
        message: 'Name can only contain letters, spaces, and basic punctuation',
      });
    
    return required ? schema : schema.optional();
  },

  email: (options: { required?: boolean } = {}) => {
    const { required = true } = options;
    const schema = z.string().email('Please enter a valid email address');
    return required ? schema : schema.optional();
  },

  phone: (options: { required?: boolean } = {}) => {
    const { required = true } = options;
    const schema = z.string()
      .regex(patterns.phone, 'Phone number may only contain digits and +, -, (, ), or spaces')
      .min(10, 'Phone number must be at least 10 digits')
      .max(20, 'Phone number cannot exceed 20 characters');
    
    return required ? schema : schema.optional();
  },

  text: (options: { 
    required?: boolean; 
    minLength?: number; 
    maxLength?: number; 
    fieldName?: string 
  } = {}) => {
    const { required = true, minLength = 1, maxLength = 500, fieldName = 'This field' } = options;
    
    const schema = z.string()
      .min(minLength, { message: `${fieldName} must be at least ${minLength} characters` })
      .max(maxLength, { message: `${fieldName} cannot exceed ${maxLength} characters` });
    
    return required ? schema : schema.optional();
  },
};

// ========================================
// CONTACT FORM VALIDATION
// ========================================

export const contactFormSchema = z.object({
  name: createField.name(),
  email: createField.email(),
  phone: createField.phone({ required: false }),
  subject: createField.text({
    minLength: 2,
    maxLength: 100,
    fieldName: 'Subject'
  }),
  message: createField.text({
    minLength: 10,
    maxLength: 1000,
    fieldName: 'Message'
  }),
  tattooType: z.string().optional(),
  budget: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'either']).default('email'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// ========================================
// API UTILITIES
// ========================================

/**
 * Get a readable error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Standard error handler for API routes
 */
export function handleApiError(error: unknown) {
  console.error('API error:', error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        details: formatZodErrors(error),
      },
      { status: 400 }
    );
  }

  const message = getErrorMessage(error);
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 500 }
  );
}

/**
 * Create a standardized API route with validation
 */
export function apiRoute<T extends z.ZodTypeAny>(
  schema: T,
  handler: (data: z.infer<T>, req: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const data = schema.parse(body);
      return await handler(data, req);
    } catch (error) {
      return handleApiError(error);
    }
  };
}