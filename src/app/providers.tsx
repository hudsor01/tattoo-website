'use client';

import { type ReactNode } from 'react';
import { TrpcClientProvider } from '@/components/providers/TRPCProvider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';

interface ProvidersProps {
  children: ReactNode;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}

/**
 * Application providers (excluding Clerk which is in root layout)
 * 
 * Includes:
 * - tRPC for API calls
 * - Theme management
 * - Toast notifications
 */
export default function Providers({ children, cookies, headers }: ProvidersProps) {
  return (
    <TrpcClientProvider cookies={cookies} headers={headers}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="dark" 
        enableSystem 
        disableTransitionOnChange
      >
        <Toaster 
          position="bottom-right" 
          closeButton
          richColors
          theme="system" 
          className="z-[9999]"
        />
        <AnalyticsProvider />
        {children}
      </ThemeProvider>
    </TrpcClientProvider>
  );
}