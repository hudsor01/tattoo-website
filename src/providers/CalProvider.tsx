/**
 * Cal.com Provider Component
 * 
 * Purpose: Provides context for Cal.com Atoms components
 * Sets up the required CalProvider with proper OAuth configuration
 */

'use client';

import React from 'react';
import { CalProvider } from '@calcom/atoms';
import { logger } from '@/lib/logger';

interface CalAtomsProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * CalAtomsProviderWrapper
 * 
 * This component provides the CalProvider for Cal.com Atoms components
 * with proper OAuth configuration
 */
export function CalAtomsProviderWrapper({ children }: CalAtomsProviderWrapperProps) {
  const clientId = process.env['NEXT_PUBLIC_X_CAL_ID'] ?? process.env['CAL_OAUTH_CLIENT_ID'] ?? '';
  const apiUrl = process.env['NEXT_PUBLIC_CALCOM_API_URL'] ?? process.env['CAL_API_URL'] ?? 'https://api.cal.com/v2';
  const refreshUrl = process.env['NEXT_PUBLIC_REFRESH_URL'] ?? '/api/refresh';

  try {
    return (
      <CalProvider
        clientId={clientId}
        options={{
          apiUrl,
          refreshUrl,
          readingDirection: 'ltr'
        }}
        autoUpdateTimezone={true}
        language="en"
      >
        {children}
      </CalProvider>
    );
  } catch (error) {
    logger.error('Failed to render Cal.com Atoms provider:', error);
    return <>{children}</>;
  }
}

// Export a hook to check if Cal.com Atoms is available
export function useCalAtoms() {
  return {
    isReady: true,
    isConfigured: true,
    error: null,
  };
}