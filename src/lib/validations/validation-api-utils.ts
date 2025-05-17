/**
 * API Validation Utilities
 * 
 * This file provides utilities for handling API validation and responses.
 * It includes functions for parsing and validating request data and creating
 * standardized API route handlers.
 */

// Import Zod as a namespace to avoid tree-shaking issues in Edge runtime
import * as z from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { formatZodErrors } from './validation-core';

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
      { error: 'Validation error', details: formatZodErrors(error) },
      { status: 400 }
    );
  }

  return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
}

/**
 * Parses and validates request body against a schema
 */
export async function parseBody<T extends z.ZodType>(
  req: NextRequest | Request,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON body');
    }
    throw error;
  }
}

/**
 * Parses and validates query parameters against a schema
 */
export function parseQuery<T extends z.ZodType>(req: NextRequest, schema: T): z.infer<T> {
  const url = new URL(req.url);
  const queryObj: Record<string, string> = {};

  url.searchParams.forEach((value, key) => {
    queryObj[key] = value;
  });

  return schema.parse(queryObj);
}

/**
 * Parses and validates path parameters (from dynamic routes)
 */
export function parseParams<T extends z.ZodType>(
  params: Record<string, string | string[]>,
  schema: T
): z.infer<T> {
  return schema.parse(params);
}

/**
 * Creates an API route handler with method-specific schemas and handlers
 */
// Defining empty schema with Record<string, never> instead of {} for type safety
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EmptySchema = z.ZodObject.create({});
// We define EmptySchema so we can use it as a type parameter default value below

export function apiRoute<
  TGet extends z.ZodType = typeof EmptySchema,
  TPost extends z.ZodType = typeof EmptySchema,
  TPut extends z.ZodType = typeof EmptySchema,
  TPatch extends z.ZodType = typeof EmptySchema,
  TDelete extends z.ZodType = typeof EmptySchema
>(config: {
  GET?: {
    querySchema?: TGet;
    handler: (query: z.infer<TGet>, request: NextRequest) => Promise<NextResponse>;
  };
  POST?: {
    bodySchema: TPost;
    handler: (body: z.infer<TPost>, request: NextRequest) => Promise<NextResponse>;
  };
  PUT?: {
    bodySchema: TPut;
    handler: (body: z.infer<TPut>, request: NextRequest) => Promise<NextResponse>;
  };
  PATCH?: {
    bodySchema: TPatch;
    handler: (body: z.infer<TPatch>, request: NextRequest) => Promise<NextResponse>;
  };
  DELETE?: {
    querySchema?: TDelete;
    handler: (query: z.infer<TDelete>, request: NextRequest) => Promise<NextResponse>;
  };
}) {
  return async (request: NextRequest) => {
    try {
      const method = request.method;

      // Handle GET requests
      if (method === 'GET' && config.GET) {
        const query = config.GET.querySchema ? parseQuery(request, config.GET.querySchema) : {};
        return await config.GET.handler(query, request);
      }

      // Handle POST requests
      if (method === 'POST' && config.POST) {
        const body = await parseBody(request, config.POST.bodySchema);
        return await config.POST.handler(body, request);
      }

      // Handle PUT requests
      if (method === 'PUT' && config.PUT) {
        const body = await parseBody(request, config.PUT.bodySchema);
        return await config.PUT.handler(body, request);
      }

      // Handle PATCH requests
      if (method === 'PATCH' && config.PATCH) {
        const body = await parseBody(request, config.PATCH.bodySchema);
        return await config.PATCH.handler(body, request);
      }

      // Handle DELETE requests
      if (method === 'DELETE' && config.DELETE) {
        const query = config.DELETE.querySchema
          ? parseQuery(request, config.DELETE.querySchema)
          : {};
        return await config.DELETE.handler(query, request);
      }

      // Method not allowed
      return NextResponse.json({ error: `Method ${method} not allowed` }, { status: 405 });
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Create a typed API handler with Zod validation
 */
export function createHandler<T extends z.ZodType>({
  schema,
  handler,
}: {
  schema: T;
  handler: (data: z.infer<T>, request: Request) => Promise<Response>;
}) {
  return async (request: Request) => {
    try {
      const body = await parseBody(request, schema);
      return handler(body, request);
    } catch (error) {
      console.error('Handler error:', error);
      
      if (error instanceof z.ZodError) {
        return Response.json(
          { error: 'Validation error', details: formatZodErrors(error) }, 
          { status: 400 }
        );
      }
      
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}