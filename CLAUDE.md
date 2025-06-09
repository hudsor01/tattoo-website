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
npm run lint:fix                        # Auto-fix ESLint issues (same as npm run lint)
npm run build                           # Production build (includes lint + type-check + prisma generate)

# Database Management
npx prisma db push                      # Push schema changes (dev only)
npx prisma migrate dev --name <name>    # Create migration
npx prisma migrate reset                # Reset database (dev only!)
npx prisma generate                     # Generate Prisma client
npm run prisma:generate                 # Alternative command for Prisma client generation
npx prisma studio                       # Open database GUI

# Testing
npm run test:e2e                        # Run all Playwright E2E tests
npm run test:e2e:ui                     # Playwright test UI
npm run test:e2e:auth                   # Run auth-specific tests
npx playwright test --debug             # Debug mode
npx playwright test <filename>          # Run single test file
npx playwright show-report              # View test report after failure

# Cal.com Data Sync
npm run cal:sync                        # Sync Cal.com data to local database (uses tsx scripts/sync-cal-data.ts)

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
- **Auto-Admin Emails**: Set via `ADMIN_EMAILS` environment variable (comma-separated)
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

## Key Architectural Patterns

### 1. Dual Logging System
- Uses `console.warn` for ALL log levels except errors (intentional)
- Proxy pattern switches between client/server loggers automatically
- Server adds timestamps, client remains simple

### 2. Middleware Authentication Architecture
- Middleware validates session with Better Auth's `getSession()`
- Role-based access control for admin routes
- Redirects unauthorized users appropriately
- Falls back to redirect on errors rather than allowing access

### 3. Database Function Execution Layer
`db-execute.ts` provides sophisticated database abstraction:
- Executes stored procedures via Prisma's `$queryRaw`
- Timeout protection with Promise.race
- Dual API: `executeStoredProcedure` (throws) vs `executeDbFunction` (returns error objects)

### 4. In-Memory Rate Limiting
- Pure in-memory storage (no Redis dependency)
- Auto-cleanup every 60 seconds
- Different limits per endpoint type
- Threat detection with regex patterns
- Location: `src/lib/security/rate-limiter.ts`

### 5. Unified API Client
`api.ts` creates standardized HTTP client:
- Optional Zod schema validation
- Custom `ApiError` class
- Built-in social sharing logic
- Multipart upload support

### 6. CSRF Protection Implementation
- Double-submit cookie pattern
- `CSRFProvider` for React components
- Header-based validation (`x-csrf-token`)
- Secure cookie configuration

## Security Implementation

- **Input Validation**: Zod schemas on all endpoints
- **Rate Limiting**: In-memory rate limiter (add to critical endpoints)
- **CORS**: Configured allowed origins
- **CSP Headers**: Strict Content Security Policy with nonce support
- **Auth Protection**: Middleware + page-level auth checks
- **CSRF Protection**: Double-submit cookie pattern
- **Environment Variables**: Use `getAdminEmails()` utility for admin emails

## Code Quality Requirements

**Pre-Commit Checklist:**
```bash
npm run type-check && npm run lint && npm run build
```

**Known ESLint Issues:**
- Admin components: Promise handling (being fixed)
- LoadingUI: Array index keys (warnings only)

**Critical Security Items:**
- Rate limiting needed on `/api/contact`, `/api/upload`, `/api/admin/*`
- File upload security validation requires enhancement
- Admin emails now use environment variables via `ADMIN_EMAILS`

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
- Ensure admin emails in `ADMIN_EMAILS` env var

## Environment Variables

Required variables (see `.env.local.example` and `.env.cal.example`):
- **Database**: `DATABASE_URL`, `DIRECT_URL` (Prisma)
- **Auth**: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS`
- **Cal.com**: `CAL_API_KEY`, `NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID`, `CAL_OAUTH_CLIENT_SECRET`, `CAL_WEBHOOK_SECRET`
- **Email**: `RESEND_API_KEY`
- **Maps**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Security**: `RATE_LIMIT_PER_MINUTE`, `ALLOWED_ORIGINS`
- **Analytics**: `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## API Route Pattern

```typescript
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/auth/api-auth';
import { rateLimit } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await rateLimit(request);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  
  // Auth check
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Admin check (if needed)
  const adminCheck = await verifyAdminAccess(request);
  if (!adminCheck.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Implementation
  return NextResponse.json(data);
}
```

## Testing Strategy

### E2E Tests with Playwright
- Tests located in `/tests/` directory
- Run on port 3001 to avoid conflicts
- Uses Chromium, Firefox, and WebKit browsers
- Screenshots captured on failure
- HTML report generated after test runs

### Test Categories
- **Auth Tests**: Login, OAuth, session management
- **Gallery Tests**: Image/video handling, lightbox, sharing
- **Admin Tests**: Dashboard, customers, appointments
- **Booking Tests**: Cal.com integration, form submission

## Performance Considerations

### Bundle Optimization
- Remove duplicate motion libraries (`framer-motion` + `motion`)
- Tree shake unused dependencies
- Monitor bundle size with `npm run build:analyze`

### Database Performance
- Add indexes for common query patterns
- Fix N+1 queries in gallery API
- Use Prisma's `include` wisely

### Core Web Vitals
- Optimize images with Next.js Image component
- Implement proper loading states
- Use `loading="lazy"` for below-fold content

## Deployment Checklist

1. Set all environment variables in deployment platform
2. Configure Google OAuth authorized domains
3. Update `BETTER_AUTH_URL` to production domain
4. Set `ADMIN_EMAILS` with comma-separated admin emails
5. Enable Vercel Analytics for production monitoring
6. Configure error tracking (Sentry recommended)
7. Set up CDN for static assets
8. Enable HTTP/2 and compression
9. Review security headers in production
10. Test CSRF protection across browsers