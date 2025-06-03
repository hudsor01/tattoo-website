# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Tattoo website built with Next.js 15, featuring a client portal, admin dashboard, booking system, and real-time analytics.

## Tech Stack

- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript 5.8.3
- **UI Components**: shadcn/ui, Tailwind CSS v4
- **Authentication**: Better Auth with Prisma adapter
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **API Layer**: tRPC v11
- **State Management**: Zustand v5
- **Data Fetching**: TanStack Query v5 with tRPC integration
- **Email**: Resend with React Email and React Render
- **Payments**: Stripe (via Cal.com)
- **Validation**: Zod
- **Booking Integration**: Cal.com with Analytics
- **Testing**: Playwright for E2E tests

## Development Commands

```bash
# Start development server
npm run dev

# Clean start (clear .next cache)
npm run dev:clean

# Build for production
npm run build

# Build with bundle analyzer
npm run build:analyze

# Production start
npm start

# Type checking & linting (REQUIRED before commits)
npm run type-check
npm run lint
npm run lint:fix
npm run format:check

# Quality assurance workflow (MANDATORY before git operations)
npm run type-check && npm run lint && npm run build

# Database (Prisma)
npx prisma migrate dev
npx prisma migrate dev --name=
npx prisma migrate reset
npx prisma generate
npm run prisma:generate
npx prisma db push
npx prisma studio

# Testing
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:auth
npx playwright test tests/auth.spec.ts
npx playwright test --debug

# Cal.com Synchronization
npm run cal:sync
```

## Environment Variables

Required environment variables (see `.env.local.example`):

### Database (Supabase)
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `DIRECT_URL` - Direct database connection for migrations
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

### Authentication (Better Auth)
- `BETTER_AUTH_SECRET` - Generated secret for Better Auth (openssl rand -hex 32)
- `BETTER_AUTH_URL` - URL for Better Auth callbacks
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Cal.com Integration
- `NEXT_PUBLIC_CAL_USERNAME` - Cal.com username
- `CAL_API_KEY` - Cal.com API key
- `CAL_WEBHOOK_SECRET` - Cal.com webhook secret

### Email & Analytics
- `RESEND_API_KEY` - Resend API key for emails
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` - Google Analytics 4 measurement ID

## Architecture Overview

### 🎯 CRITICAL: Prisma-First Type System

**SINGLE SOURCE OF TRUTH**: All types MUST be imported from Prisma schema. Manual type definitions are BANNED.

**Process for ANY type usage:**
1. **Check**: Does type exist in `@prisma/client`?
2. **Check**: Does type exist in `@/lib/prisma-types`?
3. **If No**: Add to Prisma schema, run `npx prisma db push`, then `npx prisma generate`
4. **Never**: Create manual types in `/src/types/` directories
5. **Never**: Use `any`, `unknown`, or `never` types

**Approved imports:**
```typescript
// ✅ ALWAYS do this
import { Customer, Payment, CalBooking } from '@prisma/client';
import type { 
  CustomerCreateInput,
  CustomerWithRelations,
  ApiResponse 
} from '@/lib/prisma-types';

