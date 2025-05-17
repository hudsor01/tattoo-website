import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

/**
 * Middleware to capture errors and monitor performance with Sentry
 */
export async function withSentry(
  request: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Skip Sentry in development to reduce noise
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  try {
    // Start a new transaction for this request
    const transaction = Sentry.startTransaction({
      name: `${request.method} ${request.nextUrl.pathname}`,
      op: 'http.server',
    });

    // Set the transaction on the current scope
    Sentry.configureScope(scope => {
      scope.setSpan(transaction);

      // Add request data to the transaction
      scope.setContext('request', {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers),
      });
    });

    try {
      // Execute the next middleware or route handler
      const response = await next();

      // Add response data to the transaction
      transaction.setData('response', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers),
      });

      // Finish the transaction successfully
      transaction.finish();

      return response;
    } catch (error) {
      // Capture the error in Sentry
      Sentry.captureException(error);

      // Finish the transaction with error status
      transaction.setStatus('internal_error');
      transaction.finish();

      // Log the error
      logger.error('Error in middleware', { error });

      // Re-throw to let Next.js handle it
      throw error;
    }
  } catch (error) {
    // Fallback error handling if Sentry setup itself fails
    logger.error('Error in Sentry middleware setup', { error });

    // Continue with the request even if Sentry fails
    return next();
  }
}
