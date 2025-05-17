/**
 * tRPC Type Exports
 * 
 * This file provides type definitions for tRPC inputs and outputs
 * to be used throughout the application.
 */
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from './routers';
import type { RouterInputs, RouterOutputs } from '@/types/trpc-types';

// Re-export the types from the types directory
export type { RouterInputs, RouterOutputs };

// Update the types in the types directory
// This is done at runtime to ensure the types are up-to-date
type InferredRouterInputs = inferRouterInputs<AppRouter>;
type InferredRouterOutputs = inferRouterOutputs<AppRouter>;

// These types will be picked up by TypeScript for type checking
// but won't be included in the JavaScript output
declare module '@/types/trpc-types' {
  type RouterInputs = InferredRouterInputs
  type RouterOutputs = InferredRouterOutputs
}