// ❌ NEVER do this - ESLint will block
import { CustomerType } from '@/types/customer-types';
```

**Enforcement:**
- **TSConfig**: Strict mode, noImplicitAny, strictNullChecks
- **ESLint**: Blocks manual type imports, any usage, unsafe operations  
- **Build**: Fails on type/lint errors
- **Process**: See `PRISMA_TYPE_PROCESS.md` for complete workflow

### Component Architecture (Next.js 15 App Router)

The project uses Next.js 15 App Router with React 19:

1. **Server Components** (default) - Cannot use browser APIs or React hooks
2. **Client Components** - Must add `'use client'` directive at the top of the file

Common error: Importing `next/headers` in a Client Component will fail. This must only be used in Server Components.

### API Architecture (tRPC)

The API layer uses tRPC for type-safe communication between client and server:

1. **Routers**: Organized by feature in `/src/lib/trpc/routers/`
   - Modularized structure with domain-specific sub-routers
   - `admin/` directory with specialized sub-routers:
     - `main-router.ts` - Aggregates all admin sub-routers
     - `notes-router.ts` - Notes management
     - `metrics-router.ts` - Dashboard statistics
     - `users-router.ts` - User management
   - `dashboard/` directory with specialized sub-routers:
     - `activity-router.ts` - Activity tracking
     - `appointments-router.ts` - Appointment management
     - `contacts-router.ts` - Customer contact management
     - `stats-router.ts` - Dashboard statistics
   - Feature-specific routers:
     - `appointments-router.ts` - Appointment management
     - `cal-router.ts` - Cal.com integration
     - `cal-analytics-router.ts` - Cal.com analytics
     - `gallery-router.ts` - Gallery operations
     - `payments-router.ts` - Payment processing
     - `settings-router.ts` - Application settings
     - `subscription-router.ts` - Subscription handling

2. **Procedure Types**: Three-tier authentication system
   - `publicProcedure` - No authentication required
   - `protectedProcedure` - Requires authenticated user
   - `adminProcedure` - Requires admin role with proper role verification

3. **Type System**: Prisma-First Architecture
   - ALL types auto-generated from Prisma schema
   - Import from `@prisma/client` or `@/lib/prisma-types`
   - ZERO manual type definitions allowed
   - Type validation enforced by ESLint and TSConfig

4. **Server Components Support**: 
   - Direct API access from Server Components via `server-action.ts`
   - Type-safe prefetching with `prefetchTRPCQuery`
   - Support for server mutations with `executeServerMutation`

5. **Main Router**: Combined in `/src/lib/trpc/app-router.ts` with `'server-only'` enforcement

6. **Client Setup**: Initialized in `/src/lib/trpc/client.ts` with React Query integration  

7. **Context System**: Configured in `/src/lib/trpc/context.ts` with Better Auth integration

### Authentication Architecture

The project uses Better Auth for authentication with custom middleware:

1. **Better Auth Integration**: Full authentication via Better Auth with Prisma adapter
2. **Middleware Protection**: `/middleware.ts` - Route protection
3. **Role-based Access**: public, protected, admin roles
4. **User Management**: Direct integration with Prisma User model
5. **Automatic Admin Roles**: Users with emails `fennyg83@gmail.com` and `ink37tattoos@gmail.com` automatically get admin privileges
6. **Performance Optimizations**:
   - Session caching
   - Database connection pooling
   - JWT verification cache

### State Management

- **Server State**: TanStack Query + tRPC
- **Client State**: Zustand stores
- **Form State**: react-hook-form with Zod validation

### Booking Integration

The application integrates with Cal.com for bookings, appointment scheduling and payment integration:

1. **Cal.com API**: Direct integration for booking management
2. **Webhook Handling**: Real-time sync of booking events
3. **Event Types**: Configurable appointment types and durations
4. **Email Notifications**: Automated booking confirmations
5. **Analytics Tracking**: Booking funnel analytics with conversion tracking

## Data Models

The application uses the following main data models (see `/prisma/schema.prisma`):

### Core Booking System
1. **Booking**: Initial booking requests from website with Cal.com integration fields
2. **Appointment**: Scheduled appointments linked to bookings with detailed information
3. **Customer**: Customer database with contact details, notes, and relationship tracking
4. **Payment**: Payment tracking linked to bookings with Cal.com integration

### User Management
5. **User**: System users (admins/artists) with Better Auth integration
6. **Artist**: Artist profiles with specialties and availability

### Content & Communication
7. **TattooDesign**: Gallery items with approval system and file storage
8. **Contact**: Contact form submissions and customer communications
9. **Interaction**: Communication history (emails, calls, notes)
10. **Transaction**: Financial transaction records
11. **Note**: Structured notes with types and customer associations

### System & Automation
12. **EmailAutomation**: Automated email workflows and triggers
13. **EmailLog**: Email delivery tracking and status
14. **AutomationRun**: Automation execution tracking
15. **NotificationQueue**: System notifications queue
16. **Notification**: User and system notifications with priority system
17. **Settings**: Application configuration storage

### Analytics System
18. **CalAnalyticsEvent**: Booking funnel events with timestamps and properties
19. **CalBookingFunnel**: Complete booking funnel tracking with conversion rates
20. **CalServiceAnalytics**: Service performance metrics and analytics
21. **CalRealtimeMetrics**: Real-time booking and user metrics for dashboards

### Additional
22. **Lead**: Lead capture and conversion tracking
23. **Testimonial**: Customer testimonials and reviews
24. **Tag**: Customer tagging system

### Testing Configuration

The Playwright tests are configured in `playwright.config.ts` with the following settings:

- Tests run in parallel by default
- Uses HTML reporter
- Takes screenshots and videos on test failure
- Only runs on Chromium by default (configured for desktop)
- Tests are located in the `/tests` directory
- Tests must follow the `*.spec.ts` pattern
- Base URL is set to `http://localhost:3000`

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
3. Create hooks in `/src/hooks/` (e.g., `use-new-feature.ts`)
4. Use Zod schemas from `/src/lib/validation-schemas.ts`
5. Types should be imported from `/src/types/`

