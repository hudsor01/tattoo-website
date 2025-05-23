/**
 * tRPC Type Exports
 * 
 * This file provides type definitions for tRPC inputs and outputs
 * to be used throughout the application.
 */
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Re-export AppRouter type for client use (avoiding server-only import)
export type { AppRouter } from '@/lib/trpc/app-router';

// Define the router input/output types  
// These are used throughout the application for type-safe API calls
export type RouterInputs = inferRouterInputs<import('@/lib/trpc/app-router').AppRouter>;
export type RouterOutputs = inferRouterOutputs<import('@/lib/trpc/app-router').AppRouter>;
