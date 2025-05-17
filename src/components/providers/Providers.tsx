/**
 * Providers Component
 *
 * Wraps the application with all required providers:
 * - TrpcClientProvider: For tRPC API access
 * - ThemeProvider: For theme configuration
 * - AuthProvider: For authentication state
 * - ToastProvider: For notifications
 */
'use client';

import { ReactNode } from 'react';
import { TrpcClientProvider } from './TrpcProvider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { PageViewTracker } from '@/components/PageViewTracker';
import { AnalyticsProvider } from './AnalyticsProvider';
import { IntegratedThemeProvider } from '@/components/theme/integrated-theme-provider';
import { AuthInitializer } from '@/components/auth/auth-initializer';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TrpcClientProvider>
      {/* Theme provider from next-themes */}
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        {/* Authentication initializer */}
        <AuthInitializer />
        
        {/* Integrated Material UI + Tailwind provider */}
        <IntegratedThemeProvider>
          {/* Analytics tracking provider */}
          <AnalyticsProvider>
            {/* Track page views */}
            <PageViewTracker />

            {/* Toast notifications - positioned for good UX */}
            <Toaster 
              position="bottom-right" 
              closeButton
              richColors
              theme="system"
              className="z-[9999]"
            />

            {/* App content */}
            {children}
          </AnalyticsProvider>
        </IntegratedThemeProvider>
      </ThemeProvider>
    </TrpcClientProvider>
  );
}