### Adding Cal.com Integration Features

To extend booking functionality:

1. Update Cal.com event types in the admin dashboard
2. Add webhook handlers in `/src/app/api/cal/webhook/route.ts`
3. Update booking flow in `/src/components/booking/` components
4. Test integration with Cal.com dashboard
5. Update analytics tracking in `/src/lib/analytics/cal-analytics.ts`

### Creating New UI Components

Follow these steps when adding new UI components:

1. Create component file in `/src/components/` following kebab-case naming
2. Determine if it should be a Server or Client component
3. Import types from `/src/types/` directory
4. Use shadcn/ui components when appropriate
5. Implement responsive design with Tailwind classes
6. Follow accessibility best practices

### File Organization

- **Components**: `/src/components/` - Organized by feature
- **Hooks**: `/src/hooks/` - Custom React hooks and tRPC hooks
- **API Routes**: `/src/app/api/` - Next.js API routes
- **tRPC Routers**: `/src/lib/trpc/routers/` - Type-safe API
- **Database**: `/src/lib/db/` - Database utilities and queries
- **Types**: `/src/types/` - All TypeScript types (never in components)
- **Validations**: `/src/lib/validation-schemas.ts` - Consolidated Zod schemas
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
6. Optimize network requests with tRPC batching
7. Minimize client-side JavaScript with progressive enhancement
8. Take advantage of bundle optimization in webpack configuration
9. Use CSS optimization via Tailwind v4

### Webpack Optimizations

The project uses custom webpack configurations to optimize performance:

1. **Cache Optimization**: Filesystem cache with gzip compression
2. **Code Splitting**: Advanced chunk splitting strategy with specialized groups
   - Framework (React, React DOM)
   - shadcn/ui components
   - tRPC libraries
   - TanStack Query
   - Large modules (>160KB)
   - Commons (shared modules)
3. **Import Optimization**: Tree-shaking for 20+ libraries
4. **Memory Optimization**: 4GB heap size for builds
5. **Dynamic Imports**: Lazy loading for heavy components

## Security Best Practices

1. All user inputs validated with Zod schemas
2. Authentication checks in middleware
3. Role-based access control implemented  
4. Environment variables for sensitive data
5. Server-only operations in Server Components
6. Sanitize user-generated content before rendering
7. Implement proper CSRF protection
8. Comprehensive HTTP security headers
   - X-Frame-Options
   - X-Content-Type-Options
   - Referrer-Policy
   - X-XSS-Protection
   - Permissions-Policy
   - Content-Security-Policy
