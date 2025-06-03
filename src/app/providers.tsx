/**
 * Application Providers - Enhanced with Cal.com Integration
 *
 * Purpose: Central provider setup for all application services
 * Dependencies: Better Auth, tRPC, Cal.com, themes, analytics
 * 
 * Trade-offs:
 * - Provider nesting vs performance: Organization vs overhead
 * - Global state vs local state: Consistency vs flexibility
 * - Error boundaries vs simple setup: Robustness vs complexity
 */
'use client';

import { TrpcClientProvider } from '@/components/providers/TRPCProvider';
import { CalProvider } from '@/providers/CalProvider';
import { CalErrorBoundary } from '@/components/CalErrorBoundary';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import { LazyMotionProvider } from '@/components/performance/LazyMotion';
import { PWAManager } from '@/components/pwa/PWAManager';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { logger } from "@/lib/logger";

interface ProvidersProps {
  children: React.ReactNode;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
}

/**
 * Application providers
 *
 * Includes:
 * - Better Auth for authentication (direct integration)
 * - tRPC for API calls
 * - Cal.com for booking functionality
 * - Theme management
 * - Toast notifications
 * - Analytics tracking
 * - PWA functionality
 * - Performance optimizations
 */
export default function Providers({ children, cookies, headers }: ProvidersProps) {
  return (
    <>
      <ErrorBoundary
        fallback={
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
        }
        onError={(error) => {
          void logger.error('Application provider error:', error);
          // Could send to error tracking service here
        }}
      >
        <TrpcClientProvider cookies={cookies ?? {}} headers={headers ?? {}}>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="dark" 
            enableSystem 
            disableTransitionOnChange
          >
            <CalErrorBoundary>
              <CalProvider>
                <LazyMotionProvider>
                  <Toaster 
                    position="bottom-right" 
                    expand={false} 
                    richColors 
                    closeButton
                    duration={4000}
                    toastOptions={{
                      style: {
                        background: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                      },
                    }}
                  />
                  <AnalyticsProvider />
                  <PWAManager />
                  {children}
                </LazyMotionProvider>
              </CalProvider>
            </CalErrorBoundary>
          </ThemeProvider>
        </TrpcClientProvider>
      </ErrorBoundary>
    </>
  );
}
