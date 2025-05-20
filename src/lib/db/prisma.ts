import { PrismaClient } from '@prisma/client';

// Create a global variable to store the Prisma client instance
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a new Prisma client instance or use the existing one
export const prisma = globalForPrisma.prisma || new PrismaClient();

// In development, save the client to avoid multiple instances
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;