/**
 * Database-specific types and interfaces
 */

import type { PrismaClient } from '@prisma/client';

/**
 * Extended Prisma client type with additional methods
 */
export type ExtendedPrismaClient = PrismaClient & {
  // Add any custom methods or extensions here
};

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  url: string;
  maxConnections?: number;
  connectionTimeout?: number;
  idleTimeout?: number;
  logLevel?: 'info' | 'query' | 'warn' | 'error';
}

/**
 * Database query result wrapper
 */
export interface QueryResult<T = any> {
  data: T;
  count?: number;
  error?: string;
  executionTime?: number;
}

/**
 * Database transaction context
 */
export interface TransactionContext {
  client: ExtendedPrismaClient;
  rollback: () => Promise<void>;
  commit: () => Promise<void>;
}

/**
 * Raw query parameters
 */
export interface RawQueryParams {
  query: string;
  params?: any[];
  timeout?: number;
}

/**
 * Stored procedure execution result
 */
export interface StoredProcedureResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  affected_rows?: number;
}

/**
 * Database migration info
 */
export interface MigrationInfo {
  id: string;
  name: string;
  applied_at: Date;
  execution_time?: number;
}

/**
 * Database health check result
 */
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency: number;
  connections: {
    active: number;
    idle: number;
    total: number;
  };
  last_check: Date;
}

/**
 * Options for executing stored procedures
 */
export interface ExecuteStoredProcedureOptions {
  logParams?: boolean;
  timeoutMs?: number;
}

/**
 * Standardized database result wrapper
 */
export interface DatabaseResult<T = unknown> {
  data: T | null;
  error: {
    message: string;
    originalError?: unknown;
  } | null;
}