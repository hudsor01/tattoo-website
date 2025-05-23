'use client';

import { type ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { TrpcClientProvider } from '@/components/providers/TRPCProvider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers with Clerk authentication
 * 
 * Includes:
 * - Clerk for authentication
 * - tRPC for API calls
 * - Theme management
 * - Toast notifications
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#dc2626', // Red theme for tattoo branding
          colorBackground: '#000000',
          colorText: '#ffffff',
        },
        elements: {
          card: 'bg-zinc-900 border-zinc-800',
          headerTitle: 'text-white',
          headerSubtitle: 'text-zinc-400',
          socialButtonsBlockButton: 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700',
          formButtonPrimary: 'bg-red-600 hover:bg-red-700',
          footerActionLink: 'text-red-500 hover:text-red-400',
        },
      }}
    >
      <TrpcClientProvider>
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
          {children}
        </ThemeProvider>
      </TrpcClientProvider>
    </ClerkProvider>
  );
}