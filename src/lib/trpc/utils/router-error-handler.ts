/**
 * Router Error Handler
 * 
 * Standardized error handling for tRPC routers
 */
import { TRPCError } from '@trpc/server';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';

export type RouterErrorContext = {
  operation: string;
  procedureName: string;
  routerName: string;
  userId?: string;
  input?: unknown;
};

/**
 * Handles errors in tRPC router procedures with consistent error types and logging
 */
export function handleRouterError(
  error: unknown, 
  context: RouterErrorContext
): never {
  // Extract context information for better error logging
  const { operation, procedureName, routerName, userId, input } = context;
  
  // Log the error with context
  void logger.error(`${routerName}.${procedureName} error (${operation})`, {
    error,
    userId,
    input: input ? JSON.stringify(input).substring(0, 500) : undefined,
  });
  
  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2025': // Record not found
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'The requested resource was not found',
          cause: error,
        });
      case 'P2002': // Unique constraint failed
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A resource with this identifier already exists',
          cause: error,
        });
      case 'P2003': // Foreign key constraint failed
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid reference to a related resource',
          cause: error,
        });
      case 'P2004': // Constraint violation
      case 'P2005': // Invalid value
      case 'P2006': // Invalid value for type
      case 'P2007': // Validation error
      case 'P2008': // Query parsing error
      case 'P2009': // Query validation error
      case 'P2010': // Raw query error
      case 'P2011': // Null constraint violation
      case 'P2012': // Missing required value
      case 'P2013': // Missing required argument
      case 'P2014': // Relation violation
      case 'P2015': // Related record not found
      case 'P2016': // Query interpretation error
      case 'P2017': // Relation records not connected
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
          cause: error,
        });
      case 'P2018': // Connection error
      case 'P2024': // Timeout error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection error',
          cause: error,
        });
      case 'P2019': // Input error
      case 'P2020': // Invalid value for unique field
      case 'P2021': // Table does not exist
      case 'P2022': // Column does not exist
      case 'P2023': // Inconsistent column data
      default:
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected database error occurred',
          cause: error,
        });
    }
  }
  
  // Handle tRPC errors - pass through
  if (error instanceof TRPCError) {
    throw error;
  }
  
  // Handle standard errors
  if (error instanceof Error) {
    // If error.name contains specific error indicators, map to appropriate TRPC errors
    const errorName = error.name.toLowerCase();
    
    if (errorName.includes('auth') || errorName.includes('unauthorized') || errorName.includes('unauthenticated')) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: error.message || 'Authentication required',
        cause: error,
      });
    }
    
    if (errorName.includes('forbidden') || errorName.includes('permission')) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: error.message || 'Insufficient permissions',
        cause: error,
      });
    }
    
    if (errorName.includes('not found') || errorName.includes('notfound') || errorName.includes('404')) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: error.message || 'Resource not found',
        cause: error,
      });
    }
    
    if (errorName.includes('validation') || 
        errorName.includes('invalid') || 
        errorName.includes('typeerror') ||
        errorName.includes('syntaxerror')) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: error.message || 'Invalid input',
        cause: error,
      });
    }
    
    if (errorName.includes('timeout') || errorName.includes('deadline')) {
      throw new TRPCError({
        code: 'TIMEOUT',
        message: error.message || 'Operation timed out',
        cause: error,
      });
    }
    
    // Default error handling
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
      cause: error,
    });
  }
  
  // Handle unknown errors
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    cause: error,
  });
}