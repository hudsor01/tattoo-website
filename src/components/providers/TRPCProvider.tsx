/**
 * TRPC Provider Component
 * 
 * This component wraps the application with the TRPC provider,
 * enabling type-safe API access throughout the client components.
 */
'use client';

import { TRPCProvider } from '@/lib/trpc/client';

interface TrpcProviderProps {
  children: React.ReactNode;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}

/**
 * Wraps the application with the TRPC provider
 * This enables all child components to use TRPC hooks
 */
export function TrpcClientProvider({
  children,
  cookies,
  headers,
}: TrpcProviderProps) {
  return (
    <TRPCProvider cookies={cookies} headers={headers}>
      {children}
    </TRPCProvider>
  );
}
