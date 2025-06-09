'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

interface CSRFContextValue {
  token: string | null;
  isLoading: boolean;
  refreshToken: () => Promise<void>;
}

const CSRFContext = createContext<CSRFContextValue>({
  token: null,
  isLoading: true,
  refreshToken: async () => {},
});

/**
 * CSRF Provider Component
 * 
 * Provides CSRF token to forms and handles token refresh
 */
export function CSRFProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchToken = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
      } else {
        void logger.error('Failed to fetch CSRF token:', response.status);
      }
    } catch (error) {
      void logger.error('Error fetching CSRF token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    await fetchToken();
  };

  useEffect(() => {
    void fetchToken();
  }, []);

  return (
    <CSRFContext.Provider value={{ token, isLoading, refreshToken }}>
      {children}
    </CSRFContext.Provider>
  );
}

/**
 * Hook to access CSRF token
 */
export function useCSRF(): CSRFContextValue {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRF must be used within a CSRFProvider');
  }
  return context;
}

/**
 * CSRF Hidden Input Component
 * 
 * Renders a hidden input field with the CSRF token
 */
export function CSRFInput() {
  const { token, isLoading } = useCSRF();

  if (isLoading || !token) {
    return null;
  }

  return (
    <input
      type="hidden"
      name="_csrf_token"
      value={token}
      aria-hidden="true"
    />
  );
}