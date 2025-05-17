/**
 * Direct tRPC Exports
 * 
 * This file provides direct exports of tRPC functionalities without using barrel files.
 * By importing directly from source files, we reduce the bundle size and avoid unnecessary
 * module inclusion in the client bundle.
 */

// Client-side exports
export { trpc, TRPCProvider } from './client';

// Server-side exports
export { 
  publicProcedure, 
  protectedProcedure, 
  adminProcedure, 
  router, 
  middleware 
} from './server';

// Server Component helpers
export { 
  serverTRPC, 
  prefetchTRPCQuery, 
  serverActionHandler 
} from './server-action';

// Context creators
export { 
  createTRPCContext, 
  createContextForRSC 
} from './context';
