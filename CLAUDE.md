# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tattoo website built with Next.js 15, featuring a client portal, admin dashboard, booking system, and real-time analytics.

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
- **Booking Integration**: Cal.com

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build
npm start

# Type checking & linting
npm run type-check                 # TypeScript type checking
npm run lint                       # ESLint
npm run lint:fix                   # ESLint with auto-fix
npm run format                     # Prettier formatting

# Database (Prisma)
npx prisma migrate dev             # Run migrations in development
npx prisma migrate dev --name=     # Create a new migration 
npx prisma migrate reset           # Reset database
npx prisma generate                # Generate Prisma client
npx prisma studio                  # Open Prisma Studio GUI
npx prisma db push                 # Push schema changes without migration (dev only)

# Clean development start
rm -rf .next                       # Clear Next.js cache
npm run dev                        # Start fresh

# Verify environment setup
npx prisma generate                # Ensure Prisma client is up-to-date
npm run type-check && npm run lint # Verify code quality before commit
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

### Analytics System

The application includes a comprehensive real-time analytics system:

1. **Event Tracking**: Client-side hooks capture various event types:
   - Page views
   - User interactions
   - Booking events
   - Gallery interactions
   - Conversions
   - Errors

2. **Real-Time Dashboard**: Live monitoring at `/admin-dashboard/analytics/live` with:
   - Active users indicator
   - Recent events stream
   - Metrics visualization

3. **Implementation**:
   - `AnalyticsProvider` for app-wide tracking
   - `PageViewTracker` for automatic page tracking
   - `useLiveAnalytics` hook for real-time data
   - Server-Sent Events (SSE) for streaming updates
   - Prisma for data storage (`AnalyticsEvent` model)

## Data Models

The application uses the following main data models:

1. **Booking**: High-level booking record linked to a customer and appointment.

2. **Appointment**: Detailed appointment information including customer details, tattoo specifications, and scheduling information.

3. **Customer**: Stores customer information including contact details, preferences, and history.

4. **GalleryItem**: Represents a tattoo design in the gallery with images and metadata.

5. **User**: Represents system users (admin, artist) with authentication details.

6. **BlogPost**: Blog content with metadata for the website.

7. **Payment**: Tracks payment information linked to bookings and appointments.

8. **AnalyticsEvent**: Tracks user interactions, page views, and other analytics events.

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
4. Use Zod schemas from `/src/lib/validations/`
5. Types should be imported from `/src/types/`

### Adding Analytics Tracking

To track new types of events:

1. Add the event type to `EventCategory` enum in `analytics-types.ts`
2. Create an interface for the event extending `BaseEventType`
3. Add a Zod schema for validation in `validation-analytics.ts`
4. Add a tracking method to the `useAnalytics` hook
5. Add a tRPC procedure in the analytics router if needed

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

### Analytics Tracking Failures
If analytics events aren't being tracked:
1. Check that `AnalyticsProvider` is properly wrapping the app
2. Verify that the database has the `AnalyticsEvent` table
3. Check network requests for API errors
4. Ensure proper event category and action names are used

## Deployment Notes

- Build outputs to standalone mode for optimal deployment
- ESLint errors are ignored during builds (check manually with `npm run lint`)
- TypeScript errors are ignored during builds (check manually with `npm run type-check`)
- Database migrations must be run manually in production
- All environment variables must be set in deployment platform

## Recent Changes

The most recent changes to the codebase include:
- Restructuring the booking and appointment models (separation of concerns)
- Adding analytics event tracking and real-time dashboard
- Implementing Cal.com integration for appointment scheduling
- Refining payment processing with Stripe

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

5. **Tech Stack Consistency**:
   - Next.js 15 with App Router
   - React 19 with Server Components where appropriate
   - tRPC for type-safe API layer
   - Tailwind CSS v4 for styling
   - Material UI and shadcn/ui for components
   - Supabase for auth and database
   - Prisma as ORM
   - Zustand for state management
   - TanStack/React-Query with tRPC for data fetching
   - Zod for validation

## Implementation Guidelines

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
   - Use the unified auth system in `src/lib/auth/auth-system.ts`
   - Implement proper role-based access control
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

8. **Analytics Implementation**:
   - Use the `useAnalytics` hook for tracking events
   - Wrap page components with `PageViewTracker` for automatic page view tracking
   - Follow consistent naming conventions for event categories and actions
   - Include relevant metadata with events for better insights
   - Minimize tracking frequency to avoid performance impact