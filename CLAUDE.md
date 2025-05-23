# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tattoo website built with Next.js 15, featuring a client portal, admin dashboard, booking system, and real-time analytics.

## Tech Stack

- **Framework**: Next.js 15.3.2 (App Router)
- **Language**: TypeScript 5.8.3
- **UI Components**: Material UI v7, shadcn/ui, Tailwind CSS v4
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (Supabase) with Prisma ORM
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
npm run prisma:generate            # Generate Prisma client (alias)
npx prisma studio                  # Open Prisma Studio GUI
npx prisma db push                 # Push schema changes without migration (dev only)
npm run prisma:update              # Run custom schema update script

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
- `DATABASE_URL` - Supabase PostgreSQL connection string:
  - `postgresql://postgres.qrcweallqlcgwiwzhqpb:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres`
  - Password is available in the .env file
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
   - `payments-router.ts` - Payment processing

2. **Main Router**: Combined in `/src/lib/trpc/app-router.ts`

3. **Client Setup**: Initialized in `/src/lib/trpc/client.tsx`  

4. **Server Setup**: Configured in `/src/lib/trpc/server.ts`

### Authentication Architecture

The project uses a unified authentication system:

1. **Main Auth System**: `/src/lib/auth-system.ts`
2. **Middleware Protection**: `/src/middleware.ts` 
3. **Server Auth**: `/src/lib/supabase/server-auth.ts`  
4. **Role-based Access**: public, protected, admin

### State Management

- **Server State**: TanStack Query + tRPC
- **Client State**: Zustand stores in `/src/store/`
- **Form State**: react-hook-form with Zod validation

### Booking Integration

The application integrates with Cal.com for appointment scheduling:

1. **Cal.com API**: Direct integration for booking management
2. **Webhook Handling**: Real-time sync of booking events
3. **Event Types**: Configurable appointment types and durations
4. **Email Notifications**: Automated booking confirmations

## Data Models

The application uses the following main data models:

1. **Booking**: High-level booking record linked to a customer and appointment.

2. **Appointment**: Detailed appointment information including customer details, tattoo specifications, and scheduling information.

3. **Customer**: Stores customer information including contact details, preferences, and history.

4. **GalleryItem**: Represents a tattoo design in the gallery with images and metadata.

5. **User**: Represents system users (admin, artist) with authentication details.

6. **BlogPost**: Blog content with metadata for the website.

7. **Payment**: Tracks payment information linked to bookings and appointments.

8. **PricingTier**: Defines different service pricing options and tiers.

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

### Adding Cal.com Integration Features

To extend booking functionality:

1. Update Cal.com event types in the admin dashboard
2. Add webhook handlers in `/src/app/api/cal/webhook/route.ts`
3. Update booking flow in `/src/components/booking/` components
4. Test integration with Cal.com dashboard

### Creating New UI Components

Follow these steps when adding new UI components:

1. Create component file in `/src/components/` following kebab-case naming
2. Determine if it should be a Server or Client component
3. Import types from `/src/types/` directory
4. Use shadcn/ui or Material UI base components when appropriate
5. Implement responsive design with Tailwind classes
6. Follow accessibility best practices

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
6. Optimize network requests with tRPC batching
7. Minimize client-side JavaScript with progressive enhancement

## Security Best Practices

1. All user inputs validated with Zod schemas
2. Authentication checks in middleware
3. Role-based access control implemented  
4. Environment variables for sensitive data
5. Server-only operations in Server Components
6. Sanitize user-generated content before rendering
7. Implement proper CSRF protection

## Development Workflow

Run these commands for development workflow:
1. Type checking: `npm run type-check`
2. Linting: `npm run lint` or `npm run lint:fix`
3. Formatting: `npm run format`

Note: This project does not currently have test suites configured. Consider adding testing framework if needed.

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
npm run dev          # Start fresh development server
npx prisma generate  # Ensure Prisma client is up-to-date
```


### Cal.com Integration Issues
When Cal.com booking integration fails:
1. Verify the API keys in environment variables
2. Check webhook configurations in Cal.com dashboard
3. Ensure correct event type IDs are used in the integration
4. Check for errors in the Cal.com webhook handler

## Deployment Notes

- Build outputs to standalone mode for optimal deployment
- ESLint errors are ignored during builds (check manually with `npm run lint`)
- TypeScript errors are ignored during builds (check manually with `npm run type-check`)
- Database migrations must be run manually in production
- All environment variables must be set in deployment platform
- Node.js 22+ is required for deployment

## Recent Changes

The most recent changes to the codebase include:
- Restructuring the booking and appointment models (separation of concerns)
- Implementing Cal.com integration for appointment scheduling
- Admin dashboard restructuring from admin-dashboard to admin
- Gallery optimization with new infinite loading components

## Key Configuration Files

- `/src/middleware.ts` - Route protection and auth checks
- `/src/lib/trpc/app-router.ts` - Main tRPC router configuration
- `/src/lib/auth-system.ts` - Unified authentication system
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
   - Use the unified auth system in `src/lib/auth-system.ts`
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

