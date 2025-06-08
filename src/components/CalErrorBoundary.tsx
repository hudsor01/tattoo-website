/**
 * Cal Error Boundary - Prevents Cal.com errors from breaking the app
 */

'use client';

import React from 'react';
import { logger } from '@/lib/logger';

interface CalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface CalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class CalErrorBoundary extends React.Component<CalErrorBoundaryProps, CalErrorBoundaryState> {
  constructor(props: CalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
}

  static getDerivedStateFromError(error: Error): CalErrorBoundaryState {
    return { hasError: true, error };
}

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    void logger.error('Cal.com Error Boundary caught an error:', { error, errorInfo });
    
    // Report specific Cal.com related errors
    if (error.message.includes('Cal') || error.stack?.includes('embed.js')) {
      void logger.warn('Cal.com embed error detected, gracefully handling');
    }
}

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
            Booking system temporarily unavailable. Please try refreshing the page.
            </p>
        </div>
        );
    }

    return this.props.children;
    }
}

// Hook to wrap Cal operations safely
export function useCalSafe<T>(operation: () => T, fallback: T): T {
  try {
    return operation();
    } catch (error) {
    void logger.warn('Cal operation failed safely:', error);
    return fallback;
    }
}
