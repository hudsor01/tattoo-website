# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tattoo website built with Next.js 15, featuring a client portal, admin dashboard, and booking system.

## Tech Stack

- **Framework**: Next.js 15.3.2 (App Router)
- **Language**: TypeScript 5.8.3
- **UI Components**: 
  - Material UI v7 
  - shadcn/ui
  - Tailwind CSS v4
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Prisma ORM
- **API Layer**: tRPC v11
- **State Management**: Zustand v5
- **Data Fetching**: TanStack Query v5 with tRPC integration
- **Email**: Resend
- **Payments**: Stripe
- **Validation**: Zod
- **Styling**: Tailwind CSS + Shadcn/UI

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run all tests
npm test

# Run E2E tests with UI
npm run test:e2e:ui

# Lint the codebase
npm run lint

# Fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check
npm run type-check

# Clean development cache
npm run dev:clean

# Verify MCP servers
npm run verify-mcp
```

## Environment Variables

Critical environment variables required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - PostgreSQL direct connection URL 
- `RESEND_API_KEY` - Resend API key for emails
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_BASE_URL` - Base URL for the application
- `JWT_SECRET` - Secret for JWT signing
- `ADMIN_USERNAME` - Admin dashboard username
- `ADMIN_PASSWORD` - Admin dashboard password

## Project Structure

```
src/
├── app/                   # Next.js app directory
│   ├── admin-dashboard/   # Admin dashboard routes
│   ├── client-portal/     # Client portal routes
│   └── api/              # API routes and tRPC endpoints
├── components/           # React components
│   ├── ui/              # UI components (shared)
│   ├── auth/            # Authentication components
│   ├── booking/         # Booking-related components
│   └── layouts/         # Layout components
├── hooks/               # Custom React hooks
│   ├── trpc/           # tRPC-specific hooks
│   └── api/            # API utility hooks
├── lib/                # Core utilities and services
│   ├── auth/           # Authentication logic
│   ├── supabase/       # Supabase clients
│   ├── trpc/           # tRPC server/client config
│   ├── services/       # Business logic services
│   └── validation/     # Zod schemas
├── types/              # TypeScript type definitions
│   ├── declarations/   # Global type declarations
│   └── ui/            # UI component types
├── store/              # Zustand store definitions
└── styles/             # Global styles and themes
```

## Architecture Guidelines

### 1. No Barrel Files
- Never create index.ts files in any directory
- Import directly from source files
- No re-exporting through index files

### 2. Type Organization
- All types must be defined in `/src/types`
- Never define types in component files
- Enums go in `/src/types/enum-types.ts`
- Keep types organized by domain

### 3. Component Organization
- Use React 19 features where appropriate
- Default to Server Components
- Add 'use client' only when necessary
- Name components using kebab-case
- Follow pattern: `entity-action` (e.g., `booking-form.tsx`)

### 4. Hook Guidelines
- Prefix all hooks with 'use'
- Keep hooks focused on single responsibility
- Use tRPC hooks over direct API calls
- Store hooks in `/src/hooks`

### 5. tRPC Implementation
- Routers organized by domain in `/src/lib/trpc/routers`
- Always use Zod for input validation
- Implement proper error handling
- Keep procedures focused

### 6. Authentication
- Use unified auth system in `/src/lib/auth/auth-system.ts`
- Always check auth state in protected routes
- Use proper role-based access control

### 7. Error Handling
- Use standardized error types
- Implement error boundaries
- Log errors server-side
- Provide user-friendly messages

### 8. Performance
- Use React Query caching appropriately
- Implement virtualization for large lists
- Use dynamic imports for code splitting
- Optimize images with Next.js Image

### 9. Database Access
- Use Prisma as primary ORM
- Keep database logic in services
- Use proper transaction handling
- Implement optimistic updates

### 10. Code Quality
- Run linting before commits
- Follow TypeScript strict mode
- Document complex logic
- Write tests for all functionality

## Common Issues and Solutions

### Hydration Errors
- Use dynamic imports for client-only components
- Wrap problematic components with `suppressHydrationWarning`
- Ensure client/server states match

### Type Errors
- Verify imports are from `/src/types`
- Check Prisma generated types are up-to-date
- Run `npm run type-check` to verify

### Build Errors
- Clear Next.js cache: `rm -rf .next`
- Regenerate Prisma client: `npx prisma generate`
- Verify all environment variables are set

## Testing Strategy

### Unit Tests
- Located in `/tests/unit`
- Use Jest for testing
- Run with: `npm run test:unit`

### E2E Tests
- Use Playwright
- Run with: `npm run test:e2e`
- Visual testing: `npm run test:e2e:enhanced:visual`

### Performance Tests
- Run with: `npm run test:e2e:enhanced:perf`
- Check Core Web Vitals

## Deployment

### Vercel Deployment
- Configured via `vercel.json`
- Environment variables must be set in Vercel dashboard
- Uses standalone output mode

### Database Migrations
- Use Prisma migrations
- Never modify migration files
- Test migrations locally first

## Important URLs

- Client Portal: `/client-portal`
- Admin Dashboard: `/admin-dashboard`
- API Routes: `/api/`
- tRPC Endpoint: `/api/trpc/[trpc]`

## Safety Checks

Before making changes:
1. Verify no index.ts barrel files are created
2. Ensure types are properly imported from `/src/types`
3. Check authentication on protected routes
4. Validate all user inputs with Zod
5. Test database operations locally
6. Run linting and type checks

## Notes

- The project uses strict TypeScript settings
- ESLint is configured but ignored during builds
- Material UI and Tailwind CSS coexist
- Supabase handles authentication and realtime features
- Prisma manages database schema and migrations