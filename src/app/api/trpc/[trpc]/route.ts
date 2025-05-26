/**
 * tRPC API Route Handler
 *
 * This file serves as the entry point for tRPC API calls.
 * It handles all tRPC procedures through a single API endpoint.
 */
import { NextRequest } from 'next/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/lib/trpc/app-router';
import { createTRPCContext } from '@/lib/trpc/context';
import { logger } from '@/lib/logger';

/**
 * Node.js runtime is more compatible with Zod and other dependencies
 * Edge runtime was causing bundling issues with Zod
 */
// export const runtime = 'edge';

/**
 * Handle all tRPC API calls
 */
export async function POST(req: NextRequest) {
  // Debug logging
  const url = req.url ?? '';
  const cookieHeader = req.headers.get('cookie') ?? '';

  logger.debug('tRPC API route called', {
    url,
    method: req.method,
    hasCookies: !!cookieHeader,
  });

  // Create response headers that will be returned
  const resHeaders = new Headers();

  try {
    // Handle the tRPC request
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req,
      router: appRouter,
      createContext: async () => createTRPCContext({ req, resHeaders }),
      onError: ({ path, error }) => {
        // Log all internal errors
        logger.error(`tRPC error in ${path}`, {
          path,
          message: error.message,
          code: error.code,
          cause: error.cause ?? null,
        });
      },
    });

    // Copy all the headers from our original response
    const newHeaders = new Headers(response.headers);

    // Add our custom response headers
    resHeaders.forEach((value, key) => {
      newHeaders.append(key, value);
    });

    // Return the response with all headers
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (error: unknown) {
    // Log the top-level error with full details for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('tRPC handler error', {
      url,
      error: errorMessage,
      stack: errorStack,
    });

    // Return a safe 500 response without exposing internal details
    return new Response(
      JSON.stringify({
        message: 'Internal server error',
        // Only expose error details in development
        // No detailed error information is exposed to the client
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(resHeaders.entries()),
        },
      },
    );
  }
}

/**
 * Fallback handler for non-POST methods
 */
export function GET() {
  return new Response(
    JSON.stringify({
      message: 'tRPC endpoint is working. Use POST for tRPC requests.',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}