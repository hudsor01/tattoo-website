'use client';

import React, { Component, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { ErrorFallback } from './error-fallback';
import { logger } from "@/lib/logger";
// Use direct process.env access instead of importing ENV
import { AlertTriangle, RefreshCw, Home, MessageCircle, ImageOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
// Define ErrorBoundaryState locally
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
  errorInfo?: ErrorInfo | null;
  eventId?: string | null;
}

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
  /** Whether to show technical details in development */
  showDetails?: boolean;
  /** Keys that should trigger a reset when they change */
  resetKeys?: Array<string | number>;
  /** Whether to reset on any props change */
  resetOnPropsChange?: boolean;
}

/**
 * Error Boundary Component
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
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  static defaultProps = {
    componentName: 'UnnamedComponent',
    title: 'Something went wrong',
    description: 'We encountered an issue when displaying this content',
    fullPage: false,
    showBackButton: true,
    variant: 'card',
    showDetails: process.env.NODE_ENV === 'development',
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      eventId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Use custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error details
    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env['NODE_ENV'] === 'development') {
      void logger.warn('🚨 Error Boundary Caught Error');
      void logger.error('Error:', error);
      void logger.error('Error Info:', errorInfo);
      void logger.error('Component Stack:', errorInfo.componentStack);
      void logger.warn('Error Boundary: End of error details');
    }
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (!hasError) return;

    // Skip reset if children just changed - this could be the error just occurred
    if (prevProps.children !== this.props.children) {
      return;
    }

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

  override componentWillUnmount(): void {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = (): void => {
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

  override render(): ReactNode {
    const { 
      children, 
      fallback, 
      title, 
      description, 
      fullPage, 
      showBackButton, 
      variant,
      showDetails,
    } = this.props;
    const { hasError, error, eventId } = this.state;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
          title={title ?? ''}
          description={description ?? ''}
          fullPage={fullPage ?? false}
          showBackButton={showBackButton ?? false}
          variant={variant ?? 'card'}
          showDetails={showDetails ?? false}
          eventId={eventId ?? undefined}
          showContact={false}
        />
      );
    }

    return children;
  }
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
  options: Omit<ErrorBoundaryProps, 'children'> = {}
): React.FC<P> {
  const { componentName = Component.displayName ?? Component.name } = options;

  const WithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...options} componentName={componentName}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WithErrorBoundary.displayName = `WithErrorBoundary(${componentName})`;

  return WithErrorBoundary;
}

/**
 * Admin-specific error boundary with admin-focused fallback
 */
