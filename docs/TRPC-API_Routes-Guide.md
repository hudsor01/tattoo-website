# tRPC Implementation Guide

## Overview

Comprehensive tRPC implementation with type-safe API layer, authentication middleware, and modular architecture for the tattoo website project.

## Architecture Overview

The tRPC implementation follows a client-server architecture with full type-safety across all API calls:

1. **Client-Side**: React components use tRPC hooks for type-safe data fetching
2. **Server-Side**: Server components can directly call tRPC procedures
3. **API Layer**: All procedures defined in routers with validation and error handling
4. **Authorization**: Role-based access control with middleware for public, protected, and admin routes

## Directory Structure

```
src/
├── lib/
│   └── trpc/
│       ├── api-router.ts           # Client-safe type exports
│       ├── app-router.ts           # Main router aggregation (server-only)
│       ├── client.ts               # Client creation for React components
│       ├── client-provider.tsx     # React provider for client components
│       ├── context.ts              # Context creation with auth integration
│       ├── procedures.ts           # Procedures and middleware definitions
│       ├── server-action.ts        # Direct tRPC integration for Server Components
│       └── routers/                # Feature-specific routers
│           ├── gallery-router.ts
│           ├── admin/              # Modularized admin router
│           │   ├── main-router.ts  # Aggregates admin sub-routers
│           │   ├── metrics-router.ts
│           │   ├── notes-router.ts
│           │   └── users-router.ts
│           ├── dashboard/          # Modularized dashboard router
│           │   ├── activity-router.ts
│           │   ├── appointments-router.ts
│           │   ├── contacts-router.ts
│           │   └── stats-router.ts
│           ├── dashboard-router.ts # Aggregates dashboard sub-routers
│           └── [other feature routers]
├── types/
│   └── trpc-types.ts               # Centralized tRPC type definitions
└── app/
    └── api/
        └── trpc/
            └── [trpc]/
                └── route.ts        # API endpoint handler
```

## Key Components

### 1. Types (`/src/types/trpc-types.ts`)
Centralized type definitions for all tRPC functionality:
```typescript
// Router input/output types
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Specific router types for better organization
export type GalleryRouter = typeof galleryRouter;
export type AdminRouter = typeof adminRouter;
export type DashboardRouter = typeof dashboardRouter;
```

### 2. API Router (`/src/lib/trpc/api-router.ts`)
Client-safe type exports preventing 'server-only' import errors:
```typescript
import type { AppRouter } from './app-router';
export type { AppRouter };
```

### 3. App Router (`/src/lib/trpc/app-router.ts`)
Server-only main router aggregating all feature routers:
```typescript
export const appRouter = createTRPCRouter({
  gallery: galleryRouter,
  admin: adminRouter,
  dashboard: dashboardRouter,
  calAnalytics: calAnalyticsRouter,
  // ... other routers
});

export type AppRouter = typeof appRouter;
```

### 4. Procedures (`/src/lib/trpc/procedures.ts`)
Three-tier authentication system:
```typescript
// Public access - no authentication required
export const publicProcedure = t.procedure;

// Protected access - requires authentication
export const protectedProcedure = t.procedure
  .use(protectedMiddleware);

// Admin access - requires admin role
export const adminProcedure = t.procedure
  .use(protectedMiddleware)
  .use(adminMiddleware);
```

### 5. Context (`/src/lib/trpc/context.ts`)
Context creation with Better Auth integration:
```typescript
export const createTRPCContext = async (opts: CreateTRPCContextOptions) => {
  const { session, user } = await auth.api.getSession({ 
    headers: opts.req.headers 
  });

  return {
    user,
    userId: user?.id,
    userEmail: user?.email,
    session,
    prisma,
  };
};
```

### 6. Client (`/src/lib/trpc/client.ts`)
Single source of truth for client-side tRPC:
```typescript
export const trpc = createTRPCReact<AppRouter>();
export const api = trpc; // Compatibility alias

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
      }),
    ],
  });
}
```

### 7. Server Actions (`/src/lib/trpc/server-action.ts`)
Utilities for server-side tRPC usage:
```typescript
export async function serverTRPC() {
  const context = await createTRPCContextRSC();
  return appRouter.createCaller(context);
}

export async function prefetchTRPCQuery<TInput, TOutput>(
  route: string,
  input: TInput
): Promise<TOutput> {
  const caller = await serverTRPC();
  return getNestedProperty(caller, route)(input);
}
```

## Authentication & Authorization

### Authentication Levels

