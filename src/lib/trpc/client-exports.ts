/**
 * Client-only tRPC Exports
 * 
 * This file provides direct exports of client-side tRPC functionalities.
 * These exports are only used in client components.
 */

// Client-side hooks and utilities
export { trpc, TRPCProvider, createTRPCClientInstance } from './client';

// Export input/output types for client usage
export type { AppRouter } from './api-router';
export type { RouterInputs, RouterOutputs } from './types';