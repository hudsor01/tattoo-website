/**
 * tRPC Type Exports
 * 
 * This file provides type definitions for tRPC inputs and outputs
 * to be used throughout the application.
 */
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@/lib/trpc/app-router';

// Define the router input/output types
// These are used throughout the application for type-safe API calls
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
