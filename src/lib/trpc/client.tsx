/**
 * tRPC Client Provider
 *
 * This file provides the React provider for tRPC client-side hooks.
 * It integrates with React Query and sets up the tRPC client with
 * appropriate links for streaming and batching.
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchStreamLink, loggerLink, createTRPCClient } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';
import superjson from 'superjson';
// Only import the type, not the implementation
import type { AppRouter } from './api-router';

// Create a tRPC React client with strict typing based on AppRouter
export const trpc = createTRPCReact<AppRouter>();
export const api = trpc;

// Cache times (in milliseconds)
const FIVE_MINUTES = 1000 * 60 * 5;

// TRPCProvider component to wrap your application
export function TRPCProvider({
  children,
  cookies,
  headers = {},
}: {
  children: React.ReactNode;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: FIVE_MINUTES,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
            gcTime: FIVE_MINUTES,
          },
          mutations: {
            retry: 1,
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: opts =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchStreamLink({
          url: `${process.env['NEXT_PUBLIC_BASE_URL'] || ''}/api/trpc`,
          maxURLLength: 2083,
          headers() {
            return {
              ...headers,
              ...(cookies && {
                cookie: Object.entries(cookies)
                  .map(([key, value]) => `${key}=${value}`)
                  .join('; '),
              }),
            };
          },
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// Create a client for direct server component usage
export function createTRPCClientInstance() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchStreamLink({
        url: `${process.env['NEXT_PUBLIC_BASE_URL'] || ''}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });
}
