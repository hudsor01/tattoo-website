# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tattoo website built with Next.js 15, featuring a client portal, admin dashboard, and booking system.

## Tech Stack

- **Framework**: Next.js 15.3.2 (App Router)
- **Language**: TypeScript 5.8.3
- **UI Components**: Material UI v7, shadcn/ui, Tailwind CSS v4
- **Authentication**: Supabase Auth
- **Database**: SQLite (development) with Prisma ORM
- **API Layer**: tRPC v11
- **State Management**: Zustand v5
- **Data Fetching**: TanStack Query v5 with tRPC integration
- **Email**: Resend
- **Payments**: Stripe
- **Validation**: Zod

## Development Commands

```bash
# Start development server
npm run dev
npm run dev:clean                  # Clean start (removes .next cache)

# Build for production
npm run build
npm start

# Type checking & linting
npm run type-check                 # TypeScript type checking
npm run lint                       # ESLint
npm run lint:fix                   # ESLint with auto-fix
npm run format                     # Prettier formatting
npm run validate                   # Combined lint + type check

# Testing
npm test                           # Run all tests
npm run test:unit                  # Unit tests only
npm run test:single <path>         # Run a single test

# E2E Testing with Playwright
npm run test:e2e                   # Standard E2E tests
npm run test:e2e:ui                # With Playwright UI
npm run test:e2e:debug             # Debug mode
npm run test:e2e:headed            # Headed browser
npm run test:e2e:chrome            # Chrome only
npm run test:e2e:smoke             # Smoke tests (@smoke tag)
npm run test:e2e:quick             # Quick test configuration

# Enhanced E2E Testing
npm run test:e2e:enhanced          # Enhanced test suite
npm run test:e2e:enhanced:visual   # Visual regression testing
npm run test:e2e:enhanced:perf     # Performance testing
npm run test:e2e:report            # View test report

# Database
npx prisma migrate dev             # Run migrations in development
npx prisma migrate reset           # Reset database
npx prisma generate                # Generate Prisma client
npx prisma studio                  # Open Prisma Studio GUI

# CI/CD specific
npm run test:e2e:ci                # E2E tests for CI environment
npm run postinstall                # Runs prisma generate automatically

# Utilities
npm run verify-mcp                 # Verify MCP servers
npm run apply-view-fix             # Apply necessary database view fixes
npm run fix-fonts                  # Fix font loading issues
```

## Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `DATABASE_URL` - SQLite database path (e.g., file:./prisma/dev.db)
- `RESEND_API_KEY` - Resend API key for emails
- `STRIPE_SECRET_KEY` - Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_APP_URL` - Base URL (http://localhost:3000 in dev)
- `CAL_API_KEY` - Cal.com API key for booking integration
- `CAL_WEBHOOK_SECRET` - Cal.com webhook secret

## Architecture Overview

### Component Architecture (Next.js 15 App Router)

The project uses Next.js 15 App Router with React 19:

1. **Server Components** (default) - Cannot use browser APIs or React hooks
2. **Client Components** - Must add `'use client'` directive at the top of the file

Common error: Importing `next/headers` in a Client Component will fail. This must only be used in Server Components.

### API Architecture (tRPC)

The API layer uses tRPC for type-safe communication between client and server:

1. **Routers**: Organized by feature in `/src/lib/trpc/routers/`
   - `booking-router.ts` - Booking management
   - `gallery-router.ts` - Gallery operations
   - `admin-router.ts` - Admin operations
   - `user-router.ts` - User management
   - `subscription-router.ts` - Subscription handling
   - `analytics-router.ts` - Analytics tracking

2. **Main Router**: Combined in `/src/lib/trpc/app-router.ts`

3. **Client Setup**: Initialized in `/src/lib/trpc/client.tsx`

4. **Server Setup**: Configured in `/src/lib/trpc/server.ts`

### Authentication Architecture

The project uses a unified authentication system:

1. **Main Auth System**: `/src/lib/auth/auth-system.ts`
2. **Middleware Protection**: `/src/middleware.ts` 
3. **Server Auth**: `/src/lib/supabase/server-auth.ts`
4. **Role-based Access**: public, protected, admin

### State Management

- **Server State**: TanStack Query + tRPC
- **Client State**: Zustand stores in `/src/store/`
- **Form State**: react-hook-form with Zod validation

## Common Development Tasks

### Working with Prisma and Database

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name description_of_change

# Push schema changes without migration (development only)
npx prisma db push

# Open database GUI
npx prisma studio

# Reset database and reapply all migrations
npx prisma migrate reset
```

