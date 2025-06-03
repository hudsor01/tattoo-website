/**
 * tRPC Client Provider
 *
 * This file provides the React provider for tRPC client-side hooks.
 * It integrates with React Query and sets up the tRPC client.
 * 
 * IMPORTANT: This file imports the tRPC client from client.ts,
 * which is the single source of truth for tRPC client creation.
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from './client';
import { getBaseUrl } from './utils';

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
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            return {
              ...headers,
              ...Object.fromEntries(
                Object.entries(cookies ?? {}).map(([key, value]) => [`cookie-${key}`, value])
              ),
            };
          },
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
