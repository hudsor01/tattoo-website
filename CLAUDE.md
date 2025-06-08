# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Professional tattoo studio website with Next.js 15, featuring client portal, admin dashboard, Cal.com booking integration, and real-time analytics.

## Development Commands

```bash
# Development
npm run dev                              # Start development server (port 3000)

# Quality Checks (REQUIRED before commits)
npm run type-check                       # TypeScript validation
npm run lint                            # ESLint validation
npm run lint:fix                        # Auto-fix ESLint issues
npm run build                           # Production build (includes lint + type-check + prisma generate)

# Database Management
npx prisma db push                      # Push schema changes (dev only)
npx prisma migrate dev --name <name>    # Create migration
npx prisma migrate reset                # Reset database (dev only!)
npx prisma generate                     # Generate Prisma client
npx prisma studio                       # Open database GUI

# Testing
npm run test:e2e                        # Run all Playwright E2E tests
npm run test:e2e:ui                     # Playwright test UI
npm run test:e2e:auth                   # Run auth-specific tests
npx playwright test --debug             # Debug mode
npx playwright test <filename>          # Run single test file

# Cal.com Data Sync
npm run cal:sync                        # Sync Cal.com data to local database

# Bundle Analysis
npm run build:analyze                   # Analyze bundle size with @next/bundle-analyzer
```

## Critical Architecture: Prisma-First Type System

**MANDATORY**: All types MUST be imported from Prisma. Manual type definitions are FORBIDDEN.

```typescript
// ✅ CORRECT - Import from Prisma
import { Customer, Payment, CalBooking, Booking } from '@prisma/client';
import type { CustomerCreateInput, PaymentWithRelations } from '@/lib/prisma-types';

// ❌ FORBIDDEN - Never create manual types
interface CustomerType { ... }  // ESLint will block this
```

**Type Usage Process:**
1. Check if type exists in `@prisma/client`
2. Check if type exists in `@/lib/prisma-types`
3. If not found: Add to `prisma/schema.prisma`, run `npx prisma db push` then `npx prisma generate`
4. NEVER use `any`, `unknown`, or create manual types

**ESLint Enforcement:**
- `no-restricted-imports` rule blocks manual type definitions
- Exceptions: UI component types from `@/types/components` are allowed
- Forces use of `@prisma/client` and `@/lib/prisma-types`

## High-Level Architecture

### Next.js 15 App Router Structure
```
/src/app/                    # App Router root
├── api/                     # API routes
├── (public routes)/         # No auth required
├── admin/                   # Admin routes (role-based)
├── auth/                    # Authentication pages
└── providers.tsx            # Client providers wrapper
```

### Admin Dashboard Migration
The admin dashboard is being migrated from `/app/admin/*` to `/src/admin-dashboard/*`:
- Old location: `/src/app/admin/` (being phased out)
- New location: `/src/admin-dashboard/` (feature-based structure)
- Both locations work during migration

### API Layer (REST + TanStack Query)
**No tRPC** - Uses native Next.js API routes with TanStack Query for client-side state management.

**API Route Structure:**
```
/src/app/api/
├── admin/           # Protected admin endpoints
│   ├── analytics/   # Dashboard metrics, booking times
│   ├── appointments/# CRUD operations
│   ├── customers/   # Customer management
│   └── payments/    # Payment tracking
├── auth/           # Better Auth endpoints
├── cal/            # Cal.com integration
├── bookings/       # Public booking endpoints
├── gallery/        # Portfolio management
└── webhooks/       # External service hooks
```

**Data Fetching Pattern:**
```typescript
// Custom hook with TanStack Query
export function useAdminDashboard(params = {}) {
  return useQuery({
    queryKey: ['admin-dashboard', params],
    queryFn: () => fetchAdminDashboard(params),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
```

### Authentication (Better Auth)
- **Provider**: Better Auth with Prisma adapter
- **OAuth**: Google provider configured
- **Auto-Admin Emails**: `fennyg83@gmail.com`, `ink37tattoos@gmail.com`
- **Session Storage**: Database sessions with JWT tokens
- **Route Protection**: Middleware + page-level auth checks
- **Client Hooks**: `useUser()`, `useIsAdmin()`, `useAuthState()`

