# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Professional tattoo studio website with Next.js 15.3.3 and React 19.1.0, featuring Cal.com booking integration, portfolio gallery, contact forms, and comprehensive analytics tracking.

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
npx prisma generate                     # Generate Prisma client (outputs to ./output/generated/prisma-client)
npm run prisma:generate                 # Alternative command for Prisma client generation
npx prisma studio                       # Open database GUI
npx prisma db seed                      # Seed database with initial data

# Bundle Analysis
npm run build:analyze                   # Analyze bundle size with @next/bundle-analyzer
ANALYZE=true npm run build              # Alternative bundle analysis command

# Testing
# No test commands currently configured
```

## Critical Architecture: Prisma-First Type System

**MANDATORY**: All types MUST be imported from Prisma. Manual type definitions are FORBIDDEN.

```typescript
// ✅ CORRECT - Import from Prisma
import { Customer, Payment, CalBooking, Booking } from '@prisma/client';
import type { CustomerCreateInput, PaymentWithRelations } from '@/lib/prisma-types';

// Custom Prisma client path
import { PrismaClient } from '@prisma-client';

// ❌ FORBIDDEN - Never create manual types
interface CustomerType { ... }  // ESLint will block this
```

**Type Usage Process:**
1. Check if type exists in `@prisma/client`
2. Check if type exists in `@/lib/prisma-types`
3. If not found: Add to `prisma/schema.prisma`, run `npx prisma db push` then `npx prisma generate`
4. NEVER use `any`, `unknown`, or create manual types

**ESLint Enforcement:**
- `no-restricted-imports` rule blocks manual type definitions with specific error messages
- Exceptions: UI component types from `@/types/ui-types` are allowed
- Forces use of `@prisma/client` and `@/lib/prisma-types`

## TypeScript Configuration

**Strict Mode Settings:**
- `noUncheckedIndexedAccess`: Forces null checks on array/object access
- `noImplicitOverride`: Requires `override` keyword
- `noPropertyAccessFromIndexSignature`: Forces bracket notation for index signatures
- All strict flags enabled

**Path Aliases:**
```typescript
// Available imports
import { something } from '@/lib/...'        // Maps to src/lib
import { Component } from '@/components/...' // Maps to src/components
import { PrismaClient } from '@prisma-client' // Custom Prisma output
```

## High-Level Architecture

### Next.js 15 App Router Structure
```
/src/app/                    # App Router root
├── api/                     # API routes
│   └── cron/               # Scheduled jobs (cleanup at 2 AM daily)
├── about/                   # About page
├── booking/                 # Booking system
├── book-consultation/       # Consultation booking
├── contact/                 # Contact page
├── faq/                     # FAQ page
├── gallery/                 # Portfolio gallery
├── services/                # Services page
└── providers.tsx            # Client providers wrapper
```

### API Layer (REST + TanStack Query)
**No tRPC** - Uses native Next.js API routes with TanStack Query for client-side state management.

**API Route Structure:**
```
/src/app/api/
├── bookings/        # Public booking endpoints
├── contact/         # Contact form submission
├── cron/           # Scheduled tasks
│   └── cleanup/    # Daily cleanup job (2 AM)
├── csrf/           # CSRF token generation
├── gallery/        # Portfolio management
│   ├── [id]/       # Individual design retrieval
│   └── files/      # File upload handling
├── health/         # Health check endpoint
└── refresh/        # Token refresh (planned)
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

### Database Models (Prisma)
**Core Models:**
- `User` - Authentication and roles
- `Customer` - Client information
- `Booking` - Unified booking (website + Cal.com)
- `TattooDesign` - Portfolio/gallery items
- `Payment` - Payment tracking
- `Contact` - Form submissions
- `RateLimit` - Rate limiting (ready for implementation)

**Analytics Models:**
- `CalAnalyticsEvent` - Event tracking
- `CalBookingFunnel` - Conversion tracking
- `CalServiceAnalytics` - Service performance
- `CalRealtimeMetrics` - Live dashboard data

**Better Auth Models:**
- `Session` - User sessions
- `Account` - OAuth accounts
- `Verification` - Email verification

### State Management
- **Server State**: TanStack Query v5.80.6 for data fetching and caching
- **Form State**: react-hook-form + Zod validation schemas
- **Client State**: React Context for providers (CSRF, themes)
- **Auth State**: Database schema ready, implementation pending

### Build Configuration
- **Webpack**: Filesystem cache with gzip compression
- **Code Splitting**: Specialized chunks (framework, radix, tanstack, commons, framer-motion)
- **Package Optimization**: 20+ packages in `optimizePackageImports`
- **Memory**: Increased Node.js heap (4GB) for builds
- **Transpilation**: `@calcom/atoms` package transpiled

## Key Architectural Patterns

### 1. Dual Logging System
- Uses `console.warn` for ALL log levels except errors (intentional)
- Proxy pattern switches between client/server loggers automatically
- Server adds timestamps, client remains simple

### 2. CSRF Protection Architecture
- Double-submit cookie pattern implemented in `CSRFProvider`
- Token generation via `/api/csrf` endpoint
- Header-based validation (`x-csrf-token`)
- Secure cookie configuration with httpOnly and sameSite settings

