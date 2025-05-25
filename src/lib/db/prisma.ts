import { PrismaClient } from '@prisma/client';

// Create a global variable to store the Prisma client instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a new Prisma client instance or use the existing one
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// In development, save the client to avoid multiple instances
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Execute a stored procedure with parameters
 */
export async function executeStoredProcedure<T = unknown>(
  procedureName: string,
  params: unknown[] = []
): Promise<T> {
  try {
    // Format parameters for SQL query
    const paramPlaceholders = params.map((_, index) => `$${index + 1}`).join(', ');
    const query = `SELECT * FROM ${procedureName}(${paramPlaceholders})`;
    
    // Execute the query with parameters
    const result = await prisma.$queryRawUnsafe(query, ...params);
    
    // Return the first result or the entire result set
    if (Array.isArray(result) && result.length > 0) {
      return result[0] as T;
    }
    return result as T;
  } catch (error) {
    void console.error(`Error executing stored procedure ${procedureName}:`, error);
    throw error;
  }
}