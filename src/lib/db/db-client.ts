import { prisma } from '@/lib/prisma';

// Re-export the prisma client for use by other modules
export { prisma };

export const dbClient = {
  query: () => Promise.resolve(null),
}