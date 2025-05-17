'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorFallback } from './error-fallback';
import { useErrorTracking } from '@/hooks/use-analytics';
import { handleError, ErrorContext, ErrorCategory } from '@/lib/error/error-handler';
import { ErrorSeverity } from '@/lib/toast/enhanced-toast';

// Props for the enhanced error boundary wrapper
export interface EnhancedErrorBoundaryProps {
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
  variant?: 'card' | 'alert' | 'simple' | 'toast';
  /** Whether to show error in toast notifications */
  showToast?: boolean;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Error category */
  category?: ErrorCategory;
  /** Whether to enable error recovery */
  canRecover?: boolean;
  /** Additional context for error handling */
  errorContext?: Omit<ErrorContext, 'component'>;
}

// State for the error boundary
interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Inner class component that implements the error boundary
class EnhancedErrorBoundaryInner extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): EnhancedErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Use custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error details
    this.setState({ error, errorInfo });

    // Create error context
    const context: ErrorContext = {
      component: this.props.componentName || 'Unknown',
      action: 'render',
      displayToUser: this.props.showToast ?? true,
      severity: this.props.severity || ErrorSeverity.HIGH,
      ...this.props.errorContext,
    };

    // Use the standard error handler
    handleError(error, context);

    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by EnhancedErrorBoundary:', error, errorInfo);
    }
  }

  render(): ReactNode {
    const { 
      children, 
      fallback, 
      title, 
      description, 
      fullPage, 
      showBackButton, 
      variant,
      canRecover,
    } = this.props;
    
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Skip rendering a fallback UI if only using toast
      if (variant === 'toast') {
        return null;
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={() => {
            if (canRecover) {
              this.setState({ hasError: false, error: undefined, errorInfo: undefined });
            }
          }}
          title={title}
          description={description}
          fullPage={fullPage}
          showBackButton={showBackButton}
          variant={variant === 'toast' ? 'simple' : variant}
          showDetails={process.env.NODE_ENV !== 'production'}
          canRecover={canRecover}
        />
      );
    }

    return children;
  }
}

/**
 * EnhancedErrorBoundary Component
 * 
 * A React error boundary that catches errors in its child component tree,
 * integrates with the standardized error handling system, and displays
 * a fallback UI instead of crashing the whole application.
 * 
 * @example
 * ```tsx
 * <EnhancedErrorBoundary
 *   componentName="UserProfile"
 *   showToast={true}
 *   severity={ErrorSeverity.HIGH}
 * >
 *   <MyComponent />
 * </EnhancedErrorBoundary>
 * ```
 */
export function EnhancedErrorBoundary({
  children,
  fallback,
  componentName,
  title = 'Something went wrong',
  description = 'We encountered an issue when displaying this content',
  fullPage = false,
  showBackButton = false,
  variant = 'card',
  showToast = true,
  severity = ErrorSeverity.HIGH,
  category,
  canRecover = true,
  errorContext,
  onError,
}: EnhancedErrorBoundaryProps): JSX.Element {
  const { handleError: trackError } = useErrorTracking();

  const handleErrorWithTracking = (error: Error, errorInfo: ErrorInfo) => {
    // Track the error using the analytics hook
    trackError(error, errorInfo.componentStack, componentName);
    
    // Call custom handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <EnhancedErrorBoundaryInner 
      fallback={fallback}
      componentName={componentName}
      onError={handleErrorWithTracking}
      title={title}
      description={description}
      fullPage={fullPage}
      showBackButton={showBackButton}
      variant={variant}
      showToast={showToast}
      severity={severity}
      category={category}
      canRecover={canRecover}
      errorContext={errorContext}
    >
      {children}
    </EnhancedErrorBoundaryInner>
  );
}

/**
 * Higher-order component to wrap components with enhanced error boundary
 * 
 * @example
 * ```tsx
 * const SafeComponent = withEnhancedErrorBoundary(UnsafeComponent, {
 *   componentName: 'UnsafeComponent',
 *   title: 'Failed to load component',
 *   severity: ErrorSeverity.MEDIUM,
 * });
 * ```
 */
export function withEnhancedErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<EnhancedErrorBoundaryProps, 'children'> = {},
): React.FC<P> {
  const { componentName = Component.displayName || Component.name } = options;

  const WithEnhancedErrorBoundary: React.FC<P> = props => (
    <EnhancedErrorBoundary {...options} componentName={componentName}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WithEnhancedErrorBoundary.displayName = `WithEnhancedErrorBoundary(${componentName})`;

  return WithEnhancedErrorBoundary;
}

// Re-export original error boundary for backward compatibility
export * from './error-boundary';
