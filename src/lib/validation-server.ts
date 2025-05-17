/**
 * Server-side Validation Utilities
 * 
 * This file provides server-safe validation functions that can be used
 * in API routes, server components, and other server-side code.
 */

import { ZodSchema, ZodError } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Validate request data against a Zod schema
 * 
 * @param data The data to validate
 * @param schema The Zod schema to validate against
 * @returns The validated data or throws a ZodError
 */
export function validateData<T>(data: unknown, schema: ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      // Transform the error for better client consumption
      const formattedError = formatZodError(error);
      throw formattedError;
    }
    throw error;
  }
}

/**
 * Validate request body against a Zod schema
 * 
 * @param request The NextRequest object
 * @param schema The Zod schema to validate against
 * @returns The validated data or returns a 400 response
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const data = validateData(body, schema);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError || error.name === 'ValidationError') {
      return {
        success: false,
        response: NextResponse.json(
          { error: error.message, details: error.errors || [] },
          { status: 400 }
        ),
      };
    }
    
    // Unknown error
    console.error('Validation error:', error);
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Format a ZodError into a more user-friendly format
 * 
 * @param error The ZodError to format
 * @returns A formatted error object
 */
export function formatZodError(error: ZodError): Error & { errors: Record<string, string[]> } {
  const formattedError = new Error('Validation error') as Error & { errors: Record<string, string[]> };
  formattedError.name = 'ValidationError';
  
  // Group errors by path
  const errors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.') || '_';
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });
  
  formattedError.errors = errors;
  return formattedError;
}

/**
 * Normalize form data for validation
 * This handles converting string values from forms to the appropriate types
 * 
 * @param data The form data to normalize
 * @returns Normalized data ready for validation
 */
export function normalizeFormData(data: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Handle basic type conversions
    if (value === 'true') {
      normalized[key] = true;
    } else if (value === 'false') {
      normalized[key] = false;
    } else if (value === 'null') {
      normalized[key] = null;
    } else if (value === 'undefined') {
      normalized[key] = undefined;
    } else if (typeof value === 'string' && !isNaN(Number(value)) && value.trim() !== '') {
      // Convert to number if it's a valid number string
      normalized[key] = Number(value);
    } else if (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{1,3})?Z?$/.test(value)
    ) {
      // Convert ISO date strings to Date objects
      normalized[key] = new Date(value);
    } else {
      normalized[key] = value;
    }
  }
  
  return normalized;
}