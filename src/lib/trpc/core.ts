/**
 * tRPC Core
 * 
 * This file contains core tRPC functionality without server-only imports
 * This file is restricted to server-side usage only.
 */

'use server';

import { initTRPC } from '@trpc/server';
import type { Context } from './context';

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof Error ? error.cause : null,
    },
  }),
});

// Export reusable router and procedure helpers
export const router = t.router;
export const middleware = t.middleware;
export const createRootRouter = t.router;