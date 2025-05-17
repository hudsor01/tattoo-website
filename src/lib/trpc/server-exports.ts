/**
 * Server-only tRPC Exports
 * 
 * This file provides direct exports of server-side tRPC functionalities.
 * These exports are only used in server components and API routes.
 */

// Server-side utilities
export { 
  createTRPCContext, 
  createContextForRSC 
} from './context';

// Router types and instances
export { appRouter, type AppRouter } from './app-router';

// Server action handlers
export { 
  serverTRPC, 
  prefetchTRPCQuery, 
  serverActionHandler 
} from './server-action';

// Server procedure creators
export { 
  publicProcedure, 
  protectedProcedure, 
  adminProcedure, 
  router, 
  middleware 
} from './server';