1. **Public** (`publicProcedure`)
   - Accessible without authentication
   - Used for public data like gallery items or FAQs

2. **Protected** (`protectedProcedure`)
   - Requires user authentication
   - Checks for valid session and user ID

3. **Admin** (`adminProcedure`)
   - Requires admin role
   - Includes full role-based access control

### Authentication Implementation
```typescript
const adminMiddleware = middleware(async ({ ctx, next }) => {
  // First ensure user is authenticated
  if (!ctx.userId || !ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  // Then check if user has admin role
  const hasAdminRole = ctx.user.role === 'admin';
  
  if (!hasAdminRole) {
    void logger.warn('Admin access attempt denied', {
      userId: ctx.userId,
      userEmail: ctx.userEmail,
      action: 'admin_access_denied',
    });
    
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      isAdmin: true,
    },
  });
});
```

## Router Organization

### Feature-Oriented Structure
- Organize routers by domain/feature
- Break large routers into sub-routers (admin/ and dashboard/)
- Use main router to aggregate sub-routers

### Modular Admin Router
```typescript
// /src/lib/trpc/routers/admin/main-router.ts
export const adminRouter = createTRPCRouter({
  notes: notesRouter,
  metrics: metricsRouter,
  users: usersRouter,
});
```

### Procedure Naming Conventions
- Use consistent verb prefixes: get, create, update, delete
- Include entity name: getUsers, createUser, updateUser
- Be specific about action: pinNote, approveDesign

## Usage Patterns

### Client Components
```tsx
'use client';
import { trpc } from '@/lib/trpc/client';
import type { RouterInputs, RouterOutputs } from '@/types/trpc-types';

export function MyComponent() {
  // Query with type safety
  const { data, isLoading } = trpc.gallery.getAll.useQuery();
  
  // Mutation with optimistic updates
  const addNote = trpc.admin.notes.add.useMutation({
    onMutate: async (newNote) => {
      // Optimistic update logic
      await utils.admin.notes.getAll.cancel();
      
      const previousNotes = utils.admin.notes.getAll.getData();
      
      utils.admin.notes.getAll.setData(undefined, (old) => 
        old ? [...old, { ...newNote, id: 'temp' }] : [{ ...newNote, id: 'temp' }]
      );
      
      return { previousNotes };
    },
    onError: (err, newNote, context) => {
      // Rollback on error
      utils.admin.notes.getAll.setData(undefined, context?.previousNotes);
    },
    onSettled: () => {
      // Refetch after mutation
      utils.admin.notes.getAll.invalidate();
    },
  });
  
  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button onClick={() => addNote.mutate({ content: 'New note' })}>
        Add Note
      </button>
    </div>
  );
}
```

### Server Components
```tsx
import { serverTRPC } from '@/lib/trpc/server-action';
import type { RouterOutputs } from '@/types/trpc-types';

export default async function MyServerComponent() {
  const trpc = await serverTRPC();
  const data = await trpc.gallery.getAll();
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Server Actions
```tsx
'use server';
import { executeServerMutation } from '@/lib/trpc/server-action';
import type { RouterInputs } from '@/types/trpc-types';

export async function addCustomerNote(
  data: RouterInputs['admin']['notes']['add']
) {
  return executeServerMutation('admin.notes.add', data);
}
```

## Error Handling

### Standardized Error Pattern
```typescript
try {
  // Operation that might fail
  const result = await prisma.user.create({ data: input });
  return result;
} catch (error) {
  // Log the error with context
  void logger.error('User creation failed', {
    error,
    input,
    userId: ctx.userId,
  });
  
  // Preserve original tRPC errors
  if (error instanceof TRPCError) {
    throw error;
  }
  
  // Convert other errors to tRPC errors
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Failed to create user',
    cause: error,
  });
}
```

### Prisma Error Handling
```typescript
catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A user with this email already exists',
      });
    }
  }
  // ... other error handling
}
```

## Input Validation

### Zod Schema Usage
```typescript
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  role: z.enum(['user', 'artist', 'admin']).default('user'),
});

export const usersRouter = createTRPCRouter({
  create: adminProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      // Input is fully typed and validated
      return await ctx.prisma.user.create({
        data: input,
      });
    }),
});
```

### Reusable Schemas
```typescript
// /src/lib/validation-schemas.ts
export const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['user', 'artist', 'admin']),
});

