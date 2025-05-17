'use client';

/**
 * Toast Provider Component
 * Provides toast notification capabilities to the application
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Toaster as Sonner } from 'sonner';

// Toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

// Toast position
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

// Options for toast
export interface ToastOptions {
  id?: string;
  duration?: number;
  position?: ToastPosition;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
  closeButton?: boolean;
  cancel?: {
    label: string;
    onClick: () => void;
  };
}

// Context interface
interface ToastContextValue {
  toast: (message: string, options?: ToastOptions) => string;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  loading: (message: string, options?: ToastOptions) => string;
  dismiss: (toastId?: string) => void;
  update: (toastId: string, message: string, options?: ToastOptions) => void;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
    toastOptions?: ToastOptions,
  ) => Promise<T>;
  custom: (content: React.ReactNode, options?: ToastOptions) => string;
}

// Default context
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Toast provider props
interface ToastProviderProps {
  children: React.ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
  closeButton?: boolean;
  richColors?: boolean;
  theme?: 'light' | 'dark' | 'system';
}

/**
 * Toast Provider Component
 * Wraps application and provides toast functionality
 */
export function ToastProvider({
  children,
  defaultPosition = 'bottom-right',
  defaultDuration = 5000,
  swipeDirection = 'right',
  closeButton = true,
  richColors = true,
  theme = 'system',
}: ToastProviderProps) {
  // Use context to generate unique IDs
  const [toastCount, setToastCount] = useState(0);

  // Generate unique ID for toast
  const generateId = useCallback(() => {
    setToastCount(prev => prev + 1);
    return `toast-${toastCount}`;
  }, [toastCount]);

  // Toast methods
  const toast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = options?.id || generateId();
      window.toast(message, {
        id,
        duration: options?.duration || defaultDuration,
        position: options?.position || defaultPosition,
        icon: options?.icon,
        action: options?.action,
        onDismiss: options?.onDismiss,
        onAutoClose: options?.onAutoClose,
        className: options?.className,
        style: options?.style,
        closeButton: options?.closeButton ?? closeButton,
        cancel: options?.cancel,
      });
      return id;
    },
    [defaultDuration, defaultPosition, generateId, closeButton],
  );

  // Success toast
  const success = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = options?.id || generateId();
      window.toast.success(message, {
        id,
        duration: options?.duration || defaultDuration,
        position: options?.position || defaultPosition,
        icon: options?.icon,
        action: options?.action,
        onDismiss: options?.onDismiss,
        onAutoClose: options?.onAutoClose,
        className: options?.className,
        style: options?.style,
        closeButton: options?.closeButton ?? closeButton,
        cancel: options?.cancel,
      });
      return id;
    },
    [defaultDuration, defaultPosition, generateId, closeButton],
  );

  // Error toast
  const error = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = options?.id || generateId();
      window.toast.error(message, {
        id,
        duration: options?.duration || defaultDuration,
        position: options?.position || defaultPosition,
        icon: options?.icon,
        action: options?.action,
        onDismiss: options?.onDismiss,
        onAutoClose: options?.onAutoClose,
        className: options?.className,
        style: options?.style,
        closeButton: options?.closeButton ?? closeButton,
        cancel: options?.cancel,
      });
      return id;
    },
    [defaultDuration, defaultPosition, generateId, closeButton],
  );

  // Info toast
  const info = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = options?.id || generateId();
      window.toast.info(message, {
        id,
        duration: options?.duration || defaultDuration,
        position: options?.position || defaultPosition,
        icon: options?.icon,
        action: options?.action,
        onDismiss: options?.onDismiss,
        onAutoClose: options?.onAutoClose,
        className: options?.className,
        style: options?.style,
        closeButton: options?.closeButton ?? closeButton,
        cancel: options?.cancel,
      });
      return id;
    },
    [defaultDuration, defaultPosition, generateId, closeButton],
  );

  // Warning toast
  const warning = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = options?.id || generateId();
      window.toast.warning(message, {
        id,
        duration: options?.duration || defaultDuration,
        position: options?.position || defaultPosition,
        icon: options?.icon,
        action: options?.action,
        onDismiss: options?.onDismiss,
        onAutoClose: options?.onAutoClose,
        className: options?.className,
        style: options?.style,
        closeButton: options?.closeButton ?? closeButton,
        cancel: options?.cancel,
      });
      return id;
    },
    [defaultDuration, defaultPosition, generateId, closeButton],
  );

  // Loading toast
  const loading = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = options?.id || generateId();
      window.toast.loading(message, {
        id,
        duration: options?.duration || defaultDuration,
        position: options?.position || defaultPosition,
        icon: options?.icon,
        action: options?.action,
        onDismiss: options?.onDismiss,
        onAutoClose: options?.onAutoClose,
        className: options?.className,
        style: options?.style,
        closeButton: options?.closeButton ?? closeButton,
        cancel: options?.cancel,
      });
      return id;
    },
    [defaultDuration, defaultPosition, generateId, closeButton],
  );

  // Dismiss toast
  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      window.toast.dismiss(toastId);
    } else {
      window.toast.dismiss();
    }
  }, []);

  // Update toast
  const update = useCallback(
    (toastId: string, message: string, options?: ToastOptions) => {
      window.toast.custom(message, {
        id: toastId,
        duration: options?.duration || defaultDuration,
        position: options?.position || defaultPosition,
        icon: options?.icon,
        action: options?.action,
        onDismiss: options?.onDismiss,
        onAutoClose: options?.onAutoClose,
        className: options?.className,
        style: options?.style,
        closeButton: options?.closeButton ?? closeButton,
        cancel: options?.cancel,
      });
    },
    [defaultDuration, defaultPosition, closeButton],
  );

  // Promise toast
  const promise = useCallback(
    <T,>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      },
      toastOptions?: ToastOptions,
    ): Promise<T> => {
      window.toast.promise(promise, options, {
        id: toastOptions?.id,
        duration: toastOptions?.duration || defaultDuration,
        position: toastOptions?.position || defaultPosition,
        closeButton: toastOptions?.closeButton ?? closeButton,
      });
      return promise;
    },
    [defaultDuration, defaultPosition, closeButton],
  );

  // Custom toast
  const custom = useCallback(
    (content: React.ReactNode, options?: ToastOptions) => {
      const id = options?.id || generateId();
      window.toast.custom(content, {
        id,
        duration: options?.duration || defaultDuration,
        position: options?.position || defaultPosition,
        icon: options?.icon,
        action: options?.action,
        onDismiss: options?.onDismiss,
        onAutoClose: options?.onAutoClose,
        className: options?.className,
        style: options?.style,
        closeButton: options?.closeButton ?? closeButton,
        cancel: options?.cancel,
      });
      return id;
    },
    [defaultDuration, defaultPosition, generateId, closeButton],
  );

  // Ensure window.toast is available in the client
  useEffect(() => {
    // Wait for Sonner to mount and make toast available globally
    const checkToastAvailable = setInterval(() => {
      if (window.toast) {
        clearInterval(checkToastAvailable);
      }
    }, 100);

    return () => {
      clearInterval(checkToastAvailable);
    };
  }, []);

  // Context value
  const contextValue: ToastContextValue = {
    toast,
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
    update,
    promise,
    custom,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Sonner
        position={defaultPosition}
        duration={defaultDuration}
        closeButton={closeButton}
        richColors={richColors}
        theme={theme}
        swipeDirection={swipeDirection}
        className="toast-container"
      />
    </ToastContext.Provider>
  );
}

/**
 * Hook to use the toast context
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

// Extend window to include toast
declare global {
  interface Window {
    toast: {
      (message: string, options?: unknown): void;
      success: (message: string, options?: unknown) => void;
      error: (message: string, options?: unknown) => void;
      info: (message: string, options?: unknown) => void;
      warning: (message: string, options?: unknown) => void;
      loading: (message: string, options?: unknown) => void;
      dismiss: (toastId?: string) => void;
      custom: (message: React.ReactNode, options?: unknown) => void;
      promise: <T>(
        promise: Promise<T>,
        options: {
          loading: string;
          success: string | ((data: T) => string);
          error: string | ((error: Error) => string);
        },
        toastOptions?: unknown,
      ) => Promise<T>;
    };
  }
}
