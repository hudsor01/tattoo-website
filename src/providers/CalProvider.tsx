/**
 * Cal.com Provider - Defensive Implementation
 * 
 * Purpose: Global Cal.com provider with robust error handling
 * Approach: Graceful degradation when Cal.com embed fails
 * Fallback: Direct booking links always work
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from "@/lib/logger";

// Cal.com window interface extension
declare global {
  interface Window {
    Cal?: {
      (action: string, options?: any): void;
      ns?: {
        [key: string]: (action: string, options?: any) => void;
      };
    };
  }
}

// Cal.com types - self-contained for this provider
type CalContextType = {
  isInitialized: boolean;
  error: string | null;
  mode: 'embed' | 'fallback' | 'loading' | 'error';
  retryInitialization: () => void;
  isEmbedAvailable: boolean;
};

type CalProviderProps = {
  children: React.ReactNode;
};

// Cal.com Configuration
const CAL_CONFIG = {
  username: process.env['NEXT_PUBLIC_CAL_USERNAME'] ?? 'ink37tattoos',
  baseUrl: 'https://cal.com',
  embedUrl: 'https://app.cal.com/embed/embed.js',
} as const;

const CalContext = createContext<CalContextType>({
  isInitialized: false,
  error: null,
  mode: 'loading',
  retryInitialization: () => {},
  isEmbedAvailable: false,
});

export const useCalContext = () => useContext(CalContext);

export function CalProvider({ children }: CalProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'embed' | 'fallback' | 'loading' | 'error'>('loading');
  const [isEmbedAvailable, setIsEmbedAvailable] = useState(false);
  const { toast } = useToast();

  const initializeCal = useCallback(async () => {
    // Always allow fallback mode immediately
    setIsInitialized(true);
    setMode('fallback');
    setError(null);

    // Skip Cal.com embed in test environments or when running tests
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.navigator.userAgent.includes('HeadlessChrome') ||
         window.navigator.userAgent.includes('Playwright') ||
         process.env.NODE_ENV === 'test')) {
      void logger.info('Skipping Cal.com embed in test/development environment');
      return;
    }

    try {
      if (typeof window === 'undefined') return;

      // Check if Cal embed is already loaded and working
      if (window.Cal && typeof window.Cal === 'function') {
        void logger.info('Cal.com embed already available');
        setIsEmbedAvailable(true);
        setMode('embed');
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector(`script[src="${CAL_CONFIG.embedUrl}"]`);
      
      if (existingScript) {
        // Script exists but Cal might not be ready yet
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkCal = () => {
          attempts++;
          if (window.Cal && typeof window.Cal === 'function') {
            void logger.info('Cal.com embed ready after waiting');
            setIsEmbedAvailable(true);
            setMode('embed');
            return;
          }
          
          if (attempts < maxAttempts) {
            setTimeout(checkCal, 200);
          } else {
            void logger.warn('Cal.com embed script loaded but Cal object not available');
            // Stay in fallback mode
          }
        };
        
        checkCal();
        return;
      }

      // Load Cal.com embed script with timeout
      const script = document.createElement('script');
      script.src = CAL_CONFIG.embedUrl;
      script.async = true;
      
      const scriptPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          void logger.warn('Cal.com embed script loading timed out');
          reject(new Error('Script loading timeout'));
        }, 10000); // 10 second timeout

        script.onload = () => {
          clearTimeout(timeout);
          void logger.info('Cal.com embed script loaded');
          
          // Wait for Cal to be available
          let attempts = 0;
          const maxAttempts = 20;
          
          const checkCal = () => {
            attempts++;
            if (window.Cal && typeof window.Cal === 'function') {
              try {
                // Test Cal initialization
                window.Cal('init', { origin: 'https://cal.com' });
                void logger.info('Cal.com embed initialized successfully');
                setIsEmbedAvailable(true);
                setMode('embed');
                resolve();
              } catch (calError) {
                void logger.error('Cal.com init failed:', calError);
                reject(calError);
              }
            } else if (attempts < maxAttempts) {
              setTimeout(checkCal, 100);
            } else {
              void logger.warn('Cal object not available after script load');
              reject(new Error('Cal object not found'));
            }
          };
          
          checkCal();
        };
        
        script.onerror = () => {
          clearTimeout(timeout);
          void logger.error('Failed to load Cal.com embed script');
          reject(new Error('Failed to load Cal.com embed script'));
        };
      });

      document.head.appendChild(script);
      await scriptPromise;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      void logger.warn('Cal.com embed initialization failed, using fallback:', errorMessage);
      setError(errorMessage);
      
      // Don't show error toast unless it's a critical issue
      if (!errorMessage.includes('timeout') && !errorMessage.includes('not found')) {
        toast({
          title: 'Booking System Info',
          description: 'Using direct booking links for better compatibility.',
          variant: 'default',
        });
      }
      
      // Always stay in fallback mode which works perfectly
      setMode('fallback');
    }
  }, [toast]);

  useEffect(() => {
    void initializeCal();
  }, [initializeCal]);

  const contextValue: CalContextType = {
    isInitialized,
    error,
    mode,
    retryInitialization: () => void initializeCal(),
    isEmbedAvailable,
  };

  return (
    <CalContext.Provider value={contextValue}>
      {children}
    </CalContext.Provider>
  );
}

// Hook for booking functionality (No OAuth Required)
export function useCalBooking() {
  const { isInitialized, error, mode, isEmbedAvailable } = useCalContext();
  
  const createBookingLink = (eventSlug: string, prefill?: Record<string, string>) => {
    const baseUrl = `https://cal.com/${CAL_CONFIG.username}/${eventSlug}`;
    
    if (!prefill || Object.keys(prefill).length === 0) {
      return baseUrl;
    }
    
    const params = new URLSearchParams(prefill);
    return `${baseUrl}?${params.toString()}`;
  };
  
  const openBookingPopup = (eventSlug: string, prefill?: Record<string, string>) => {
    const url = createBookingLink(eventSlug, prefill);
    const popup = window.open(url, '_blank', 'width=800,height=700,scrollbars=yes,resizable=yes');
    
    if (!popup) {
      void logger.warn('Popup blocked, opening in same tab');
      window.open(url, '_blank');
    }
  };

  const embedBooking = (elementId: string, eventSlug: string, config?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && isEmbedAvailable && window.Cal) {
      try {
        window.Cal('inline', {
          elementOrSelector: `#${elementId}`,
          calLink: `${CAL_CONFIG.username}/${eventSlug}`,
          config: {
            theme: 'dark',
            hideEventTypeDetails: false,
            layout: 'month_view',
            ...config,
          }
        });
        void logger.info(`Cal.com embed initialized for ${eventSlug}`);
      } catch (embedError) {
        void logger.error('Cal.com embed error, falling back to iframe:', embedError);
        createIframeFallback(elementId, eventSlug);
      }
    } else {
      void logger.info(`Using iframe fallback for ${eventSlug}`);
      createIframeFallback(elementId, eventSlug);
    }
  };

  const createIframeFallback = (elementId: string, eventSlug: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '';
      
      const iframe = document.createElement('iframe');
      iframe.src = createBookingLink(eventSlug);
      iframe.width = '100%';
      iframe.height = '600px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.allow = 'camera; microphone; geolocation';
      iframe.loading = 'lazy';
      element.appendChild(iframe);
    }
  };
  
  return {
    isInitialized,
    error,
    mode,
    isEmbedAvailable,
    createBookingLink,
    openBookingPopup,
    embedBooking,
  };
}
