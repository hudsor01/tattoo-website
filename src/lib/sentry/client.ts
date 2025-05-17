import * as Sentry from '@sentry/nextjs';

/**
 * Initialize Sentry for client-side error tracking
 */
export const initSentryClient = () => {
  const dsn = process.env['NEXT_PUBLIC_SENTRY_DSN'];
  if (!dsn) {
    console.warn('Sentry DSN not found. Sentry will not be initialized.');
    return;
  }

  Sentry.init({
    dsn: dsn,
    tracesSampleRate: 0.5,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: process.env.NODE_ENV,

    // Only initialize in production to reduce dev noise
    enabled: process.env.NODE_ENV === 'production',

    // Set the integration to set up the global error event handlers
    integrations: [],

    // Adjust this value to control the sampling rate
    // Capture 100% of errors in production for critical user paths
    sampleRate: 1.0,
  });
};

/**
 * Log a user in to Sentry
 */
export const identifySentryUser = (user: { id: string; email: string }) => {
  if (!user) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
};

/**
 * Log a user out of Sentry
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

/**
 * Set extra context for Sentry events
 */
export const setSentryContext = (section: string, data: Record<string, unknown>) => {
  Sentry.setContext(section, data);
};

/**
 * Capture a specific error with custom context
 */
export const captureException = (error: Error, context?: Record<string, unknown>) => {
  if (context) {
    Sentry.withScope(scope => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
};

/**
 * Manually capture a message
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};
