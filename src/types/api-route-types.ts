/**
 * api-route-types.ts
 * 
 * Type definitions for API route handlers and responses.
 * These types provide structure for the API route handlers in src/lib/api/api-route.ts.
 */

import { NextRequest, NextResponse } from 'next/server';
// z import used in other files that import from this module
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { z } from 'zod';

// Error response structure
export type ErrorResponse = {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
};

// Success response structure 
export type SuccessResponse<T> = {
  status: 'success';
  data: T;
  message?: string;
};

// API Response type
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Route handler config options
export type RouteHandlerConfig = {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  enableCaching?: boolean;
  cacheTTL?: number; // in seconds
  cacheKey?: string | ((req: NextRequest) => string);
};

/**
 * Generic handler function type
 * @template T The type of the validated data
 * @template U The type of the user, defaults to unknown
 * @template R The type of the response data, defaults to unknown
 */
export type HandlerFunction<T, U = unknown, R = unknown> = (
  req: NextRequest,
  context: {
    params?: Record<string, string>;
    user?: U;
    validatedData?: T;
  }
) => Promise<ApiResponse<R> | NextResponse>;
