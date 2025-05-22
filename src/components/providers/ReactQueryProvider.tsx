'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import type { AppRouter } from '@/lib/trpc/api-router';

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

/**
 * Props for the ReactQueryProvider component
 */
interface ReactQueryProviderProps {
  children: React.ReactNode;
}

// Configure default options for the query client
const defaultOptions = {
  queries: {
    refetchOnWindowFocus: false, // Disable refetching on window focus by default
    staleTime: 1000 * 60, // 1 minute by default
    retry: 1, // Only retry once by default
  },
};

/**
 * Create a new QueryClient with default options
 * Using a function ensures each request gets a fresh instance
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions,
  });
}

/**
 * A provider component that wraps the app with react-query's QueryClientProvider
 * and tRPC integration
 */
export function ReactQueryProvider({
  children,
}: ReactQueryProviderProps) {
  // Create a new query client for each request in SSR
  // In client-side rendering, use a ref to maintain the same client
  const [queryClient] = React.useState(() => createQueryClient());
  
  // Create the tRPC client
  const [trpcClient] = React.useState(() => 
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env['NEXT_PUBLIC_BASE_URL'] || ''}/api/trpc`,
          transformer: superjson,
          // Optional: include credentials for same-origin requests
          headers: {
            'credentials': 'include',
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
