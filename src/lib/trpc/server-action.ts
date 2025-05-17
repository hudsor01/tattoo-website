/**
 * tRPC Server Actions
 * 
 * This file provides utilities for using tRPC procedures in Server Actions.
 * It allows for type-safe API calls directly from server components.
 */
import { experimental_createServerActionHandler } from '@trpc/server/adapters/next';
import { appRouter } from './routers';
import { createContextForRSC } from './context';
import type { AppRouter } from './routers';

// Type definition for router procedure path
type RouterProcedurePath = keyof AppRouter['_def']['procedures'] & string;

/**
 * Create a server action handler for tRPC procedures
 * This allows you to call tRPC procedures directly from server components
 */
export const serverActionHandler = experimental_createServerActionHandler({
  router: appRouter,
  createContext: createContextForRSC,
});

/**
 * Type-safe caller for server components
 * This allows you to call tRPC procedures directly from server components
 */
export async function serverTRPC() {
  const ctx = await createContextForRSC();
  return appRouter.createCaller(ctx);
}

/**
 * Type-safe helper to access a procedure dynamically
 */
function getCallerProcedure<TInput, TOutput>(
  caller: ReturnType<typeof appRouter.createCaller>,
  namespace: string, 
  procedure: string
): (input: TInput) => Promise<TOutput> {
  if (!caller[namespace as keyof typeof caller]) {
    throw new Error(`Namespace "${namespace}" not found in caller`);
  }
  
  const routerCaller = caller[namespace as keyof typeof caller];
  if (typeof routerCaller !== 'object' || routerCaller === null) {
    throw new Error(`Namespace "${namespace}" is not an object`);
  }
  
  const procedureCaller = routerCaller[procedure as keyof typeof routerCaller];
  if (typeof procedureCaller !== 'function') {
    throw new Error(`Procedure "${procedure}" not found in namespace "${namespace}"`);
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
  const caller = await serverTRPC();
  const splitPath = path.split('.');
  
  if (splitPath.length !== 2) {
    throw new Error(`Invalid tRPC path: ${path}`);
  }
  
  const [namespace, procedure] = splitPath;
  return getCallerProcedure<TInput, TOutput>(caller, namespace, procedure)(input);
}