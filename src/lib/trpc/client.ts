/**
 * tRPC Client
 * 
 * This file creates and exports the tRPC client for use in React components.
 * It imports the AppRouter type from api-router.ts, which is the client-safe
 * version that doesn't trigger server-only module errors.
 * 
 * For all tRPC-related types, import from '@/types/trpc-types.ts'
 * 
 * IMPORTANT: This is the single source of truth for tRPC client creation.
 * The client provider (client-provider.tsx) imports from this file.
 */
import { httpLink, createTRPCClient } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import type { AppRouter } from './api-router';
import { getBaseUrl } from './utils';

// Create the tRPC React client with full type safety
export const trpc = createTRPCReact<AppRouter>();
export const api = trpc; // Export alias for compatibility

// Re-export getBaseUrl for backwards compatibility
export { getBaseUrl } from './utils';

// Create a client for direct use (outside of React components)
export function createTRPCClientInstance() {
  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });
}
