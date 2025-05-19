/**
 * Client-side tRPC utilities
 * 
 * This file provides a consistent way to import tRPC hooks and utilities
 * throughout the client-side codebase.
 *
 * This is a centralized re-export file that makes imports consistent across the app.
 */

// Re-export all client-side utilities from the consolidated implementation
export * from '@/lib/trpc/client-exports';
// Alias createTRPCClientInstance to createTRPCClient for backward compatibility
export { createTRPCClientInstance as createTRPCClient } from '@/lib/trpc/client-exports';

// Re-export utility types for easier access
export type {
  RouterInputs,
  RouterOutputs
} from '@/types/api-types';
