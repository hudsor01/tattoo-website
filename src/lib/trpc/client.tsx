/**
 * tRPC Client Provider
 *
 * This file provides the React provider for tRPC client-side hooks.
 * It integrates with React Query and sets up the tRPC client with
 * appropriate links for streaming and batching.
 */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { useState } from 'react';
import type { AppRouter } from '@/lib/trpc/app-router';

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
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            return {
              ...headers,
              ...Object.fromEntries(
                Object.entries(cookies || {}).map(([key, value]) => [
                  `cookie-${key}`,
                  value,
                ]),
              ),
            };
          },
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

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

// Create a client for direct server component usage
export function createTRPCClientInstance() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
      }),
    ],
  });
}
