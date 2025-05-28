/**
 * Modern Error Boundary with React 19 patterns
 * Provides comprehensive error handling with fallback UI and recovery options
 */
'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, Home, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showErrorDetails?: boolean;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      eventId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.warn('Error Boundary: End of error details');
    }

    // In production, you would send this to your error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  override componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.children !== this.props.children) {
      // Error just occurred
      return;
    }

    if (hasError && (resetOnPropsChange || resetKeys)) {
      if (resetOnPropsChange) {
        // Reset on any prop change
        this.resetErrorBoundary();
      } else if (resetKeys) {
        // Reset when specific keys change
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => prevProps.resetKeys?.[index] !== key
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  override componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.handleGoHome();
    }
  };

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription>
                  {this.state.error?.message ?? 'An unexpected error occurred'}
                  {this.state.eventId && (
                    <div className="mt-2 text-xs font-mono text-gray-500">
                      Error ID: {this.state.eventId}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {this.props.showErrorDetails && process.env.NODE_ENV === 'development' && (
                <details className="bg-gray-100 p-4 rounded-md">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Technical Details (Development Only)
                  </summary>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
                    {this.state.error?.stack}
                  </pre>
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-4">
                      <div className="font-medium text-gray-700 mb-2">Component Stack:</div>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoBack}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                If this problem persists, please contact support with the error ID above.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Admin-specific error boundary with admin-focused fallback
 */
export function AdminErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      showErrorDetails={process.env.NODE_ENV === 'development'}
      fallback={
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Admin Panel Error</AlertTitle>
            <AlertDescription>
              The admin panel encountered an error. Please refresh the page or contact support.
            </AlertDescription>
          </Alert>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('Admin Error:', error, errorInfo);
        // In production, send to admin error tracking
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Gallery-specific error boundary with gallery-focused fallback
 */
export function GalleryErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Gallery Unavailable</h3>
          <p className="text-gray-600 mb-4">
            We're having trouble loading the gallery. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Gallery
          </Button>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('Gallery Error:', error, errorInfo);
        // Track gallery-specific errors
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Payment-specific error boundary
 */
export function PaymentErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Payment System Error</AlertTitle>
            <AlertDescription>
              There was an issue with the payment system. Your data is safe. Please try again or
              contact support.
            </AlertDescription>
          </Alert>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('Payment Error:', error, errorInfo);
        // Critical: Send payment errors to monitoring immediately
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
