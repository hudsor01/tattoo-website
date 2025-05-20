/**
 * tRPC Server Core
 * 
 * This file re-exports the unified tRPC implementation for server-side use.
 */
import 'server-only';

// Import from procedures
export {
  router,
  middleware,
  publicProcedure,
  protectedProcedure,
  adminProcedure
} from './procedures';

// Import server-specific items from trpc.ts
export { createRootRouter } from './trpc';

// Export the appRouter directly from app-router for use in API handlers
export { appRouter, type AppRouter } from './app-router';