9. Never hardcode secrets or credentials
10. Mark sensitive outputs with `sensitive = true`
11. Never check in any .env file containing secrets
12. Implement rate limiting on critical API endpoints (login, password reset)
13. Never interpolate raw user-submitted HTML into React components
14. Use next/image for all images to avoid open redirects or XSS vectors

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
- Add mounting state checks to prevent premature rendering

### "Unexpected any" Type Errors
When TypeScript reports "unexpected any" errors, follow this systematic process:

**Step-by-Step Resolution Process:**
1. **Identify the source** - Locate where `any` type is being used or inferred
2. **Analyze the context** - Understand what data/value the variable should actually hold
3. **Check existing types** - Search `/src/types/` directory for existing appropriate types
4. **Import proper type** - Use existing type from domain-specific type files
5. **Create new type if needed** - Add to appropriate `/src/types/` file if type doesn't exist
6. **Update function signatures** - Ensure parameters and return types are explicitly typed
7. **Validate with TypeScript** - Run `npm run type-check` to ensure fix is correct
8. **Test the change** - Verify functionality still works as expected

**Common Sources & Solutions:**
- API responses: Create response types in `api-types.ts`
- Event handlers: Use `React.MouseEvent<HTMLButtonElement>` or specific event types
- JSON.parse(): Use Zod schemas to validate and type the parsed data
- Form data: Use react-hook-form with typed form schemas
- Database results: Import from Prisma generated types

**Example Fix:**
```typescript
// ❌ Before
const data: any = response;

// ✅ After
import { UserResponse } from '@/types/api-types';
const data: UserResponse = response;
```

### Cal.com Integration Issues
When Cal.com booking integration fails:
1. Verify the API keys in environment variables
2. Check webhook configurations in Cal.com dashboard
3. Ensure correct event type IDs are used in the integration
4. Check for errors in the Cal.com webhook handler
5. Validate analytics tracking setup

### Authentication Issues
If Better Auth integration isn't working correctly:
1. Check environment variables (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)
2. Verify OAuth credentials for Google login
3. Check if admin users have the correct role in the database
4. Inspect API responses in the Network tab (DevTools)
5. Visit the debug endpoint at `/api/debug/auth` for detailed session info

## PWA Implementation

The website includes Progressive Web App capabilities:

1. **Service Worker**: Located at `/public/sw.js` for offline support
2. **Web Manifest**: Located at `/public/manifest.json` for installation
3. **Offline Fallback**: Page at `/public/offline.html`
4. **PWA Manager**: Component at `/src/components/pwa/PWAManager.tsx`
5. **Splash Screen Generator**: Tool at `/public/icons/splash/generator.html` for iOS splash screens

### PWA Features

The PWA implementation provides:
- Offline functionality with cached assets
- Installation on home screen
- Background sync for offline operations
- Optimized mobile experience
- Fast performance on repeat visits

## Deployment Notes

- Build outputs to standalone mode for optimal deployment
- **ESLint/TypeScript NOT ignored during builds**: `npm run build` includes linting and type checking
- Build will fail if there are ESLint errors or TypeScript issues
- Database migrations must be run manually in production
- All environment variables must be set in deployment platform
- Node.js 22+ is required for deployment

## Critical Architecture Details

### Security Implementation
- **Comprehensive CSP headers**: Applied to all responses via middleware
- **Security-first middleware**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Route-based protection**: Public route matcher with Better Auth authentication
- **Production-ready headers**: Full security header stack for all routes

### Build Configuration
- **Advanced bundle optimization**: Custom webpack cache groups for shadcn/ui, tRPC, TanStack
- **Package import optimization**: 20+ packages optimized for tree-shaking
- **Memory optimization**: 4GB heap size for large builds
- **Quality enforcement**: Build process fails on linting/type errors

