/**
 * Database Types
 * 
 * Type definitions related to database operations and Prisma.
 */

import type { PrismaClient } from '@prisma/client';

/**
 * ========================================================================
 * PRISMA TYPES
 * ========================================================================
 */

/**
 * Main Prisma client type
 */
export type Database = PrismaClient;

/**
 * Prisma transaction type
 */
export type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * ========================================================================
 * QUERY TYPES
 * ========================================================================
 */

/**
 * Base query options
 */
export interface BaseQueryOptions {
  skip?: number;
  take?: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

/**
 * Search query options
 */
export interface SearchQueryOptions extends BaseQueryOptions {
  search?: string;
  filters?: Record<string, unknown>;
}

/**
 * Date range query options
 */
export interface DateRangeOptions {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Pagination result wrapper
 */
export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * ========================================================================
 * UTILITY TYPES
 * ========================================================================
 */

/**
 * Database ID type (matching Prisma's default)
 */
export type DatabaseId = number;

/**
 * Timestamp fields that exist on most models
 */
export interface TimestampFields {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Soft delete fields
 */
export interface SoftDeleteFields {
  deletedAt: Date | null;
}

/**
 * Common model fields
 */
export interface BaseModel extends TimestampFields {
  id: DatabaseId;
}

/**
 * Base entity interface (alias for BaseModel)
 */
export type BaseEntity = BaseModel

/**
 * ========================================================================
 * OPERATION TYPES
 * ========================================================================
 */

/**
 * Database operation result
 */
export type DatabaseResult<T> = Promise<T>;

/**
 * Database error types
 */
export interface DatabaseError extends Error {
  code?: string;
  details?: unknown;
}

/**
 * ========================================================================
 * EXPORT PRISMA TYPES
 * ========================================================================
 */

// Re-export commonly used Prisma types
export type {
  User,
  Booking,
  Appointment,
  Customer,
  Payment,
  Artist,
  TattooDesign,
  Contact,
  Lead,
  Tag,
  Transaction,
} from '@prisma/client';

// Export Prisma namespace for advanced types
export { Prisma } from '@prisma/client';