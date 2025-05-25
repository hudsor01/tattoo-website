'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, Check, AlertTriangle, Info, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast as baseToast } from 'sonner';

import { cn } from '@/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        success:
          'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100',
        error:
          'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
        destructive:
          'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100',
        warning:
          'border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100',
        info: 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Toast = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastIcon = ({
  variant,
}: {
  variant?: 'default' | 'success' | 'error' | 'destructive' | 'warning' | 'info';
}) => {
  if (!variant || variant === 'default') return null;

  const icons = {
    success: <Check className="h-5 w-5 text-green-500 dark:text-green-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
    destructive: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />,
    info: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
  } as const;

  return <div className="mr-3">{icons[variant]}</div>;
};

const ToastAction = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ComponentRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

// Animated toast wrapper with motion
const AnimatedToast = React.forwardRef<
  React.ComponentRef<typeof Toast>,
  React.ComponentPropsWithoutRef<typeof Toast> & VariantProps<typeof toastVariants>
>(({ variant, children, ...props }, ref) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        type: 'spring',
        duration: 0.4,
        bounce: 0.3,
      }}
    >
      <Toast ref={ref} variant={variant} {...props}>
        <div className="flex items-start gap-3 flex-1">
          <ToastIcon {...(variant ? { variant } : {})} />
          <div className="flex-1">{children}</div>
        </div>
      </Toast>
    </motion.div>
  )
});
AnimatedToast.displayName = 'AnimatedToast';

// Progress toast for long operations
interface ProgressToastProps {
  title: string
  progress: number
  description: string | undefined
}

const ProgressToast = ({ title, progress, description }: ProgressToastProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="flex-shrink-0 text-primary"
        >
          <Loader2 className="w-5 h-5" />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <ToastTitle>{title}</ToastTitle>
          {description && <ToastDescription>{description}</ToastDescription>}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5">
          <motion.div
            className="bg-primary h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
};

// Enhanced toast functions with animations and better UX
export const toast = {
  success: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    void baseToast.custom((t) => (
      <AnimatedToast variant="success">
        <ToastTitle>{title}</ToastTitle>
        {description && <ToastDescription>{description}</ToastDescription>}
        {action && (
          <ToastAction onClick={action.onClick} altText={action.label}>
            {action.label}
          </ToastAction>
        )}
        <ToastClose onClick={() => baseToast.dismiss(t as string | number)} />
      </AnimatedToast>
    ))
  },

  error: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    void baseToast.custom((t) => (
      <AnimatedToast variant="error">
        <ToastTitle>{title}</ToastTitle>
        {description && <ToastDescription>{description}</ToastDescription>}
        {action && (
          <ToastAction onClick={action.onClick} altText={action.label}>
            {action.label}
          </ToastAction>
        )}
        <ToastClose onClick={() => baseToast.dismiss(t as string | number)} />
      </AnimatedToast>
    ))
  },

  warning: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    void baseToast.custom((t) => (
      <AnimatedToast variant="warning">
        <ToastTitle>{title}</ToastTitle>
        {description && <ToastDescription>{description}</ToastDescription>}
        {action && (
          <ToastAction onClick={action.onClick} altText={action.label}>
            {action.label}
          </ToastAction>
        )}
        <ToastClose onClick={() => baseToast.dismiss(t as string | number)} />
      </AnimatedToast>
    ))
  },

  info: (title: string, description?: string, action?: { label: string; onClick: () => void }) => {
    void baseToast.custom((t) => (
      <AnimatedToast variant="info">
        <ToastTitle>{title}</ToastTitle>
        {description && <ToastDescription>{description}</ToastDescription>}
        {action && (
          <ToastAction onClick={action.onClick} altText={action.label}>
            {action.label}
          </ToastAction>
        )}
        <ToastClose onClick={() => baseToast.dismiss(t as string | number)} />
      </AnimatedToast>
    ))
  },

  promise: function<T>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    }
  ) {
    const { loading, success, error } = options
    return baseToast.promise(promise, {
      loading: loading,
      success: success,
      error: error,
    })
  },

  progress: (title: string, progress: number, description?: string) => {
    void baseToast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="relative flex flex-col gap-3 p-4 rounded-lg border bg-background border-border shadow-lg backdrop-blur-sm max-w-md w-full"
      >
        <ProgressToast title={title} progress={progress} description={description} />
        <ToastClose onClick={() => baseToast.dismiss(t as string | number)} />
      </motion.div>
    ))
  },
};

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  AnimatedToast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastIcon,
  ProgressToast,
};