### Type System Architecture
- **Zero inline types**: All types must be imported from `/src/types/`
- **Centralized enums**: Single `enum-types.ts` file with 15+ enums
- **Domain-based organization**: 15+ type files organized by feature
- **Validation consolidation**: Single validation schemas file with field builders

## Recent Changes

The most recent changes to the codebase include:
- **Better Authentication Implementation**: Migration from Clerk to Better Auth
  - Improved performance with optimized session handling
  - Role-based access control
  - Email-based admin authentication
  - Enhanced security headers and middleware
  
- **Cal.com Analytics Integration**: Comprehensive booking analytics
  - Complete type definitions in `/src/types/cal-types.ts`
  - Analytics service with funnel tracking in `/src/lib/analytics/cal-analytics.ts`
  - Modern booking components with conversion tracking
  - Enhanced webhook handler with analytics integration
  
- **Database & Architecture Improvements**:
  - Structured Note model implementation with types
  - Notification system for real-time updates
  - Admin dashboard restructuring from admin-dashboard to admin
  - Gallery optimization with new infinite loading components

## Key Configuration Files

- **Authentication & API**
  - `/middleware.ts` - Route protection and auth checks
  - `/src/lib/auth.ts` - Main Better Auth configuration
  - `/src/lib/trpc/app-router.ts` - Main tRPC router configuration
  - `/src/app/api/trpc/[trpc]/route.ts` - tRPC API endpoint
  - `/src/lib/trpc/procedures.ts` - tRPC procedure definitions with authentication
  - `/src/types/trpc-types.ts` - Centralized tRPC type definitions

- **Database & Storage**
  - `/prisma/schema.prisma` - Database schema definition
  - `/src/lib/supabase/server.ts` - Server-side Supabase client
  
- **Configuration**
  - `/eslint.config.mjs` - ESLint configuration
  - `/next.config.mjs` - Next.js and webpack configuration
  - `/tailwind.config.js` - Tailwind CSS configuration
  - `/tsconfig.json` - TypeScript configuration

## Code Quality Requirements (MANDATORY)

**CRITICAL: All code changes MUST pass the following checks before committing:**

1. **Pre-Commit Quality Checks**:
   ```bash
   # Run ALL of these commands and ensure they pass:
   npm run type-check     # Must have zero TypeScript errors
   npm run lint          # Must have zero ESLint errors  
   npm run build         # Must build successfully
   ```

2. **ESLint Issues Status**:
   As of December 2024, we have significantly reduced ESLint issues from 94+ to 19 (12 errors, 7 warnings).
   The remaining issues are concentrated in the following files:
   
   - `src/components/admin/AdminUserManagement.tsx`: Promise-related issues, confirm dialog
   - `src/components/admin/DashboardModern.tsx`: Promise-related issues, array keys
   - `src/components/admin/LoadingUI.tsx`: Array index keys (warnings only)
   - `src/components/auth/AuthCallback.tsx`: Promise handling and return values
   - `src/components/auth/LoginForm.tsx`: Promise handling
   
   When working on these files, please prioritize fixing these remaining issues.

3. **Manual Testing Protocol**:
   - Navigate through affected pages manually
   - Test all interactive elements (buttons, forms, modals)
   - Verify error states and loading states work
   - Check browser console for any errors
   - Test with different user roles (admin, public)

4. **Git Workflow**:
   ```bash
   # NEVER skip these steps:
   npm run type-check && npm run lint && npm run build
   git add [files]
   git commit -m "descriptive message"
   # Only push after local testing confirms everything works
   git push origin main
   ```

## Core Development Principles

1. **No Barrel Files**: 
   - Do not create index.ts files in any directory
   - No barrel exports or re-exporting through index files
   - Import directly from source files, never from directories

2. **Type Organization**:
   - No type definitions in source files - always import from `/src/types` directory
   - No enum definitions in source files - always import from `/src/types/enum-types.ts`
   - No interface definitions in source files - always import from `/src/types`
   - Keep types organized by domain (auth-types.ts, booking-types.ts, etc.)
   - No implicit or broad types - never use any, unknown, or never
   - All function parameters, returns, and variables must reference a named type from /types directory
   - Use interfaces for data structures and type definitions
   - Prefer immutable data (const, readonly)