### 3. Cal.com Integration Layer
Comprehensive Cal.com integration in `/src/lib/cal/`:
- OAuth 2.0 and legacy API key support
- Service definitions with detailed custom fields (piercing, tattoo styles, etc.)
- Webhook processing for booking events
- Fallback mechanisms when Cal.com is unavailable
- Event type mapping and booking validation

### 4. Environment Configuration
Comprehensive environment variable validation in `/src/lib/utils/env.ts`:
- Zod schemas for type-safe environment variables
- Client/server variable separation
- Cal.com configuration management
- Admin email handling utilities
- Development vs production environment handling

### 5. Gallery Management System
Sophisticated image/video handling in `/src/hooks/use-gallery.ts`:
- TanStack Query integration for efficient caching
- Optimistic updates for likes/interactions
- File upload handling with progress tracking
- Social sharing capabilities
- SEO-friendly URL generation

### 6. Caching Strategy
**Development:**
- No-cache headers on all assets
- Cache-Control: no-store

**Production:**
- Immutable cache for static assets (/_next/static)
- API route caching:
  - Health endpoint: 60s cache
  - Gallery endpoints: 300s cache
  - Dynamic content: No cache

## Security Implementation

### Headers & Policies
- **CSP**: Strict Content Security Policy with nonce support
- **X-Frame-Options**: SAMEORIGIN
- **Permissions Policy**: Restricted camera, microphone, geolocation
- **CORS**: Configured allowed origins in next.config.mjs
- **HSTS**: Ready for production enablement

### Input Validation
- Zod schemas for all form submissions and API inputs
- CSRF token validation on state-changing operations
- Environment variable validation with type safety

### ESLint Security Rules
- **Forbidden patterns**: `eval()`, implied eval, script URLs
- **Console restrictions**: Only `console.warn` and `console.error` allowed
- **Strict equality**: Always use `===` and `!==`
- **React security**: Links with target="_blank" require rel="noreferrer"

## Code Quality Requirements

### Pre-Commit Checklist
```bash
npm run type-check && npm run lint && npm run build
```

### ESLint Configuration Highlights
- **TypeScript**: Explicit return types, no floating promises
- **React**: Exhaustive deps, display names required
- **Security**: No eval, no script URLs, consistent returns
- **Code style**: Unused vars with `_` prefix allowed
- **Imports**: Restricted imports enforce Prisma-first types

### Common Issues & Solutions

**Type Errors:**
1. Check `@prisma/client` imports
2. Check `/lib/prisma-types` exports
3. Check custom path `@prisma-client`
4. Run `npx prisma generate`

**"next/headers" Import Error:**
- Remove `'use client'` directive
- Move to Server Component

**Hydration Errors:**
- Add `suppressHydrationWarning`
- Use mounting state checks
- Ensure server/client consistency

**Cal.com Integration:**
- Verify API keys in `.env.local`
- Check webhook configuration
- Ensure event type IDs match

**TanStack Query Issues:**
- Check `queryKey` uniqueness
- Verify API response format
- Use `queryClient.invalidateQueries()` for cache refresh

## Vercel Deployment Configuration

### Region & Limits
- **Region**: `iad1` (US East)
- **Function Duration**: 30s max
- **Function Memory**: 1GB
- **Build Memory**: 4GB heap size

### Scheduled Tasks
- **Cleanup Cron**: Daily at 2 AM (`0 2 * * *`)
- **Endpoint**: `/api/cron/cleanup`

## Environment Variables

### Required Variables
- **Database**: `DATABASE_URL`, `DIRECT_URL`
- **Cal.com**: `CAL_API_KEY`, `NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID`, `CAL_OAUTH_CLIENT_SECRET`, `CAL_WEBHOOK_SECRET`
- **Email**: `RESEND_API_KEY`
- **Maps**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- **Analytics**: `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Configuration Variables
- **Security**: `RATE_LIMIT_PER_MINUTE`, `ALLOWED_ORIGINS`
- **Auth (Future)**: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS`

## Current API Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// Input validation schema
const requestSchema = z.object({
  // Define expected inputs
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const body = await request.json();
    const validatedData = requestSchema.parse(body);
    
    // CSRF validation (if needed)
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken) {
      return NextResponse.json({ error: 'CSRF token required' }, { status: 403 });
    }
    
    // Business logic with Prisma
    const result = await prisma.model.create({
      data: validatedData,
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    logger.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Performance Optimization

### Bundle Strategy
- **Chunk Groups**: framework, radix-ui, tanstack, framer-motion, commons
- **Package Imports**: 20+ packages optimized including all UI libraries
- **Image Formats**: AVIF, WebP with fallbacks
- **Device Sizes**: Optimized for 320px to 3840px screens

### Monitoring
- **Vercel Analytics**: Core Web Vitals tracking
- **Speed Insights**: Real-time performance metrics
- **Bundle Analyzer**: Available via `npm run build:analyze`
- **Database Indexes**: Composite indexes on frequently queried fields

## Deployment Checklist

1. Set all required environment variables
2. Run database migrations: `npx prisma migrate deploy`
3. Generate Prisma client: `npx prisma generate`
4. Configure Cal.com webhooks for production domain
5. Enable Vercel Analytics
6. Set Google Maps API restrictions
7. Test CSRF protection across browsers
8. Verify cron job permissions
9. Monitor Core Web Vitals post-deployment