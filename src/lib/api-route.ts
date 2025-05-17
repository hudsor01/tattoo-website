/**
 * API Route Helpers
 * 
 * This file provides utilities for creating API routes with consistent
 * error handling, validation, and response formatting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { validateRequestBody } from './validation-server';
import { logger } from './logger';

/**
 * API route handler with error handling and validation
 * 
 * @param handler The handler function for the route
 * @returns A function that can be used as a route handler
 */
export function createApiRoute(
  handler: (
    req: NextRequest,
    params: { [key: string]: string }
  ) => Promise<NextResponse> | NextResponse
) {
  return async (req: NextRequest, { params }: { params: { [key: string]: string } }) => {
    try {
      // Call the handler
      return await handler(req, params);
    } catch (error) {
      // Log the error
      logger.error('API route error', { 
        path: req.nextUrl.pathname,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Return an error response
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: error instanceof Error && 'errors' in error ? (error as any).errors : undefined
        },
        { status: error instanceof Error && 'status' in error ? (error as any).status : 500 }
      );
    }
  };
}

/**
 * API route handler with validation
 * 
 * @param schema The Zod schema to validate the request body against
 * @param handler The handler function for the route
 * @returns A function that can be used as a route handler
 */
export function createValidatedApiRoute<T>(
  schema: ZodSchema<T>,
  handler: (
    req: NextRequest,
    params: { [key: string]: string },
    data: T
  ) => Promise<NextResponse> | NextResponse
) {
  return createApiRoute(async (req: NextRequest, params: { [key: string]: string }) => {
    // Validate the request body
    const validation = await validateRequestBody(req, schema);
    
    // If validation failed, return the error response
    if (!validation.success) {
      return validation.response;
    }
    
    // Call the handler with the validated data
    return await handler(req, params, validation.data);
  });
}

/**
 * Create a protected API route that requires authentication
 * 
 * @param handler The handler function for the route
 * @returns A function that can be used as a route handler
 */
export function createProtectedApiRoute(
  handler: (
    req: NextRequest,
    params: { [key: string]: string },
    userId: string
  ) => Promise<NextResponse> | NextResponse
) {
  return createApiRoute(async (req: NextRequest, params: { [key: string]: string }) => {
    // Get authentication token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    try {
      // Verify token with Supabase
      const { createMiddlewareClient } = await import('@supabase/auth-helpers-nextjs');
      const supabase = createMiddlewareClient({ req, res: NextResponse.next() });
      
      const { data, error } = await supabase.auth.getUser(token);
      
      if (error || !data.user) {
        logger.warn('Invalid auth token', { error });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Call the handler with the user ID
      return await handler(req, params, data.user.id);
    } catch (error) {
      logger.error('Auth verification error', { error });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  });
}

/**
 * Create a protected API route with validation
 * 
 * @param schema The Zod schema to validate the request body against
 * @param handler The handler function for the route
 * @returns A function that can be used as a route handler
 */
export function createProtectedValidatedApiRoute<T>(
  schema: ZodSchema<T>,
  handler: (
    req: NextRequest,
    params: { [key: string]: string },
    userId: string,
    data: T
  ) => Promise<NextResponse> | NextResponse
) {
  return createProtectedApiRoute(async (req: NextRequest, params: { [key: string]: string }, userId: string) => {
    // Validate the request body
    const validation = await validateRequestBody(req, schema);
    
    // If validation failed, return the error response
    if (!validation.success) {
      return validation.response;
    }
    
    // Call the handler with the validated data
    return await handler(req, params, userId, validation.data);
  });
}