3. **Code Organization**:
   - Organize by feature, not by technical role
   - Keep implementation details close to their usage
   - Consolidate duplicate implementations; prefer unified implementations
   - Use a flat directory structure where possible

4. **Coding Standards**:
   - No duplicated code, features, or functionality
   - No mock implementations - production-ready code only
   - Thorough error handling with proper error types
   - Always validate inputs with Zod schemas
   - Use single quotes for strings
   - Use async/await for asynchronous code
   - Use const for constants and let for variables that will be reassigned
   - Use destructuring for objects and arrays
   - Use template literals for strings that contain variables
   - Define request/response schemas with Zod then infer TypeScript types
   - Strip out any extra properties (.strict()), and transform/normalize fields as needed (e.g., trim strings)
   - Use optional chaining (?.) and nullish coalescing (??) operators
   - Prefer pure functions: no side effects, return new objects instead of mutating

5. **Tech Stack Consistency**:
   - Next.js 15 with App Router
   - React 19 with Server Components where appropriate
   - tRPC for type-safe API layer
   - Tailwind CSS v4 for styling
   - shadcn/ui for components
   - Supabase for database
   - Prisma as ORM
   - Zustand for state management
   - TanStack/React-Query with tRPC for data fetching
   - Zod for validation

1. **File Structure**:
   - Component files should follow kebab-case naming (e.g., `booking-form.tsx`)
   - Hook files should use hyphenated naming (e.g., `use-booking-form.ts`)
   - Utility files should be domain-specific (e.g., `date-utils.ts`)
   - No index files in any directory

2. **Component Guidelines**:
   - Use the new React 19 model
   - Default to Server Components
   - Only add 'use client' directive when necessary
   - Keep components focused and small
   - Follow naming convention: `entity-action` (e.g., `booking-form`)
   - Use React.FC type for components with children
   - Follow React hooks rules - no conditional hooks
   - Destructure objects/arrays at the top of a function or component

3. **Hook Guidelines**:
   - Prefix with 'use'
   - Keep hooks focused on a single responsibility
   - Use tRPC hooks over direct API calls
   - Consolidate related functionality into a single hook

4. **tRPC Implementation**:
   - Organize routers by domain (booking-router.ts, gallery-router.ts)
   - Use Zod for input validation
   - Implement proper error handling in each procedure
   - Keep procedures focused on single responsibilities
   - Ensure proper authentication checks
 
5. **Authentication**:
   - Use Better Auth for all authentication needs
   - Implement proper role-based access control via middleware
   - Validate auth state in components and API endpoints
   - Keep sensitive auth logic server-side

6. **Performance Optimization**:
   - Implement proper React Query caching strategies
   - Use Server Components where possible
   - Optimize image loading with Next.js Image component
   - Implement proper pagination and virtualization for large lists
   - Use dynamic imports for code splitting

7. **Error Handling**:
   - Implement standardized error handling
   - Use error boundaries where appropriate
   - Provide user-friendly error messages
   - Log detailed errors server-side
   - Implement proper fallbacks for failed data fetching
   - Always wrap async operations (await supabase.from(...).select(), fetch calls, etc.) in try/catch
   - Use ErrorBoundary to catch render errors on the client
   - Register a global listener for unhandled promise rejections
   - Use try/catch blocks for async operations
   - Always log errors with contextual information

When encountering common problems, follow these steps:

1. For type errors: First check type imports, then consult `/src/types` directory
2. For build failures: Ensure all linting and type checks pass, then clear cache
3. For API issues: Verify authentication setup and tRPC procedure configuration
4. For UI problems: Check component implementation and CSS specificity
5. For performance issues: Look for unnecessary client-side code, optimize images and API calls