### Adding New tRPC Procedures

When creating new API endpoints:

1. Add router in `/src/lib/trpc/routers/` (e.g., `new-feature-router.ts`)
2. Import and add to app router in `/src/lib/trpc/app-router.ts`
3. Create hooks in `/src/hooks/trpc/` (e.g., `use-new-feature.ts`)
4. Use Zod schemas from `/src/lib/validations/`
5. Types should be imported from `/src/types/`

### File Organization

- **Components**: `/src/components/` - Organized by feature
- **Hooks**: `/src/hooks/` - Custom React hooks and tRPC hooks
- **API Routes**: `/src/app/api/` - Next.js API routes
- **tRPC Routers**: `/src/lib/trpc/routers/` - Type-safe API
- **Database**: `/src/lib/db/` - Database utilities and queries
- **Types**: `/src/types/` - All TypeScript types (never in components)
- **Validations**: `/src/lib/validations/` - Zod schemas
- **Emails**: `/src/emails/` - React Email templates

### Type Organization Rules

All types must be imported from `/src/types/`:
```typescript
// ✅ Correct
import { BookingType } from '@/types/booking-types';
import { UserRole } from '@/types/enum-types';

// ❌ Wrong - defining types in component files
interface BookingType { ... }
enum UserRole { ... }
```

## Performance Considerations

1. Use Server Components by default
2. Implement proper React Query caching strategies
3. Use Next.js Image component for optimization
4. Lazy load heavy components with dynamic imports
5. Implement virtualization for long lists

## Security Best Practices

1. All user inputs validated with Zod schemas
2. Authentication checks in middleware
3. Role-based access control implemented  
4. Environment variables for sensitive data
5. Server-only operations in Server Components

## Testing Strategy

Run tests in this order:
1. Type checking: `npm run type-check`
2. Linting: `npm run lint`
3. Unit tests: `npm run test:unit`
4. E2E tests: `npm run test:e2e`

For development, use the UI versions:
- `npm run test:e2e:ui` - Interactive Playwright UI
- `npm run test:e2e:debug` - Step through tests

## Common Issues and Solutions

### "next/headers" Import Error
This error occurs when trying to use server-only features in Client Components:
```
× You're importing a component that needs "next/headers"
```
**Solution**: Remove `'use client'` directive or move the logic to a Server Component.

### Hydration Errors
These occur when server and client renders don't match.
**Solutions**:
- Use `suppressHydrationWarning` on problematic elements
- Ensure consistent data between server/client
- Use dynamic imports for client-only components

### Type Errors with Prisma
After schema changes:
```bash
npx prisma generate  # Regenerate types
npm run type-check   # Verify types are correct
```

### Build Errors
When builds fail:
```bash
rm -rf .next         # Clear Next.js cache
npm run dev:clean    # Fresh development start
npx prisma generate  # Ensure Prisma client is up-to-date
```

## Deployment Notes

- Build outputs to standalone mode for optimal deployment
- ESLint errors are ignored during builds (check manually with `npm run lint`)
- TypeScript errors are ignored during builds (check manually with `npm run type-check`)
- Database migrations must be run manually in production
- All environment variables must be set in deployment platform

## Git Hooks & CI

The project uses Husky for pre-commit hooks with lint-staged:
- Automatically runs ESLint and Prettier on staged files
- Files are formatted before commit

## Key Configuration Files

- `/src/middleware.ts` - Route protection and auth checks
- `/src/lib/trpc/app-router.ts` - Main tRPC router configuration
- `/src/lib/auth/auth-system.ts` - Unified authentication system
- `/src/app/api/trpc/[trpc]/route.ts` - tRPC API endpoint
- `/src/lib/supabase/server.ts` - Server-side Supabase client
- `/prisma/schema.prisma` - Database schema definition
- `/eslint.config.mjs` - ESLint configuration
- `/tailwind.config.js` - Tailwind CSS configuration
- `/tsconfig.json` - TypeScript configuration

Remember: No barrel files (`index.ts`), types always in `/src/types/`, and follow the established patterns for consistency.