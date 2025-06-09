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
npm run lint:fix                        # Auto-fix ESLint issues (same as npm run lint)
npm run build                           # Production build (includes lint + type-check + prisma generate)

# Database Management
npx prisma db push                      # Push schema changes (dev only)
npx prisma migrate dev --name <name>    # Create migration
npx prisma migrate reset                # Reset database (dev only!)
npx prisma generate                     # Generate Prisma client
npm run prisma:generate                 # Alternative command for Prisma client generation
npx prisma studio                       # Open database GUI

# Cal.com Data Sync (Not Currently Implemented)
# npm run cal:sync                      # Sync Cal.com data to local database (planned)

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
├── about/                   # About page
├── booking/                 # Booking system
├── book-consultation/       # Consultation booking
├── contact/                 # Contact page
├── faq/                     # FAQ page
├── gallery/                 # Portfolio gallery
├── services/                # Services page
└── providers.tsx            # Client providers wrapper
```

### Current Project Structure (Role-Oriented)
```
src/
├── app/                     # Next.js App Router pages & API routes
├── components/              # React components (organized by domain)
├── hooks/                   # Custom React hooks
├── lib/                     # Business logic & utilities
├── providers/               # React context providers
├── styles/                  # CSS files & font configurations
├── types/                   # TypeScript type definitions
└── utils.ts                 # General utility functions
```

### API Layer (REST + TanStack Query)
**No tRPC** - Uses native Next.js API routes with TanStack Query for client-side state management.

**Current API Route Structure:**
```
/src/app/api/
├── bookings/        # Public booking endpoints
├── contact/         # Contact form submission
├── csrf/            # CSRF token generation
├── gallery/         # Portfolio management
│   ├── [id]/        # Individual design retrieval
│   └── files/       # File upload handling
├── health/          # Health check endpoint
└── refresh/         # Token refresh (planned)
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

### Authentication (Not Currently Implemented)
- **Status**: No authentication system currently implemented
- **Database Ready**: Prisma schema includes User, Session, Account models for future auth
- **Planned**: Better Auth integration with Google OAuth
- **Environment Variables**: `ADMIN_EMAILS` for admin designation (when implemented)
- **Current State**: Public website with contact forms and booking integration

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
- **Server State**: TanStack Query v5.80.6 for data fetching and caching
- **Form State**: react-hook-form + Zod validation schemas
- **Client State**: React Context for providers (CSRF, themes)
- **Auth State**: Not implemented (no auth system currently)

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

## Security Implementation

- **Input Validation**: Zod schemas for all form submissions and API inputs
- **CSRF Protection**: Double-submit cookie pattern with secure configuration
- **CORS**: Configured allowed origins in next.config.mjs
- **CSP Headers**: Strict Content Security Policy with nonce support
- **Environment Variables**: Type-safe validation with Zod schemas
- **File Upload Security**: Planned enhancement for gallery uploads
- **Rate Limiting**: Database model ready for implementation (RateLimit table)

## Code Quality Requirements

**Pre-Commit Checklist:**
```bash
npm run type-check && npm run lint && npm run build
```

**Current Code Quality Status:**
- ESLint configuration enforces Prisma-first type system
- TypeScript strict mode enabled with comprehensive type checking
- Prettier formatting enforced
- Security-focused ESLint rules applied

**Areas for Enhancement:**
- Rate limiting implementation on critical endpoints
- File upload security validation for gallery
- Authentication system implementation (database schema ready)

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

### Development Issues
- **Environment Setup**: Check all required environment variables in `.env.local`
- **Build Failures**: Ensure Prisma client is generated with `npx prisma generate`
- **Type Issues**: Verify imports from `@prisma/client` and `/lib/prisma-types`
- **Cal.com Integration**: Verify API keys and webhook configurations

## Environment Variables

Current environment variables used:
- **Database**: `DATABASE_URL`, `DIRECT_URL` (Prisma)
- **Cal.com**: `CAL_API_KEY`, `NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID`, `CAL_OAUTH_CLIENT_SECRET`, `CAL_WEBHOOK_SECRET`
- **Email**: `RESEND_API_KEY` (for contact form notifications)
- **Maps**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (for contact page)
- **Analytics**: `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Security**: `RATE_LIMIT_PER_MINUTE`, `ALLOWED_ORIGINS` (configured via env utils)

Planned for auth implementation:
- **Auth**: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS`

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

## Testing Strategy (Not Currently Implemented)

### Planned Testing Framework
- **E2E Testing**: Playwright for user journey testing
- **Unit Testing**: Jest/Vitest for component and utility testing
- **Integration Testing**: API route testing with database
- **Visual Testing**: Storybook for component documentation

### Areas Requiring Testing
- **Gallery**: Image/video upload, display, sharing functionality
- **Booking**: Cal.com integration, form validation, submission
- **Contact**: Form submission, email notifications
- **CSRF**: Token generation and validation
- **Performance**: Core Web Vitals monitoring

## Performance Considerations

### Current Performance Features
- **Bundle Optimization**: Webpack optimization with specialized chunks (framework, radix, tanstack)
- **Package Imports**: 20+ packages optimized in next.config.mjs
- **Image Optimization**: Next.js Image component with OptimizedImage wrapper
- **Core Web Vitals**: Vercel Analytics and Speed Insights monitoring
- **Database**: Performance indexes implemented for common queries

### Performance Monitoring
- **Client**: Vercel Speed Insights tracks Core Web Vitals
- **Server**: Performance logging in `/src/lib/performance/core-web-vitals.ts`
- **Bundle**: Bundle analyzer available via `npm run build:analyze`
- **Database**: Prisma query optimization and indexing strategies

## Current Deployment Status

### Production-Ready Features
1. **Environment Variables**: Type-safe validation with Zod schemas
2. **Database**: Prisma with PostgreSQL, migrations ready
3. **Analytics**: Vercel Analytics and Google Analytics configured
4. **Security**: CSRF protection, CSP headers, CORS configuration
5. **Performance**: Bundle optimization, image optimization, Core Web Vitals tracking
6. **Cal.com Integration**: OAuth and API key support, webhook handling
7. **SEO**: Structured data, meta tags, sitemap generation

### Deployment Checklist
1. Set required environment variables (database, Cal.com, email, maps, analytics)
2. Run database migrations: `npx prisma migrate deploy`
3. Generate Prisma client: `npx prisma generate`
4. Enable Vercel Analytics in production
5. Configure Google Maps API keys and restrictions
6. Set up Cal.com webhooks for production domain
7. Test contact form email delivery
8. Verify CSRF protection across browsers
9. Monitor Core Web Vitals and performance metrics

### Future Enhancements
- Authentication system implementation (database schema ready)
- Admin dashboard for portfolio management
- Rate limiting on critical endpoints
- Comprehensive testing suite
- Enhanced file upload security