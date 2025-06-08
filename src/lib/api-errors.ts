/**
 * API Error Handling
 *
 * Defines standardized API error types and handlers for the application.
 * This allows for consistent error responses and client-side handling.
 */

import { toast } from 'sonner';
import { logger } from './logger';

// Define our custom error codes enum
export enum ErrorCode {
  // HTTP Standard Errors
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  CONFLICT = 'CONFLICT',
  PAYLOAD_TOO_LARGE = 'PAYLOAD_TOO_LARGE',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  
  // Authentication & Authorization
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  
  // Resource Errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  
  // Payment Errors
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  
  // Business Logic Errors
  BOOKING_UNAVAILABLE = 'BOOKING_UNAVAILABLE',
  CALENDAR_ERROR = 'CALENDAR_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INVALID_OPERATION = 'INVALID_OPERATION',
  
  // Generic
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// API Error Response interface
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
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Convert to standard HTTP response
  toHttpResponse(): Response {
    const body: ApiErrorResponse = {
      code: this.code,
      message: this.message,
      details: this.details,
      ...(process.env.NODE_ENV === 'development' && this.stack && { stack: this.stack }),
    };

    return new Response(JSON.stringify(body), {
      status: this.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Convert to standard API response for Next.js API routes
  toResponse(): ApiErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      ...(process.env.NODE_ENV === 'development' && this.stack && { stack: this.stack }),
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

  // Authentication & Authorization specific
  authenticationError: (message = 'Authentication failed', details?: unknown) =>
    new ApiError(ErrorCode.AUTHENTICATION_ERROR, message, 401, details),

  authorizationError: (message = 'Authorization failed', details?: unknown) =>
    new ApiError(ErrorCode.AUTHORIZATION_ERROR, message, 403, details),

  // Resource specific
  resourceNotFound: (message = 'Resource not found', details?: unknown) =>
    new ApiError(ErrorCode.RESOURCE_NOT_FOUND, message, 404, details),

  resourceAlreadyExists: (message = 'Resource already exists', details?: unknown) =>
    new ApiError(ErrorCode.RESOURCE_ALREADY_EXISTS, message, 409, details),

  // Business logic
  invalidOperation: (message = 'Invalid operation', details?: unknown) =>
    new ApiError(ErrorCode.INVALID_OPERATION, message, 400, details),

  databaseError: (message = 'Database error', details?: unknown) =>
    new ApiError(ErrorCode.DATABASE_ERROR, message, 500, details),

  externalServiceError: (message = 'External service error', details?: unknown) =>
    new ApiError(ErrorCode.EXTERNAL_SERVICE_ERROR, message, 502, details),
};

/**
 * Utility for handling API errors in client-side code
 */
export function handleApiError(error: unknown, showToast = true): ApiErrorResponse {
  logger.error('API Error:', error);

  let formattedError: ApiErrorResponse;

  if (error instanceof ApiError) {
    formattedError = error.toResponse();
  } else if (error instanceof Error) {
    formattedError = {
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message ?? 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && error.stack && { stack: error.stack }),
    };
  } else {
    formattedError = {
      code: ErrorCode.UNKNOWN_ERROR,
      message: 'An unexpected error occurred',
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
  return (
    isApiError(error) &&
    (error.code === ErrorCode.UNAUTHORIZED || error.code === ErrorCode.AUTHENTICATION_ERROR)
  );
}

export function isNotFoundError(error: unknown): boolean {
  return (
    isApiError(error) &&
    (error.code === ErrorCode.NOT_FOUND || error.code === ErrorCode.RESOURCE_NOT_FOUND)
  );
}

export function isPaymentError(error: unknown): boolean {
  return (
    isApiError(error) &&
    (error.code === ErrorCode.PAYMENT_REQUIRED || error.code === ErrorCode.PAYMENT_FAILED)
  );
}

// Utility function to create error responses for API routes
export function createErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return error.toHttpResponse();
  }

  // Handle standard errors
  const apiError = new ApiError(
    ErrorCode.INTERNAL_SERVER_ERROR,
    error instanceof Error ? error.message : 'An unexpected error occurred',
    500,
    error
  );

  return apiError.toHttpResponse();
}

// Utility to extract error message from any error type
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

// Status code mapper for HTTP responses
export function getHttpStatusFromErrorCode(code: ErrorCode): number {
  switch (code) {
    case ErrorCode.BAD_REQUEST:
    case ErrorCode.VALIDATION_ERROR:
    case ErrorCode.BOOKING_UNAVAILABLE:
    case ErrorCode.PAYMENT_FAILED:
    case ErrorCode.INVALID_OPERATION:
      return 400;
    case ErrorCode.UNAUTHORIZED:
    case ErrorCode.AUTHENTICATION_ERROR:
      return 401;
    case ErrorCode.PAYMENT_REQUIRED:
      return 402;
    case ErrorCode.FORBIDDEN:
    case ErrorCode.AUTHORIZATION_ERROR:
      return 403;
    case ErrorCode.NOT_FOUND:
    case ErrorCode.RESOURCE_NOT_FOUND:
      return 404;
    case ErrorCode.METHOD_NOT_ALLOWED:
      return 405;
    case ErrorCode.CONFLICT:
    case ErrorCode.RESOURCE_ALREADY_EXISTS:
      return 409;
    case ErrorCode.PAYLOAD_TOO_LARGE:
      return 413;
    case ErrorCode.UNPROCESSABLE_ENTITY:
      return 422;
    case ErrorCode.TOO_MANY_REQUESTS:
      return 429;
    case ErrorCode.INTERNAL_SERVER_ERROR:
    case ErrorCode.DATABASE_ERROR:
    case ErrorCode.CALENDAR_ERROR:
    case ErrorCode.UNKNOWN_ERROR:
      return 500;
    case ErrorCode.EXTERNAL_SERVICE_ERROR:
      return 502;
    case ErrorCode.SERVICE_UNAVAILABLE:
      return 503;
    default:
      return 500;
  }
}