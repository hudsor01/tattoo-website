'use client';

import { type ReactNode, useEffect } from 'react';
import { TrpcClientProvider } from '@/components/providers/TRPCProvider';
import { ThemeProvider } from 'next-themes';
import dynamic from 'next/dynamic';
import { PageViewTracker } from '@/components/PageViewTracker';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import { useAuthStore } from '@/lib/auth/auth-system';
import { createClient } from '@/lib/supabase/client';

// Dynamically import our standardized Toaster to avoid SSR issues
const Toaster = dynamic(() => import('@/components/ui/toaster').then(mod => mod.Toaster), {
  ssr: false
});

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers component
 * 
 * A consolidated provider system that eliminates redundancies:
 * - Single authentication system
 * - Unified theme management
 * - Proper provider hierarchy
 */
export default function Providers({ children }: ProvidersProps) {
  const { refreshUser, initialized } = useAuthStore();
  
  // Initialize authentication
  useEffect(() => {
    if (!initialized) {
      // Skip auth initialization if Supabase is not configured
      if (!process.env['NEXT_PUBLIC_SUPABASE_URL'] || 
          process.env['NEXT_PUBLIC_SUPABASE_URL'] === 'NEXT_PUBLIC_SUPABASE_URL') {
        return undefined;
      }
      
      // Set up auth state
      refreshUser();
      
      // Set up auth listener
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          const store = useAuthStore.getState();
          
          store.setUser(session?.user || null);
          store.setSession(session);
          
          if (session?.user) {
            // Check if user is admin by querying the User table
            const userId = session.user.id;
            const { data } = await supabase
              .from('User')
              .select('role')
              .eq('id', userId)
              .single();
              
            // Set admin flag if user has admin role
            store.setIsAdmin(data?.role === 'admin');
          } else {
            store.setIsAdmin(false);
          }
        }
      );
      
      // Clean up subscription on unmount
      return () => subscription.unsubscribe();
    }
    
    return undefined; // Explicit return for when initialized is true
  }, [initialized, refreshUser]);
  
  return (
    <TrpcClientProvider>
      {/* Theme provider from next-themes */}
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
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
      </ThemeProvider>
    </TrpcClientProvider>
  );
}