### Database Models (Prisma)
**Core Models:**
- `User` - Authentication and roles
- `Customer` - Client information
- `Booking` - Unified booking (website + Cal.com)
- `TattooDesign` - Portfolio/gallery items
- `Payment` - Payment tracking
- `Contact` - Form submissions

**Analytics Models:**
- `CalAnalyticsEvent` - Event tracking
- `CalBookingFunnel` - Conversion tracking
- `CalServiceAnalytics` - Service performance
- `CalRealtimeMetrics` - Live dashboard data

### State Management
- **Server State**: TanStack Query (no tRPC)
- **Form State**: react-hook-form + Zod
- **Auth State**: Better Auth hooks
- **Client State**: Zustand (when needed)

### Build Configuration
- **Webpack**: Filesystem cache with gzip
- **Code Splitting**: Specialized chunks (framework, radix, tanstack, commons)
- **Package Optimization**: 20+ packages in `optimizePackageImports`
- **Security Headers**: CSP, X-Frame-Options, HSTS-ready
- **Memory**: Increased Node.js heap for large builds

## Security Implementation

- **Input Validation**: Zod schemas on all endpoints
- **Rate Limiting**: Database-backed rate limiter
- **CORS**: Configured allowed origins
- **CSP Headers**: Strict Content Security Policy
- **Auth Protection**: Middleware + component-level checks
- **Environment Variables**: Never hardcoded secrets

## Code Quality Requirements

**Pre-Commit Checklist:**
```bash
npm run type-check && npm run lint && npm run build
```

**Known ESLint Issues:**
- Admin components: Promise handling (being fixed)
- LoadingUI: Array index keys (warnings only)

**Critical Security Items (from CODE_REVIEW_FINDINGS.md):**
- Rate limiting needed on `/api/contact`, `/api/upload`, `/api/admin/*`
- Admin email hardcoding must move to environment variables
- File upload security validation requires enhancement
- CSRF protection implementation needed

## Common Issues & Solutions

### Type Errors
1. Check `@prisma/client` imports
2. Check `/lib/prisma-types` exports
3. Add to schema.prisma if needed
4. Run `npx prisma generate`

### "next/headers" Import Error
- Remove `'use client'` directive
- Move to Server Component

### Hydration Errors
- Add `suppressHydrationWarning`
- Use mounting state checks
- Ensure server/client consistency

### Cal.com Integration
- Verify API keys in `.env.local`
- Check webhook configuration
- Ensure event type IDs match

### TanStack Query Issues
- Check `queryKey` uniqueness
- Verify API response format
- Use `queryClient.invalidateQueries()` for cache refresh

### Authentication Failures
- Check Better Auth environment variables
- Verify OAuth redirect URLs
- Ensure admin emails in database

## Environment Variables

Required variables (see `.env.local.example` and `.env.cal.example`):
- **Database**: `DATABASE_URL`, `DIRECT_URL` (Prisma)
- **Auth**: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Cal.com**: `CAL_API_KEY`, `NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID`, `CAL_OAUTH_CLIENT_SECRET`, `CAL_WEBHOOK_SECRET`
- **Email**: `RESEND_API_KEY`
- **Maps**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Security**: `RATE_LIMIT_PER_MINUTE`, `ALLOWED_ORIGINS`
- **Analytics**: `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Development Patterns

### API Route Pattern
```typescript
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Implementation
  return NextResponse.json(data);
}
```

### Component Structure
- Server Components by default
- Client Components only when needed (`'use client'`)
- Feature-based organization
- Direct imports (no barrel files)

### Error Handling
- Try/catch in async operations
- Error boundaries at provider level
- Graceful Cal.com fallbacks
- User-friendly error messages

## Known Performance Issues

### Bundle Optimization Needed
- **HIGH**: Remove duplicate motion libraries (`framer-motion` + `motion`)
- **MEDIUM**: Optimize Radix UI package imports
- **LOW**: Add tree shaking for unused dependencies

### Database Performance
- **HIGH**: Add missing database indexes for common query patterns
- **HIGH**: Fix N+1 query problems in gallery API
- **MEDIUM**: Implement connection pooling optimization

### Core Web Vitals
- **HIGH**: Optimize Largest Contentful Paint (LCP) - currently ~2.5s
- **MEDIUM**: Reduce First Input Delay (FID) - currently ~200ms
- **MEDIUM**: Prevent Cumulative Layout Shift (CLS) - currently 0.15