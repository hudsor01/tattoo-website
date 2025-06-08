/**
 * Error handling types and enums
 * These are application-level types, not database entities
 */

export enum ErrorCategory {
VALIDATION = 'validation',
NETWORK = 'network',
AUTHENTICATION = 'authentication',
AUTHORIZATION = 'authorization',
NOT_FOUND = 'not_found',
SERVER = 'server',
CLIENT = 'client',
UNKNOWN = 'unknown',
DATABASE = 'database',
EXTERNAL_API = 'external_api',
INTERNAL = 'internal',
RATE_LIMIT = 'rate_limit',
PAYMENT = 'payment',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface ErrorContext {
component?: string;
action?: string;
userId?: string;
additionalData?: Record<string, unknown>;
displayToUser?: boolean;
severity?: ErrorSeverity;
category?: ErrorCategory;
requestId?: string;
timestamp?: Date;
metadata?: Record<string, unknown>;
}

export interface ErrorHandler {
  handle(error: Error, context?: ErrorContext): Promise<void>;
  log(error: Error, context?: ErrorContext): void;
}
