/**
 * Error handling utilities
 * 
 * This module provides utility functions for error handling,
 * error formatting, and error reporting.
 */

import { TRPCClientError } from '@trpc/client';

/**
 * Interface for structured API errors
 */
export interface APIError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  status?: number;
}

/**
 * Extract a readable error message from different error types
 * 
 * @param error - The error to extract a message from
 * @returns A human-readable error message
 */
export function getErrorMessage(error: unknown): string {
  // Handle tRPC client errors
  if (error instanceof TRPCClientError) {
    try {
      // Try to parse the error shape for more details
      const errorShape = error.shape;
      if (errorShape?.message) {
        return errorShape.message as string;
      }
    } catch (e) {
      // Fall back to the base message if shape parsing fails
    }
    return error.message;
  } 

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle API error responses
  if (typeof error === 'object' && error !== null) {
    // Check for API error structure
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Check for HTTP response error
    if ('statusText' in error && typeof error.statusText === 'string') {
      return error.statusText;
    }
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback for unknown error types
  return 'An unexpected error occurred';
}

/**
 * Format error for logging
 * 
 * @param error - The error to format
 * @returns A formatted error object suitable for logging
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  const errorObj: Record<string, unknown> = {
    message: getErrorMessage(error),
    timestamp: new Date().toISOString(),
  };
  
  if (error instanceof Error) {
    errorObj.name = error.name;
    errorObj.stack = error.stack;
  }
  
  if (error instanceof TRPCClientError) {
    errorObj.code = error.shape?.code;
    errorObj.data = error.shape?.data;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Add any additional properties that might be useful
    if ('code' in error) errorObj.code = error.code;
    if ('status' in error) errorObj.status = error.status;
    if ('path' in error) errorObj.path = error.path;
  }
  
  return errorObj;
}

/**
 * Create a new Error from an API error response
 * 
 * @param apiError - The API error response
 * @returns A new Error instance with details from the API error
 */
export function createErrorFromAPIResponse(apiError: APIError): Error {
  const error = new Error(apiError.message);
  
  // Add custom properties to the error object
  Object.defineProperties(error, {
    code: {
      value: apiError.code,
      enumerable: true,
    },
    details: {
      value: apiError.details,
      enumerable: true,
    },
    status: {
      value: apiError.status,
      enumerable: true,
    },
  });
  
  return error;
}

/**
 * Determines if an error is a network connectivity error
 * 
 * @param error - The error to check
 * @returns True if the error appears to be a network connectivity issue
 */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  
  // Common network error messages
  const networkErrorMessages = [
    'network error',
    'failed to fetch',
    'network request failed',
    'connection refused',
    'timeout',
    'abort',
    'offline',
  ];
  
  const message = error.message.toLowerCase();
  return networkErrorMessages.some(msg => message.includes(msg));
}

/**
 * Determine if an error is a validation error
 * 
 * @param error - The error to check
 * @returns True if the error appears to be a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof TRPCClientError) {
    return error.shape?.code === 'BAD_REQUEST' || error.shape?.code === 'UNPROCESSABLE_CONTENT';
  }
  
  if (typeof error === 'object' && error !== null) {
    if ('code' in error && (error.code === 'BAD_REQUEST' || error.code === 'VALIDATION_ERROR')) {
      return true;
    }
  }
  
  return false;
}