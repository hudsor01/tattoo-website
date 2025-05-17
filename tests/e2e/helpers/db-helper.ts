/**
 * Database helper functions for E2E tests
 */
import { PrismaClient } from '@prisma/client';

// Create a singleton Prisma client to reuse across tests
let prismaClient: PrismaClient | null = null;

/**
 * Get a shared Prisma client instance
 */
export function getPrisma(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }
  return prismaClient;
}

/**
 * Connect to the database
 */
export async function connectToDatabase() {
  const prisma = getPrisma();
  await prisma.$connect();
  return prisma;
}

/**
 * Disconnect from the database
 */
export async function disconnectFromDatabase() {
  if (prismaClient) {
    await prismaClient.$disconnect();
    prismaClient = null;
  }
}

/**
 * Clean specific test data from the database
 * @param testId Identifier for the test data to clean up
 */
export async function cleanupTestData(testId: string) {
  const prisma = getPrisma();

  // Delete test appointments
  await prisma.appointment.deleteMany({
    where: {
      notes: {
        contains: testId,
      },
    },
  });

  // Delete test bookings
  await prisma.booking.deleteMany({
    where: {
      description: {
        contains: testId,
      },
    },
  });

  // Delete test customers
  await prisma.customer.deleteMany({
    where: {
      notes: {
        contains: testId,
      },
    },
  });

  // Delete test gallery items
  await prisma.galleryItem.deleteMany({
    where: {
      description: {
        contains: testId,
      },
    },
  });

  // Delete test payments
  await prisma.payment.deleteMany({
    where: {
      notes: {
        contains: testId,
      },
    },
  });
}

/**
 * Execute a raw SQL query
 * @param sql SQL query to execute
 * @param params Parameters for the query
 */
export async function executeRawQuery(sql: string, params: unknown[] = []) {
  const prisma = getPrisma();
  return prisma.$queryRawUnsafe(sql, ...params);
}

/**
 * Get database table schema
 * @param tableName Name of the table to get schema for
 */
export async function getTableSchema(tableName: string) {
  const prisma = getPrisma();
  const schema = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${tableName}
    ORDER BY ordinal_position;
  `;
  return schema;
}

/**
 * Count records in a table
 * @param tableName Name of the table to count records in
 * @param whereClause Optional WHERE clause for the query
 */
export async function countRecords(tableName: string, whereClause?: string) {
  const prisma = getPrisma();
  const query = `SELECT COUNT(*) FROM "${tableName}"${whereClause ? ` WHERE ${whereClause}` : ''}`;
  const result = await prisma.$queryRawUnsafe(query);
  return parseInt(result[0].count, 10);
}

/**
 * Run a database function
 * @param functionName Name of the function to run
 * @param params Parameters for the function
 */
export async function runDatabaseFunction(functionName: string, params: unknown[] = []) {
  const prisma = getPrisma();
  const paramsPlaceholders = params.map((_, i) => `$${i + 1}`).join(', ');
  const query = `SELECT * FROM ${functionName}(${paramsPlaceholders})`;
  return prisma.$queryRawUnsafe(query, ...params);
}
