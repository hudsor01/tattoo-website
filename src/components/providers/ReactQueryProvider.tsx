'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


/**
 * Props for the ReactQueryProvider component
 */
interface ReactQueryProviderProps {
  children: React.ReactNode;
}

// Configure default options for the query client
const defaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
    retry: 1,
  },
};

/**
 * Creates a new QueryClient with optimized default options
 * Using a function ensures each request gets a fresh instance for SSR
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions,
  });
}

/**
 * A provider component that wraps the app with react-query's QueryClientProvider
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Create a new query client for each request in SSR
  // In client-side rendering, use a ref to maintain the same client
  const [queryClient] = React.useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
