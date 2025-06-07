/**
 * Cal.com Atoms Provider Component
 * 
 * Purpose: Provides Cal.com Atoms context to the application
 * For now, this is a simplified version that provides context for the booking modal
 * without the full Cal.com Atoms integration
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface CalAtomsContextValue {
  isReady: boolean;
  accessToken: string | null;
  error: Error | null;
}

const CalAtomsContext = createContext<CalAtomsContextValue>({
  isReady: false,
  accessToken: null,
  error: null,
});

export const useCalAtomsContext = () => useContext(CalAtomsContext);

interface CalAtomsProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * CalAtomsProviderWrapper
 * 
 * This component provides Cal.com context for the booking modal
 * Simplified version without full Cal.com Atoms integration
 */
export function CalAtomsProviderWrapper({ children }: CalAtomsProviderWrapperProps) {
  const [accessToken, setAccessToken] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Get configuration from environment
  const clientId = process.env['NEXT_PUBLIC_X_CAL_ID'] ?? '';

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const initializeCalAtoms = async () => {
      try {
        // For now, we'll just set the provider as ready
        // This allows the booking modal to work without requiring full Cal.com Atoms setup
        
        // Check if we have any stored auth state
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('cal_access_token') : null;

        if (storedToken && storedToken !== 'demo-token') {
          // Use stored token if available and valid
          setAccessToken(storedToken);
          setIsReady(true);
        } else {
          // For now, just set as ready without OAuth
          logger.info('Cal.com provider initialized in simple mode');
          setAccessToken('');
          setIsReady(true);
        }
      } catch (err) {
        logger.error('Failed to initialize Cal.com provider:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setIsReady(true); // Set ready even on error to prevent infinite loading
      }
    };

    void initializeCalAtoms();
  }, [isMounted, clientId]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!isMounted) {
    return <>{children}</>;
  }

  // Always render children with context, even if not fully configured
  return (
    <CalAtomsContext.Provider value={{ isReady, accessToken, error }}>
      {children}
    </CalAtomsContext.Provider>
  );
}

// Export a hook to check if Cal.com Atoms is available
export function useCalAtoms() {
  const context = useCalAtomsContext();
  
  return {
    isReady: context.isReady,
    isConfigured: context.isReady && !context.error, // Simple check for now
    error: context.error,
  };
}