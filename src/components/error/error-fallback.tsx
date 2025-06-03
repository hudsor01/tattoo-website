'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Props for the error fallback UI component
 */
export interface ErrorFallbackProps {
  /** The error that was caught */
  error: Error;
  /** Function to call to reset the error boundary */
  resetErrorBoundary?: () => void;
  /** Title to display in the error UI */
  title?: string;
  /** Description to display in the error UI */
  description?: string;
  /** Label for the retry button */
  retryLabel?: string;
  /** Whether to show technical details */
  showDetails?: boolean;
  /** Type of error UI to display */
  variant?: 'card' | 'alert' | 'simple';
  /** Whether this is a full page error */
  fullPage?: boolean;
  /** Additional class names */
  className?: string;
  /** Whether to show a go back button */
  showBackButton?: boolean;
  /** Error event ID for tracking */
  eventId?: string | undefined;
  /** Whether to show contact support link */
  showContact?: boolean;
}

/**
 * Function to extract a readable error message from different error types
 */
export function getErrorMessage(error: unknown): string {
  // Handle tRPC client errors
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    if ('shape' in error && typeof error.shape === 'object' && error.shape !== null) {
      // This is likely a tRPC error with additional context
      return error.message;
    }
    return error.message;
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred';
}

/**
 * A reusable error fallback UI component
 *
 * This component provides a consistent UI for displaying errors
 * with options for different variants and customization.
 *
 * @example
 * ```tsx
 * <ErrorFallback
 *   error={error}
 *   resetErrorBoundary={() => window.location.reload()}
 *   title="Failed to load data"
 *   description="We couldn't load the requested data"
 *   variant="card"
 *   fullPage={true}
 *   showBackButton={true}
 * />
 * ```
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  description = 'There was a problem with this request',
  retryLabel = 'Try again',
  showDetails: initialShowDetails = false,
  variant = 'card',
  fullPage = false,
  className = '',
  showBackButton = false,
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(initialShowDetails);
  const errorMessage = getErrorMessage(error);

  const handleReset = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  // Simple inline error display
  if (variant === 'simple') {
    return (
      <div
        className={`p-4 border border-red-200 rounded-md bg-red-50@light bg-red-900/20@dark ${className}`}
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <p className="font-medium text-red-700@light text-red-400@dark">{title}</p>
        </div>
        <p className="text-sm text-red-600@light text-red-300@dark mb-3">{errorMessage}</p>
        <div className="flex gap-2">
          {resetErrorBoundary && (
            <Button size="sm" variant="outline" onClick={handleReset}>
              <Icons.refresh className="h-3 w-3 mr-1" />
              {retryLabel}
            </Button>
          )}
          {showBackButton && (
            <Button size="sm" variant="ghost" onClick={handleGoBack}>
              Go back
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Alert variant (more compact than card)
  if (variant === 'alert') {
    return (
      <Alert variant="destructive" className={`my-4 ${className}`}>
        <Icons.warning className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <p className="mb-2">{errorMessage}</p>
          <div className="flex gap-2 mt-2">
            {resetErrorBoundary && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <Icons.refresh className="h-3 w-3 mr-1" />
                {retryLabel}
              </Button>
            )}
            {showBackButton && (
              <Button variant="ghost" size="sm" onClick={handleGoBack}>
                Go back
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Default card variant
  return (
    <Card className={`w-full ${fullPage ? 'max-w-md mx-auto mt-8' : ''} ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icons.warning className="h-5 w-5 text-destructive mr-2" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{errorMessage}</p>

        {/* Expandable error details */}
        <div>
          <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide' : 'Show'} technical details
          </Button>

          {showDetails && (
            <pre className="mt-4 p-4 bg-muted text-muted-foreground overflow-auto rounded-md text-xs">
              {error.stack ?? error.message}
            </pre>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {showBackButton && (
          <Button variant="outline" onClick={handleGoBack}>
            Go Back
          </Button>
        )}
        <Button onClick={handleReset} className={showBackButton ? '' : 'ml-auto'}>
          <Icons.refresh className="h-4 w-4 mr-2" />
          {retryLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
