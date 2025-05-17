/**
 * Prisma Client Singleton
 * 
 * This file provides a single instance of the Prisma client to be used
 * throughout the application. It helps prevent connection issues in
 * development by ensuring we don't create too many connections.
 */
import { PrismaClient } from '@prisma/client';

// Global variable to store the client instance
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with additional options
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// In development, attach to global to prevent connection pool issues
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Execute a raw SQL query
 */
export async function rawQuery<T = unknown>(query: string, params: unknown[] = []): Promise<T[]> {
  try {
    return await prisma.$queryRawUnsafe<T[]>(query, ...params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a stored procedure
 */
export async function executeStoredProcedure<T = unknown>(
  procedure: string,
  params: unknown[] = [],
): Promise<T> {
  try {
    // Call a database function/procedure using correct parameter syntax
    const result = await prisma.$queryRawUnsafe<T[]>(
      `SELECT * FROM ${procedure}(${params.map((_, i) => `$${i + 1}`).join(', ')})`,
      ...params,
    );

    // If result is an array with a single item, return just that item
    if (Array.isArray(result) && result.length === 1) {
      return result[0] as unknown as T;
    }

    // Otherwise return the full result
    return result as unknown as T;
  } catch (error) {
    console.error(`Error executing ${procedure}:`, error);
    throw error;
  }
}

/**
 * Execute a callback within a transaction
 */
export async function withTransaction<T>(
  callback: (
    tx: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(callback);
}
