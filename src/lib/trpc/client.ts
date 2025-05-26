import { createTRPCReact } from '@trpc/react-query';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from './app-router';

export const trpc = createTRPCReact<AppRouter>();
export const api = trpc; // Export alias for compatibility

// add this so you can import RouterOutputs elsewhere
export type RouterOutputs = inferRouterOutputs<AppRouter>;