export const paginationSchema = z.object({
  take: z.number().min(1).max(100).default(10),
  skip: z.number().min(0).default(0),
});
```

## Performance Considerations

### Caching Strategy
- Configure appropriate staleTime and cacheTime values
- Use TanStack Query's caching capabilities
- Implement cache invalidation strategies

### Batch Requests
- tRPC automatically batches requests for efficiency
- Use Promise.all for parallel database queries
- Optimize database queries with proper indexing

### Prefetching
```typescript
// Prefetch critical data in Server Components
export default async function HomePage() {
  const trpc = await serverTRPC();
  
  // Prefetch gallery data
  const designs = await trpc.gallery.getPublicDesigns({
    limit: 10,
  });
  
  return <GalleryClient initialData={designs} />;
}
```

## Security Considerations

### Input Validation
- Validate all inputs with Zod schemas
- Sanitize user-provided content
- Use parameterized queries (Prisma handles this)

### Authorization Checks
- Always verify user permissions before operations
- Implement proper role checks in middleware
- Use resource-level permissions where needed

### Error Handling
- Never expose internal error details to clients
- Sanitize error messages in production
- Log security events for monitoring

## Advanced Features

### Rate Limiting
```typescript
// Implement rate limiting middleware
const rateLimitMiddleware = middleware(async ({ ctx, next }) => {
  const identifier = ctx.userId || ctx.req.ip;
  
  if (await isRateLimited(identifier)) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded',
    });
  }
  
  return next();
});
```

### Caching Integration
```typescript
// Cache frequently accessed data
const getCachedData = async (key: string) => {
  const cached = await cache.get(key);
  if (cached) return cached;
  
  const data = await fetchFromDatabase();
  await cache.set(key, data, { ttl: 300 }); // 5 minutes
  return data;
};
```

### Analytics Integration
```typescript
// Track API usage
const analyticsMiddleware = middleware(async ({ ctx, next, path }) => {
  const start = Date.now();
  
  try {
    const result = await next();
    
    await trackAPICall({
      path,
      userId: ctx.userId,
      duration: Date.now() - start,
      success: true,
    });
    
    return result;
  } catch (error) {
    await trackAPICall({
      path,
      userId: ctx.userId,
      duration: Date.now() - start,
      success: false,
      error: error.message,
    });
    
    throw error;
  }
});
```

## Testing

### Unit Tests
```typescript
import { createTRPCMsw } from 'msw-trpc';
import { appRouter } from '@/lib/trpc/app-router';

const trpcMsw = createTRPCMsw(appRouter);

// Mock tRPC procedures for testing
const handlers = [
  trpcMsw.gallery.getAll.query(() => {
    return [
      { id: '1', name: 'Test Design', approved: true },
    ];
  }),
];
```

### Integration Tests
```typescript
// Test with actual tRPC caller
const caller = appRouter.createCaller({
  user: mockUser,
  userId: 'test-user-id',
  prisma: mockPrisma,
});

const result = await caller.gallery.getAll();
expect(result).toHaveLength(1);
```

## Migration & Improvements

### Recent Improvements
1. **Type Consolidation**: All tRPC types moved to `/src/types/trpc-types.ts`
2. **Client Consolidation**: Single source of truth in `client.ts`
3. **Logger Integration**: Replaced console.log with structured logger
4. **Modular Admin Router**: Reorganized into specialized sub-routers
5. **Server Component Integration**: Improved direct procedure calling
6. **Error Handling**: Standardized error patterns across all routers

### Migration from Previous Implementation
1. **Modularized Structure**: Split large routers into focused sub-routers
2. **Proper Authentication**: Added admin middleware with role checks
3. **Centralized Types**: Prevented server-only import errors
4. **Real Functionality**: Replaced stub implementations with actual database queries

## Best Practices

### Router Development
1. **Validation**: Use Zod schemas for all input validation
2. **Error Handling**: Consistent error patterns with proper logging
3. **Middleware**: Use middleware for cross-cutting concerns
4. **Types**: Import types from `/src/types/trpc-types.ts`
5. **Single Source of Truth**: Client created only in `client.ts`
6. **Role-Based Access**: Use appropriate procedures based on access requirements

### Performance
1. **Optimize Database Queries**: Use proper indexing and query optimization
2. **Implement Caching**: Cache frequently accessed data
3. **Use Batching**: Leverage tRPC's automatic request batching
4. **Monitor Performance**: Track response times and error rates

### Security
1. **Validate Everything**: Comprehensive input validation
2. **Least Privilege**: Minimal required permissions
3. **Audit Trails**: Log important security events
4. **Rate Limiting**: Prevent abuse and DoS attacks

The tRPC implementation provides a robust, type-safe, and scalable API layer that ensures excellent developer experience while maintaining security and performance! 🎯