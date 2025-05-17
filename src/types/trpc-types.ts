/**
 * trpc-types.ts
 *
 * Type definitions for tRPC functionality including router inputs, outputs,
 * and context definitions.
 */

// This type may be needed by modules importing from here
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { PrismaClient } from '@prisma/client';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Context object passed to all tRPC procedures
 */
export interface Context {
  prisma: PrismaClient;
  req: Request;
  headers: Headers;
  supabase: SupabaseClient;
  user: unknown | null; // TODO: Replace with proper User type
}

/**
 * Creates tRPC context type from createContext function return value
 * This is designed to be imported from lib/trpc-context.ts
 */
export type CreateContextReturn = Context;

/**
 * tRPC router input types
 * To be populated by the AppRouter after definition
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
export interface RouterInputs {}

/**
 * tRPC router output types
 * To be populated by the AppRouter after definition
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
export interface RouterOutputs {}