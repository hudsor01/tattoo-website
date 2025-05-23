import { createTRPCReact } from '@trpc/react-query'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from './server'

export const trpc = createTRPCReact<AppRouter>()

// add this so you can import RouterOutputs elsewhere
export type RouterOutputs = inferRouterOutputs<AppRouter>