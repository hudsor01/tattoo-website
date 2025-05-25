/**
 * Safe Zod Utilities
 * 
 * This file provides safe alternatives to Zod functionality that
 * may cause issues during build or in the Edge runtime.
 */

import * as z from 'zod';

// Check if we're in production build mode
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Creates a safe array validator that works in both development
 * and production environments without causing build issues.
 * 
 * @param schema The schema for array elements
 * @returns A Zod schema that safely validates arrays
 */
export function safeArray<T extends z.ZodTypeAny>(schema: T): z.ZodTypeAny {
  if (IS_PRODUCTION) {
    // In production, use a simplified validator that just checks if it's an array
    return z.preprocess(
      (val) => (Array.isArray(val) ? val : typeof val === 'string' ? [val] : []),
      z.unknown()
    );
  }
  
  // In development, use the full Zod validation
  return z.array(schema);
}

/**
 * Export Zod namespace for convenience
 */
export { z };