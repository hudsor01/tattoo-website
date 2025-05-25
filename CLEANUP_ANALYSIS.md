# Files Analysis for Cleanup

## Files Safe to Remove

### API Routes (Unused/Duplicate)
- `src/app/api/pricing/route.ts` - Pricing API not used anywhere in frontend, functionality likely handled by Cal.com
- `src/app/api/cal/test-connection/route.ts` - Development/testing endpoint, not needed in production
- `src/app/api/webhooks/clerk/test/route.ts` - Development/testing endpoint, not needed in production

### Type Files (Potentially Consolidatable)
- `src/lib/trpc/types/context.ts` - Could be consolidated into main context.ts file since it's only used there

### Hooks (Already Deleted but may have references)
- References to `use-booking` hook (deleted) may need cleanup
- References to `use-supabase-infinite` hook (deleted) may need cleanup

## Files to Keep (Core Functionality)

### Client-Facing Website
- All page components (home, about, services, gallery, contact, booking, faq)
- Navigation components
- UI components in use

### Admin Dashboard
- All admin components and pages
- Dashboard router and related functionality

### Core Integrations
- Cal.com integration files
- Clerk authentication
- Prisma ORM setup
- Supabase client setup
- tRPC routers and procedures

## Recommendations

1. **Remove test/development endpoints** - The test connection endpoints are not needed in production
2. **Consolidate type definitions** - Move TRPCContext types into main context file
3. **Clean up pricing API** - Not being used by frontend, Cal.com handles pricing
4. **Verify all imports** - Some components may still reference deleted hooks

## Next Steps
1. Remove the identified unused files
2. Run type check to find broken imports
3. Fix any remaining references to deleted files
4. Continue with error fixing

## Files Found in Git Status (Already Deleted)
- Various backup files (*.bak, *.backup)
- Test suites and documentation files
- Docker and deployment configs
- Old component implementations