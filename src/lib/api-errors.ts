/**
 * API Error Handling
 * 
 * Defines standardized API error types and handlers for the application.
 * This allows for consistent error responses and client-side handling.
 */

import { TRPCError } from '@trpc/server';
import { toast } from 'sonner';

export enum ErrorCode {
  // HTTP Status Code Errors
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Business Logic Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  INVALID_OPERATION = 'INVALID_OPERATION',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // Payment and Booking Errors
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  BOOKING_UNAVAILABLE = 'BOOKING_UNAVAILABLE',
  CALENDAR_ERROR = 'CALENDAR_ERROR',
  
  // Generic Error
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Standardized error response shape
export interface ApiErrorResponse {
  code: ErrorCode;
  message: string;
  details?: unknown;
  stack?: string;
}

export class ApiError extends Error {
  code: ErrorCode;
  status: number;
  details?: unknown;
  
  constructor(code: ErrorCode, message: string, status = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    
    // Ensures proper stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
  }
  
  // Convert to TRPC error for API routes
  toTRPCError(): TRPCError {
    // Map our error codes to TRPC error codes
    const trpcCode = this.mapErrorCodeToTRPC();
    
    return new TRPCError({
      code: trpcCode,
      message: this.message,
      cause: this.details
    });
  }
  
  // Maps our custom error codes to TRPC error codes
  private mapErrorCodeToTRPC(): 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 
    'TIMEOUT' | 'CONFLICT' | 'PRECONDITION_FAILED' | 'PAYLOAD_TOO_LARGE' | 'METHOD_NOT_SUPPORTED' |
    'UNPROCESSABLE_CONTENT' | 'TOO_MANY_REQUESTS' | 'CLIENT_CLOSED_REQUEST' | 'INTERNAL_SERVER_ERROR' {
    
    // Direct mappings
    if (
      this.code === ErrorCode.BAD_REQUEST ||
      this.code === ErrorCode.UNAUTHORIZED ||
      this.code === ErrorCode.FORBIDDEN ||
      this.code === ErrorCode.NOT_FOUND ||
      this.code === ErrorCode.CONFLICT ||
      this.code === ErrorCode.PAYLOAD_TOO_LARGE ||
      this.code === ErrorCode.TOO_MANY_REQUESTS ||
      this.code === ErrorCode.INTERNAL_SERVER_ERROR
    ) {
      return this.code;
    }
    
    // Indirect mappings
    switch (this.code) {
      case ErrorCode.VALIDATION_ERROR:
      case ErrorCode.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_CONTENT';
      case ErrorCode.AUTHENTICATION_ERROR:
        return 'UNAUTHORIZED';
      case ErrorCode.AUTHORIZATION_ERROR:
        return 'FORBIDDEN';
      case ErrorCode.RESOURCE_NOT_FOUND:
        return 'NOT_FOUND';
      case ErrorCode.RESOURCE_ALREADY_EXISTS:
        return 'CONFLICT';
      case ErrorCode.METHOD_NOT_ALLOWED:
        return 'METHOD_NOT_SUPPORTED';
      case ErrorCode.SERVICE_UNAVAILABLE:
      case ErrorCode.EXTERNAL_SERVICE_ERROR:
      case ErrorCode.DATABASE_ERROR:
      case ErrorCode.CALENDAR_ERROR:
        return 'INTERNAL_SERVER_ERROR';
      case ErrorCode.PAYMENT_REQUIRED:
      case ErrorCode.PAYMENT_FAILED:
      case ErrorCode.BOOKING_UNAVAILABLE:
      case ErrorCode.INVALID_OPERATION:
      case ErrorCode.UNKNOWN_ERROR:
      default:
        return 'BAD_REQUEST';
    }
  }
  
  // Convert to standard API response for Next.js API routes
  toResponse(): ApiErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      ...(process.env.NODE_ENV === 'development' && this.stack && { stack: this.stack })
    };
  }
}

/**
 * Error factory methods for common error types
 */
export const ApiErrors = {
  badRequest: (message = 'Bad request', details?: unknown) => 
    new ApiError(ErrorCode.BAD_REQUEST, message, 400, details),
    
  unauthorized: (message = 'Unauthorized', details?: unknown) => 
    new ApiError(ErrorCode.UNAUTHORIZED, message, 401, details),
    
  forbidden: (message = 'Forbidden', details?: unknown) => 
    new ApiError(ErrorCode.FORBIDDEN, message, 403, details),
    
  notFound: (message = 'Resource not found', details?: unknown) => 
    new ApiError(ErrorCode.NOT_FOUND, message, 404, details),
    
  methodNotAllowed: (message = 'Method not allowed', details?: unknown) => 
    new ApiError(ErrorCode.METHOD_NOT_ALLOWED, message, 405, details),
    
  conflict: (message = 'Resource conflict', details?: unknown) => 
    new ApiError(ErrorCode.CONFLICT, message, 409, details),
    
  validationError: (message = 'Validation error', details?: unknown) => 
    new ApiError(ErrorCode.VALIDATION_ERROR, message, 422, details),
    
  tooManyRequests: (message = 'Too many requests', details?: unknown) => 
    new ApiError(ErrorCode.TOO_MANY_REQUESTS, message, 429, details),
    
  internalServerError: (message = 'Internal server error', details?: unknown) => 
    new ApiError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500, details),
    
  serviceUnavailable: (message = 'Service unavailable', details?: unknown) => 
    new ApiError(ErrorCode.SERVICE_UNAVAILABLE, message, 503, details),
    
  // Domain-specific errors
  paymentRequired: (message = 'Payment required', details?: unknown) => 
    new ApiError(ErrorCode.PAYMENT_REQUIRED, message, 402, details),
    
  paymentFailed: (message = 'Payment failed', details?: unknown) => 
    new ApiError(ErrorCode.PAYMENT_FAILED, message, 400, details),
    
  bookingUnavailable: (message = 'Booking unavailable', details?: unknown) => 
    new ApiError(ErrorCode.BOOKING_UNAVAILABLE, message, 400, details),
    
  calendarError: (message = 'Calendar service error', details?: unknown) => 
    new ApiError(ErrorCode.CALENDAR_ERROR, message, 500, details),
};

/**
 * Utility for handling API errors in client-side code
 */
export function handleApiError(error: unknown, showToast = true): ApiErrorResponse {
  console.error('API Error:', error);
  
  let formattedError: ApiErrorResponse;
  
  if (error instanceof ApiError) {
    formattedError = error.toResponse();
  } else if (error instanceof Error) {
    formattedError = {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && error.stack && { stack: error.stack })
    };
  } else {
    formattedError = {
      code: ErrorCode.UNKNOWN_ERROR,
      message: 'An unexpected error occurred'
    };
  }
  
  if (showToast) {
    toast.error(formattedError.message);
  }
  
  return formattedError;
}

// Helper to determine if an error is a specific type
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isValidationError(error: unknown): boolean {
  return isApiError(error) && error.code === ErrorCode.VALIDATION_ERROR;
}

export function isAuthError(error: unknown): boolean {
  return isApiError(error) && 
    (error.code === ErrorCode.UNAUTHORIZED || error.code === ErrorCode.AUTHENTICATION_ERROR);
}

export function isNotFoundError(error: unknown): boolean {
  return isApiError(error) && 
    (error.code === ErrorCode.NOT_FOUND || error.code === ErrorCode.RESOURCE_NOT_FOUND);
}

export function isPaymentError(error: unknown): boolean {
  return isApiError(error) && 
    (error.code === ErrorCode.PAYMENT_REQUIRED || error.code === ErrorCode.PAYMENT_FAILED);
}