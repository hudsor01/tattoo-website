/**
 * Prisma client singleton
 * 
 * This file ensures that there's only a single Prisma Client instance in the app,
 * even during hot reloading in development.
 */
import { PrismaClient } from '@prisma/client';
import { logger } from '../logger';

// Create a global variable to store the client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Initialize the Prisma client - reuse if available in dev mode
const prismaClient = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Add connection management for production use
if (prismaClient.$connect) {
  prismaClient.$connect()
    .then(() => {
      if (process.env.NODE_ENV === 'development') {
        void logger.info('Successfully connected to database');
      }
    })
    .catch((err) => {
      void logger.error('Failed to connect to database:', err);
    });
}

// Handle shutdown gracefully
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    prismaClient.$disconnect().catch(err => {
      void logger.error('Error disconnecting from database:', err);
    });
  });
}

// Export the Prisma client
export const prisma = prismaClient;

// Make sure we keep the same client in dev mode
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;