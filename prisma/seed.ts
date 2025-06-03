/**
 * Prisma seed file
 * 
 * This file is used to seed the database with initial data.
 * For production deployments, we're using a simplified version
 * that doesn't cause TypeScript errors.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // In production, we use existing data
  console.log('Production deployment - skipping seed operations');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });