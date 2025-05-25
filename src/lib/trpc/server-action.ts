/**
 * tRPC Server Actions
 * 
 * This file provides utilities for using tRPC procedures in Server Actions.
 * It allows for type-safe API calls directly from server components.
 */
import 'server-only';
import { appRouter, type AppRouter } from './app-router';
import { createContextForRSC } from './context';
import { TRPCError, type inferRouterOutputs, type inferRouterInputs } from '@trpc/server';
import { NextRequest } from 'next/server';

// Define types for router inputs and outputs
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Type-safe caller for server components
 * This allows you to call tRPC procedures directly from server components
 */
export async function serverTRPC() {
  try {
    const ctx = await createContextForRSC();
    // Add the required properties for the context
    // Just use a simple object with basic headers
    // This is to avoid Promise<ReadonlyHeaders> type issues
    const headersObj: Record<string, string> = {
      'user-agent': 'server-action-client',
      'content-type': 'application/json',
      'host': 'localhost',
    };
    
    const enhancedCtx = {
      ...ctx,
      req: {} as NextRequest,
      resHeaders: new Headers(),
      headers: headersObj,
      url: '',
    };
    return appRouter.createCaller(enhancedCtx);
  } catch (error) {
    console.error('Error creating serverTRPC caller:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create serverTRPC caller',
      cause: error
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
      message: `Router "${namespace}" not found in caller`
    });
  }
  
  const routerCaller = caller[namespace as keyof typeof caller];
  if (typeof routerCaller !== 'object' || routerCaller === null) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Router "${namespace}" is not an object`
    });
  }
  
  const procedureCaller = routerCaller[procedure as keyof typeof routerCaller];
  if (typeof procedureCaller !== 'function') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Procedure "${procedure}" not found in router "${namespace}"`
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
        message: `Invalid tRPC path: ${path}. Expected format: "router.procedure"`
      });
    }
    
    const [namespace, procedure] = splitPath;
    // Make sure namespace and procedure are both strings and not null
    if (!namespace || !procedure) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Invalid tRPC path segments: ${path}. Expected format: "router.procedure"`
      });
    }
    
    return getCallerProcedure<TInput, TOutput>(caller, namespace, procedure)(input);
  } catch (error) {
    console.error(`Error prefetching tRPC query (${path}):`, error);
    
    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to prefetch tRPC query: ${path}`,
      cause: error
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
    console.error(`Error executing server mutation (${path}):`, error);
    
    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Failed to execute server mutation: ${path}`,
      cause: error
    });
  }
}