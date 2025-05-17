/**
 * API Route Creator
 * 
 * This file provides a clean pattern for creating API routes
 * with consistent error handling, authentication, and validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { logger } from '@/lib/logger';
import { createServerClient } from '@/lib/supabase/server-client';

// Type for API handler functions
type ApiHandler<T = unknown> = (
  req: NextRequest,
  context: {
    params: Record<string, string>;
    data?: T;
    userId?: string;
  }
) => Promise<Response> | Response;

/**
 * Creates a basic API route handler with error handling
 */
export function createRoute(handler: ApiHandler) {
  return async (req: NextRequest, { params = {} }: { params?: Record<string, string> } = {}) => {
    try {
      return await handler(req, { params });
    } catch (error) {
      logger.error('API error', { error, path: req.nextUrl.pathname });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
        { status: 500 }
      );
    }
  };
}

/**
 * Creates an API route handler with request body validation
 */
export function createValidatedRoute<T>(schema: ZodSchema<T>, handler: ApiHandler<T>) {
  return createRoute(async (req, context) => {
    try {
      // Validate request body against schema
      const body = await req.json();
      const data = schema.parse(body);
      
      // Call handler with validated data
      return await handler(req, { ...context, data });
    } catch (error) {
      // Handle validation errors
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { 
            error: 'Validation error', 
            details: error.errors 
          },
          { status: 400 }
        );
      }
      
      // Re-throw for other errors
      throw error;
    }
  });
}

/**
 * Creates an authenticated API route handler
 */
export function createAuthenticatedRoute(handler: ApiHandler) {
  return createRoute(async (req, context) => {
    try {
      // Get Supabase client
      const supabase = createServerClient();
      
      // Get user from session
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // Call handler with user ID
      return await handler(req, { ...context, userId: data.user.id });
    } catch (error) {
      logger.error('Auth error', { error, path: req.nextUrl.pathname });
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }
  });
}

/**
 * Creates an authenticated API route handler with request body validation
 */
export function createAuthenticatedValidatedRoute<T>(
  schema: ZodSchema<T>,
  handler: ApiHandler<T>
) {
  return createAuthenticatedRoute(async (req, context) => {
    try {
      // Validate request body against schema
      const body = await req.json();
      const data = schema.parse(body);
      
      // Call handler with validated data and user ID
      return await handler(req, { ...context, data });
    } catch (error) {
      // Handle validation errors
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { 
            error: 'Validation error', 
            details: error.errors 
          },
          { status: 400 }
        );
      }
      
      // Re-throw for other errors
      throw error;
    }
  });
}