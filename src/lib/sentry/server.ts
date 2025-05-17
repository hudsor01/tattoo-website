import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

/**
 * Initialize Sentry for server-side error tracking
 */
export const initSentryServer = () => {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance monitoring settings
    tracesSampleRate: 0.5, // Capture 50% of transactions for performance monitoring

    // Set the environment based on NODE_ENV
    environment: process.env.NODE_ENV,

    // Only initialize in production to reduce dev noise
    enabled: process.env.NODE_ENV === 'production',

    // Customize the beforeSend callback to filter or modify events before sending to Sentry
    beforeSend(event) {
      // Don't send events in development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }

      // Filter out specific errors you don't want to track
      if (event.exception?.values?.some(exception => exception.value?.includes('NEXT_NOT_FOUND'))) {
        return null;
      }

      // Log the error to Winston as well
      if (event.exception) {
        const errorMessage = event.exception.values?.[0]?.value || 'Unknown error';
        logger.error(`Server error captured by Sentry: ${errorMessage}`);
      }

      return event;
    },
  });
};

/**
 * Create a new transaction for performance monitoring
 */
export const startServerTransaction = (name: string, op: string) => {
  return Sentry.startTransaction({
    name,
    op,
  });
};

/**
 * Set the current transaction for a span of code
 */
export const withServerTransaction = async <T>(
  name: string,
  op: string,
  callback: () => Promise<T>
): Promise<T> => {
  const transaction = startServerTransaction(name, op);
  Sentry.configureScope(scope => {
    scope.setSpan(transaction);
  });

  try {
    const result = await callback();
    transaction.finish();
    return result;
  } catch (error) {
    transaction.finish();
    throw error;
  }
};
