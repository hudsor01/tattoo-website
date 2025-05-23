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
import { fixSupabaseUrl, ensureCorrectSupabaseUrl } from '@/lib/utils/url-utils';
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
  const url = req.url || '';
  const cleanUrl = fixSupabaseUrl(ensureCorrectSupabaseUrl(url));
  const cookieHeader = req.headers.get('cookie') || '';

  logger.debug('tRPC API route called', {
    url: cleanUrl,
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
          // Note: error.data may not exist on TRPCError in this version
          cause: error.cause || null,
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
    // Log the top-level error
    logger.error('tRPC handler error', {
      url: cleanUrl,
      error: error instanceof Error ? error.message : String(error),
    });

    // Return a 500 response
    return new Response(
      JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error),
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