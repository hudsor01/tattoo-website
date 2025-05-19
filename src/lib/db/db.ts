/**
 * Database Layer
 * 
 * This file exports the complete database access layer, including
 * clients, functions, and types directly (no barrel files).
 * 
 * IMPORTANT: This is now the primary entry point for all database access.
 * Import directly from here rather than individual files.
 */

// Export Prisma and core utilities
export * from './prisma';

// Export Supabase client (only thing needed from db-client.ts)
export { createSupabaseClient } from './db-client';

// Export database types
export * from './database.types';

// Export function execution utilities
export { executeDbFunction } from './db-execute';

// Export database functions
export * from './db-appointments';
export * from './db-pricing';
export * from './functions';