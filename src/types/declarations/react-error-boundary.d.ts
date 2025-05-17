// Type declarations for React Error Boundary

declare module 'react-error-boundary' {
  import { ComponentType, ReactNode } from 'react';

  export interface ErrorBoundaryProps {
    fallback?: ReactNode;
    FallbackComponent?: ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
    onError?: (error: Error, errorInfo: { componentStack: string }) => void;
    onReset?: () => void;
    resetKeys?: string[];
    resetOnPropsChange?: boolean;
    isolate?: boolean;
  }

  export const ErrorBoundary: ComponentType<ErrorBoundaryProps>;
  export function useErrorHandler(): (error: unknown) => void;
  export function withErrorBoundary<P extends object>(
    Component: ComponentType<P>,
    errorBoundaryConfig?: ErrorBoundaryProps
  ): ComponentType<P>;
}
