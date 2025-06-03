/**
 * Error Handler Utility
 * 
 * Provides standardized error handling for tRPC procedures.
 * Ensures consistent error formatting, logging, and error codes.
 */
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
// Validation error type for form/API validation
type ValidationError = {
  field: string;
  message: string;
  code?: string;
};

/**
 * Handles various error types and standardizes them into TRPCErrors
 * with appropriate error codes and logging
 * 
 * @param error The error to handle
 * @param context Additional context information for logging
 * @param message Optional custom error message
 * @returns Never - always throws a TRPCError
 */
export function handleError(
  error: unknown, 
  context: Record<string, unknown> = {}, 
  message = 'An error occurred during the operation'
): never {
  // If it's already a TRPCError, just pass it through with logging
  if (error instanceof TRPCError) {
    void logger.error(`TRPC Error (${error.code}): ${error.message}`, {
      ...context,
      errorType: 'TRPCError',
      trpcCode: error.code,
    });
    throw error;
  }

  // Handle Prisma-specific errors with appropriate codes
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const errorCode = getPrismaErrorCode(error.code);
    const errorMessage = getPrismaErrorMessage(error.code, message);

    void logger.error(`Prisma Error (${error.code}): ${errorMessage}`, {
      ...context,
      errorType: 'PrismaError',
      prismaCode: error.code,
      target: error.meta?.['target'],
    });

    throw new TRPCError({
      code: errorCode,
      message: errorMessage,
      cause: error,
    });
  }

  // Handle other error types
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  void logger.error(`Unexpected Error: ${errorMessage}`, {
    ...context,
    errorType: error instanceof Error ? error.constructor.name : typeof error,
    stack: error instanceof Error ? error.stack : undefined,
  });

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message,
    cause: error,
  });
}

/**
 * Maps Prisma error codes to appropriate TRPC error codes
 */
function getPrismaErrorCode(prismaCode: string): TRPCError['code'] {
  switch (prismaCode) {
    case 'P2002': // Unique constraint violation
      return 'CONFLICT';
    case 'P2003': // Foreign key constraint violation
      return 'BAD_REQUEST';
    case 'P2025': // Record not found
      return 'NOT_FOUND';
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}

/**
 * Provides user-friendly error messages for common Prisma errors
 */
function getPrismaErrorMessage(prismaCode: string, defaultMessage: string): string {
  switch (prismaCode) {
    case 'P2002':
      return 'A record with this identifier already exists';
    case 'P2003':
      return 'The operation failed because of a reference constraint';
    case 'P2025':
      return 'The requested record was not found';
    default:
      return defaultMessage;
  }
}

/**
 * Formats validation errors from Zod
 * @param error Zod validation error
 * @returns Formatted error message
 */
export function formatValidationErrors(error: unknown): string {
  if (!error || typeof error !== 'object' || !('errors' in error)) return 'Validation failed';
  
  const errorObj = error as { errors: ValidationError[] };
  return errorObj.errors
    .map((err) => `${err.path}: ${err.message}`)
    .join(', ');
}