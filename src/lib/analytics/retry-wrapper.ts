/**
 * Retry wrapper for analytics operations
 * Provides resilient error handling for analytics failures
 */

// Define AnalyticsError locally
interface AnalyticsError extends Error {
code?: string;
retryable?: boolean;
}

import { logger } from "@/lib/logger";
export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'NETWORK_ERROR',
    'TIMEOUT',
    'RATE_LIMIT',
    'SERVICE_UNAVAILABLE',
    'DATABASE_ERROR',
  ],
};

/**
 * Determines if an error is retryable based on its type
 */
export function isRetryableError(error: unknown, retryableErrors: string[]): boolean {
  if (error instanceof Error) {
    // Check for specific error patterns
    const errorMessage = error.message.toLowerCase();
    
    // Network-related errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('timeout') || 
        errorMessage.includes('connection')) {
      return true;
    }
    
    // HTTP status code errors that are retryable
    if (errorMessage.includes('503') || // Service Unavailable
        errorMessage.includes('429') || // Too Many Requests
        errorMessage.includes('502') || // Bad Gateway
        errorMessage.includes('504')) { // Gateway Timeout
      return true;
    }
  }
  
  // Check against custom retryable error codes
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const errorCode = (error as { code: string }).code;
    return retryableErrors.includes(errorCode);
  }
  
  return false;
}

/**
 * Calculates delay for next retry using exponential backoff
 */
export function calculateRetryDelay(
  attempt: number, 
  baseDelay: number, 
  maxDelay: number, 
  backoffMultiplier: number
): number {
  const delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Wraps an async operation with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T | null> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt
      if (attempt === config.maxRetries) {
        break;
      }
      
      // Don't retry if error is not retryable
      if (!isRetryableError(error, config.retryableErrors ?? [])) {
        void logger.warn('Non-retryable error encountered:', error);
        break;
      }
      
      // Calculate delay and wait
      const delay = calculateRetryDelay(
        attempt, 
        config.baseDelay, 
        config.maxDelay, 
        config.backoffMultiplier
      );
      
      void logger.warn(`Analytics operation failed (attempt ${attempt}/${config.maxRetries}). Retrying in ${delay}ms...`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  void logger.error('Analytics operation failed after all retries:', lastError);
  return null;
}

/**
 * Wraps an analytics operation with error handling that never throws
 * Analytics failures should never break user experience
 */
export async function safeAnalyticsOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: Partial<RetryOptions> = {}
): Promise<T | null> {
  try {
    return await withRetry(operation, options);
  } catch (error) {
    // This should never happen due to withRetry's error handling,
    // but adding extra safety
    void logger.error(`Critical error in analytics operation "${operationName}":`, error);
    
    // Optional: Send to error monitoring service here
    // await sendToErrorMonitoring(error, { operation: operationName });
    
    return null;
  }
}

/**
 * Creates a standardized analytics error
 */
export function createAnalyticsError(
  code: string,
  message: string,
  retryable: boolean = true
): AnalyticsError {
  return {
    code,
    message,
    timestamp: new Date(),
    retryable,
  };
}
