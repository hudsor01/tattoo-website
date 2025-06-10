/**
* Application Providers - Enhanced with Cal.com Integration
*
* Purpose: Central provider setup for all application services
* 
* Trade-offs:
* - Provider nesting vs performance: Organization vs overhead
* - Global state vs local state: Consistency vs flexibility
* - Error boundaries vs simple setup: Robustness vs complexity
*/
'use client';

import React, { memo } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { ClientOnly } from '@/components/ClientOnly';
import { LazyMotionProvider } from '@/components/performance/LazyMotion';
import { CSRFProvider } from '@/components/providers/CSRFProvider';
import { CalEmbedProvider } from '@/components/providers/CalEmbedProvider';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: React.ReactNode;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}

/**
 * Application providers
 *
 * Includes:
 * - TanStack Query for API calls
 * - Cal.com for booking functionality
 * - Theme management
 * - Toast notifications
 * - Analytics tracking
 * - Performance optimizations
 */
// Memoized error fallback component
const ErrorFallback = memo(() => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-2">Application Error</h1>
      <p className="text-muted-foreground mb-4">
        Something went wrong. Please refresh the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Refresh Page
      </button>
    </div>
  </div>
));

ErrorFallback.displayName = 'ErrorFallback';

// Memoized toaster component
const MemoizedToaster = memo(() => (
  <Toaster 
    position="bottom-right" 
    expand={false} 
    richColors 
    closeButton
    duration={4000}
  />
));

MemoizedToaster.displayName = 'MemoizedToaster';

function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error) => {
        console.error('Application provider error:', error);
      }}
    >
      <QueryProvider>
        <CSRFProvider>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="dark" 
            enableSystem 
            disableTransitionOnChange
          >
            <LazyMotionProvider>
              <CalEmbedProvider>
                {children}
              </CalEmbedProvider>
            </LazyMotionProvider>

            <ClientOnly>
              <MemoizedToaster />
            </ClientOnly>
          </ThemeProvider>
        </CSRFProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default memo(Providers);
