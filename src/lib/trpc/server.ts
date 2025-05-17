/**
 * tRPC Server Core
 * 
 * This file re-exports the unified tRPC implementation for server-side use.
 */

export {
  router,
  middleware,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  createRootRouter
} from './unified';

export type { Router } from './unified';

// Export the appRouter for use in API handlers
export { appRouter, type AppRouter } from './api-router';