export function AdminErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      fallback={
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Admin Panel Error</AlertTitle>
            <AlertDescription>
              The admin panel encountered an error. Please refresh the page or contact support.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        void logger.error('Admin Error:', { error, errorInfo });
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
            Reload Gallery
          </Button>
        </div>
      }
      onError={(error, errorInfo) => {
        void logger.error('Gallery Error:', { error, errorInfo });
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
        void logger.error('Payment Error:', { error, errorInfo });
        // Critical: Send payment errors to monitoring immediately
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * App Error Handler Component for Next.js App Router errors
 */
export interface ErrorHandlerProps {
  error: Error & { digest?: string };
  reset: () => void;
  variant?: 'admin' | 'gallery' | 'global' | 'default';
}

export function ErrorHandler({
  error,
  reset,
  variant = 'default',
}: ErrorHandlerProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    void logger.error(`${variant} error:`, error);
  }, [error, variant]);

  // Configure variant-specific properties
  const config = {
    admin: {
      icon: <AlertTriangle className="h-16 w-16 text-red-500" />,
      title: 'Admin Dashboard Error',
      description: 'Something went wrong in the admin dashboard. This could be a temporary issue.',
      primaryButtonText: 'Try again',
      homeButtonText: 'Dashboard',
      homeButtonLink: '/admin',
      showContact: true,
    },
    gallery: {
      icon: <ImageOff className="h-16 w-16 text-red-500" />,
      title: 'Gallery Loading Error',
      description: 'We\'re having trouble loading the tattoo gallery. This might be a temporary issue with image loading.',
      primaryButtonText: 'Reload gallery',
      homeButtonText: 'Go home',
      homeButtonLink: '/',
      showSocial: true,
      showContact: false,
    },
    global: {
      icon: <AlertTriangle className="h-16 w-16 text-red-500" />,
      title: 'Something went wrong!',
      description: 'We\'re experiencing some technical difficulties. Our team has been notified and is working on a fix.',
      primaryButtonText: 'Try again',
      homeButtonText: 'Go home',
      homeButtonLink: '/',
      showContact: true,
    },
    default: {
      icon: <AlertTriangle className="h-16 w-16 text-red-500" />,
      title: 'Oops!',
      description: 'We apologize for the inconvenience. An unexpected error has occurred.',
      primaryButtonText: 'Try again',
      homeButtonText: 'Go home',
      homeButtonLink: '/',
      showContact: false,
    },
  };

  const currentConfig = config[variant];

  // Special handling for Global error (needs full html/body)
  if (variant === 'global') {
    return (
      <html>
        <body className="font-inter bg-black text-white antialiased">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-6xl font-bold text-red-500">500</h1>
                <h2 className="text-2xl font-semibold">{currentConfig.title}</h2>
                <p className="text-zinc-400 max-w-md mx-auto">
                  {currentConfig.description}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={reset}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  {currentConfig.primaryButtonText}
                </button>

                <div className="flex justify-center space-x-4">
                  <a href={currentConfig.homeButtonLink} className="text-zinc-400 hover:text-white transition-colors underline">
                    {currentConfig.homeButtonText}
                  </a>
                  {currentConfig.showContact && (
                    <a
                      href="/contact"
                      className="text-zinc-400 hover:text-white transition-colors underline"
                    >
                      Contact support
                    </a>
                  )}
                </div>
              </div>

              {process.env['NODE_ENV'] === 'development' && error.digest && (
                <details className="text-left bg-zinc-900 p-4 rounded-lg max-w-lg mx-auto">
                  <summary className="cursor-pointer text-zinc-400 mb-2">
                    Error details (development only)
                  </summary>
                  <code className="text-xs text-red-400 block">Digest: {error.digest}</code>
                  <code className="text-xs text-red-400 block mt-2">{error.message}</code>
                </details>
              )}
            </div>
          </div>
        </body>
      </html>
    );
  }

  // Standard error UI for all other variants
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            {currentConfig.icon}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{currentConfig.title}</h1>
            <p className="text-zinc-400">
              {currentConfig.description}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{currentConfig.primaryButtonText}</span>
          </button>

          {variant === 'admin' ? (
            <div className="grid grid-cols-2 gap-3">
              <a
                href={currentConfig.homeButtonLink}
                className="flex items-center justify-center space-x-2 text-zinc-400 hover:text-white transition-colors border border-zinc-800 hover:border-zinc-600 px-4 py-2 rounded-lg"
              >
                <Home className="h-4 w-4" />
                <span>{currentConfig.homeButtonText}</span>
              </a>
              {currentConfig.showContact && (
                <a
                  href="/contact"
                  className="flex items-center justify-center space-x-2 text-zinc-400 hover:text-white transition-colors border border-zinc-800 hover:border-zinc-600 px-4 py-2 rounded-lg"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Support</span>
                </a>
              )}
            </div>
          ) : (
            <a
              href={currentConfig.homeButtonLink}
              className="flex items-center justify-center space-x-2 text-zinc-400 hover:text-white transition-colors border border-zinc-800 hover:border-zinc-600 px-4 py-3 rounded-lg w-full"
            >
              <Home className="h-4 w-4" />
              <span>{currentConfig.homeButtonText}</span>
            </a>
          )}
        </div>

        {variant === 'gallery' && (
          <div className="text-sm text-zinc-500">
            <p>You can also check out our work on social media:</p>
            <div className="flex justify-center space-x-4 mt-2">
              <a
                href="https://www.instagram.com/fennyg83/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors underline"
              >
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/fennyg83/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors underline"
              >
                TikTok
              </a>
            </div>
          </div>
        )}

        {process.env['NODE_ENV'] === 'development' && (
          <details className="text-left bg-zinc-900 p-4 rounded-lg">
            <summary className="cursor-pointer text-zinc-400 mb-2">
              Error details (development only)
            </summary>
            <div className="space-y-2">
              <code className="text-xs text-red-400 block">{error.message}</code>
              {error.digest && (
                <code className="text-xs text-red-400 block">Digest: {error.digest}</code>
              )}
              {error.stack && (
                <code className="text-xs text-red-400 block whitespace-pre-wrap">
                  {error.stack}
                </code>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Create a specialized error boundary for different parts of the app
 */
export function createErrorBoundary(variant: ErrorHandlerProps['variant']) {
  return function VariantErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
      <ErrorBoundary
        onError={(error, errorInfo) => {
          void logger.error(`${variant} Error:`, { error, errorInfo });
        }}
      >
        {children}
      </ErrorBoundary>
    );
  };
}

// Export specialized error boundaries for different parts of the app
export const AdminErrorWrapper = createErrorBoundary('admin');
export const GalleryErrorWrapper = createErrorBoundary('gallery');
export const DefaultErrorWrapper = createErrorBoundary('default');

export default ErrorBoundary;
