/**
 * Enhanced Error Boundary Component
 * 
 * Purpose: Provide graceful error handling with recovery options
 * Features: Error logging, retry mechanism, fallback UI
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    
    // Log the error
    logger.error(`Error caught by ${level} error boundary:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level,
      errorCount: this.state.errorCount + 1,
    });

    // Update state with error details
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    onError?.(error, errorInfo);

    // Auto-retry after 5 seconds for the first error
    if (this.state.errorCount === 0) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetErrorBoundary();
      }, 5000);
    }
  }

  override componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    // Reset on prop changes if enabled
    if (hasError && prevProps.children !== this.props.children && resetOnPropsChange) {
      this.resetErrorBoundary();
    }
    
    // Reset on resetKeys change
    if (hasError && resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, idx) => key !== this.previousResetKeys[idx]);
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
    
    this.previousResetKeys = resetKeys ?? [];
  }

  override componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }
    
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  override render() {
    const { hasError, error, errorCount } = this.state;
    const { children, fallback, isolate, level = 'component' } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI based on level
      const isPageLevel = level === 'page';
      const isSectionLevel = level === 'section';

      return (
        <div className={`
          ${isPageLevel ? 'min-h-screen' : ''}
          ${isSectionLevel ? 'min-h-[400px]' : 'min-h-[200px]'}
          flex items-center justify-center p-4
          ${isolate ? 'bg-background/50 backdrop-blur-sm rounded-lg' : ''}
        `}>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>
                {isPageLevel ? 'Page Error' : isSectionLevel ? 'Section Error' : 'Something went wrong'}
              </CardTitle>
              <CardDescription>
                {errorCount > 1 
                  ? `This error has occurred ${errorCount} times. There might be a persistent issue.`
                  : 'An unexpected error occurred. The issue has been logged.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="font-mono text-xs break-all">
                    {error.message}
                  </p>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={this.resetErrorBoundary}
                  variant="default"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                
                {isPageLevel && (
                  <Button 
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="w-full"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Go to Homepage
                  </Button>
                )}
              </div>
              
              {/* Auto-retry message */}
              {errorCount === 1 && (
                <p className="text-xs text-center text-muted-foreground">
                  Attempting automatic recovery in 5 seconds...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// Hook for using error boundary imperatively
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    throwError: (error: Error) => setError(error),
    clearError: () => setError(null),
  };
}
