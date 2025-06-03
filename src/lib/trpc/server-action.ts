/**
 * tRPC Server Actions
 *
 * This file provides utilities for using tRPC procedures in Server Actions and
 * Server Components. It allows for type-safe API calls directly from the server.
 * 
 * IMPORTANT: All types have been moved to '@/types/trpc-types.ts'
 * Import types from there instead of from this file.
 */
import 'server-only';
import { appRouter } from './app-router';
import { createContextForRSC } from './context';
import { TRPCError } from '@trpc/server';
import { logger } from '@/lib/logger';
/**
 * Type-safe caller for server components
 * This allows you to call tRPC procedures directly from server components
 * without going through the HTTP API layer.
 */
export async function serverTRPC() {
  try {
    // For server components, we can directly use the createContextForRSC function
    // which provides the necessary context for tRPC procedures without requiring a request
    const ctx = await createContextForRSC();
    
    // Create and return the tRPC caller
    // No need to mock requests - we're directly calling the procedures
    return appRouter.createCaller(ctx);
  } catch (error) {
    // Log the error using the unified logger
    void logger.error('Error creating serverTRPC caller', error);
    
    // Rethrow as tRPC error for consistent error handling
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create serverTRPC caller',
      cause: error,
    });
  }
}

/**
 * Type-safe helper to access a procedure dynamically
 */
export function getCallerProcedure<TInput, TOutput>(
  caller: ReturnType<typeof appRouter.createCaller>,
  namespace: string,
  procedure: string
): (input: TInput) => Promise<TOutput> {
  if (!caller[namespace as keyof typeof caller]) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Router "${namespace}" not found in caller`,
    });
  }

  const routerCaller = caller[namespace as keyof typeof caller];
  if (typeof routerCaller !== 'object' || routerCaller === null) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Router "${namespace}" is not an object`,
    });
  }

  const procedureCaller = routerCaller[procedure as keyof typeof routerCaller];
  if (typeof procedureCaller !== 'function') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Procedure "${procedure}" not found in router "${namespace}"`,
    });
  }

  return procedureCaller as (input: TInput) => Promise<TOutput>;
}

/**
 * Type-safe helper for prefetching queries in server components
 * This can be used to prefetch data on the server and hydrate the client
 */
export async function prefetchTRPCQuery<TInput, TOutput>(
  path: string,
  input: TInput
): Promise<TOutput> {
  try {
    const caller = await serverTRPC();
    const splitPath = path.split('.');

    if (splitPath.length !== 2) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid tRPC path: ${path}. Expected format: "router.procedure"`,
      });
    }

    const [namespace, procedure] = splitPath;
    // Make sure namespace and procedure are both strings and not null
    if (!namespace || !procedure) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid tRPC path segments: ${path}. Expected format: "router.procedure"`,
      });
    }

    return getCallerProcedure<TInput, TOutput>(caller, namespace, procedure)(input);
  } catch (error) {
    // Use detailed logging with structured data
    const inputSafe = JSON.stringify(input).substring(0, 200); // Truncate for safety
    void logger.error(`Error prefetching tRPC query (${path})`, {
      error,
      path,
      inputPreview: inputSafe,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });

    // Preserve original tRPC errors
    if (error instanceof TRPCError) {
      throw error;
    }

    // Convert other errors to standard tRPC error format
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to prefetch tRPC query: ${path}`,
      cause: error,
    });
  }
}

/**
 * Execute a server mutation from a server component
 * This allows executing mutations with proper error handling
 */
export async function executeServerMutation<TInput, TOutput>(
  path: string,
  input: TInput
): Promise<TOutput> {
  try {
    return await prefetchTRPCQuery<TInput, TOutput>(path, input);
  } catch (error) {
    // Use detailed logging with structured data
    const inputSafe = JSON.stringify(input).substring(0, 200); // Truncate for safety
    void logger.error(`Error executing server mutation (${path})`, {
      error,
      path,
      inputPreview: inputSafe,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Preserve original tRPC errors
    if (error instanceof TRPCError) {
      throw error;
    }

    // Convert other errors to standard tRPC error format with improved detail
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to execute server mutation: ${path}`,
      cause: error,
    });
  }
}
