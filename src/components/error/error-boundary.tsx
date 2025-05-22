'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorFallback } from './error-fallback';

// Props for the error boundary wrapper
export interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Custom fallback component or element to render when an error occurs */
  fallback?: ReactNode;
  /** Component name for error tracking */
  componentName?: string;
  /** Error title */
  title?: string;
  /** Error description */
  description?: string;
  /** Custom error handler function */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to display as a full page error */
  fullPage?: boolean;
  /** Whether to show a go back button */
  showBackButton?: boolean;
  /** Variant of error UI to display */
  variant?: 'card' | 'alert' | 'simple';
}

// State for the error boundary
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: ErrorInfo | null;
}

// Inner class component props with required children property
interface ErrorBoundaryInnerProps {
  children: ReactNode;
  fallback?: ReactNode;
  componentName: string; 
  title: string;
  description: string;
  fullPage: boolean;
  showBackButton: boolean;
  variant: 'card' | 'alert' | 'simple';
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// Inner class component that implements the error boundary
class ErrorBoundaryInner extends Component<ErrorBoundaryInnerProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Use custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error details
    this.setState({ error, errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
  }

  override render(): ReactNode {
    const { 
      children, 
      fallback, 
      title, 
      description, 
      fullPage, 
      showBackButton, 
      variant 
    } = this.props;
    
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={() => {
            this.setState({ hasError: false, error: null, errorInfo: null });
          }}
          title={title}
          description={description}
          fullPage={fullPage}
          showBackButton={showBackButton}
          variant={variant}
          showDetails={process.env.NODE_ENV !== 'production'}
        />
      );
    }

    return children;
  }
}

/**
 * ErrorBoundary Component
 * 
 * A React error boundary that catches errors in its child component tree and
 * displays a fallback UI instead of crashing the whole application.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export function ErrorBoundary({
  children,
  fallback,
  componentName = 'UnnamedComponent',
  title = 'Something went wrong',
  description = 'We encountered an issue when displaying this content',
  fullPage = false,
  showBackButton = false,
  variant = 'card',
  onError,
}: ErrorBoundaryProps): React.JSX.Element {
  return (
    <ErrorBoundaryInner 
      fallback={fallback}
      componentName={componentName}
      onError={onError}
      title={title}
      description={description}
      fullPage={fullPage}
      showBackButton={showBackButton}
      variant={variant}
    >
      {children}
    </ErrorBoundaryInner>
  );
}

/**
 * Higher-order component to wrap components with error boundary
 * 
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(UnsafeComponent, {
 *   componentName: 'UnsafeComponent',
 *   title: 'Failed to load component'
 * });
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ErrorBoundaryProps, 'children'> = {},
): React.FC<P> {
  const { componentName = Component.displayName || Component.name } = options;

  const WithErrorBoundary: React.FC<P> = props => (
    <ErrorBoundary {...options} componentName={componentName}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${componentName})`;

  return WithErrorBoundary;
}