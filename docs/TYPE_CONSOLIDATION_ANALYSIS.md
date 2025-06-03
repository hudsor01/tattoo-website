# Type Consolidation Analysis Report

## Overview
This report analyzes the type definitions in `src/types` directory and compares them with Prisma schema definitions to identify consolidation opportunities.

## Enums Comparison

### 1. DUPLICATE ENUMS (exist in both Prisma and types/enum-types.ts)
These should be removed from enum-types.ts and imported from @prisma/client:

- **AppointmentStatus** - CONFLICT: Different values in each
  - Prisma: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
  - enum-types: pending, scheduled, confirmed, in_progress, completed, cancelled, no_show
  - Action: Remove from enum-types.ts, update code to use Prisma version

- **PaymentStatus** - CONFLICT: Different values
  - Prisma: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED, CANCELLED
  - enum-types: pending, paid, failed, refunded, partial, completed, verified, cancelled, processing, partially_refunded
  - Action: Either update Prisma schema to include missing values OR remove extra values from code

- **UserRole** - CONFLICT: Different values
  - Prisma: USER, CUSTOMER, ARTIST, ADMIN, SUPERADMIN
  - enum-types: ADMIN, ARTIST, CLIENT, GUEST
  - Action: Reconcile differences, likely update Prisma to match business needs

- **PaymentType** - MATCH: Same values
  - Action: Remove from enum-types.ts, use Prisma version

- **PaymentMethod** - MATCH: Same values
  - Action: Remove from enum-types.ts, use Prisma version

- **CalBookingStatus** - CONFLICT: Different values
  - Prisma: PENDING, ACCEPTED, CONFIRMED, CANCELLED, REJECTED, NO_SHOW, COMPLETED
  - enum-types: CONFIRMED, CANCELLED, PENDING, COMPLETED, NO_SHOW, RESCHEDULED
  - Action: Update Prisma schema to include RESCHEDULED if needed

### 2. ENUMS ONLY IN types/enum-types.ts
These need evaluation - should they be in Prisma schema or remain as UI/business logic enums?

#### Should be added to Prisma schema (database-related):
- **BookingSource** - Tracks where bookings come from
- **TattooSize** - Business domain model
- **TattooStyle** - Business domain model
- **NotificationType** - If storing notifications in DB
- **BookingStatus** - Seems like duplicate of CalBookingStatus
- **ClientStatus** - Customer status tracking
- **EmailStatus** - If tracking email delivery
- **ContactFormStatus** - For contact form submissions
- **LeadStatus** - Lead management
- **GalleryImageStatus** - For gallery management
- **UploadStatus** - If tracking uploads in DB

#### Should remain in types (UI/business logic):
- **Permission** - Already exists as a model in Prisma, this enum for app logic
- **UserStatus** - If not stored in DB
- **Breakpoint** - UI concern
- **CalBookingStage** - UI state management
- **CalServiceCategory** - Business categorization
- **CalAnalyticsEventType** - Analytics tracking
- **MeetingType** - Cal.com integration specific
- **BookingEventType** - Analytics events
- **CalErrorCode** - Error handling
- **BookingStep** - UI flow state
- **ErrorCode** - Application error codes
- **ErrorCategory** - Error categorization
- **ErrorSeverity** - Error prioritization
- **DataSubjectRequestType** - GDPR handling
- **RequestStatus** - Generic request tracking

#### Type literals (not enums) - Keep in types:
- Size, ColorScheme, ThemeColor, Variant, etc. - All UI concerns

### 3. ENUMS ONLY IN Prisma schema
These are correctly placed:
- **NoteType** - Database model
- **HealthStatus** - Database model
- **SyncStatus** - Database model

## Type Files Analysis

### Files that should be removed/consolidated:
1. **model-types.ts** - Should use Prisma types directly
2. **customer-types.ts** - Should use Prisma Customer type
3. **payments-types.ts** - Should use Prisma Payment type
4. **note-types.ts** - Should use Prisma Note type
5. **database.types.ts** - Redundant with Prisma client

### Files that should remain (non-database types):
1. **analytics-events.ts** - Analytics tracking types
2. **analytics-types.ts** - Analytics business logic
3. **api-types.ts** - API request/response types
4. **auth-types.ts** - Authentication logic types
5. **booking-types.ts** - Cal.com integration types
6. **cal-types.ts** - Cal.com API types
7. **component-types.ts** - UI component props
8. **cookie-types.ts** - Cookie handling
9. **dashboard-types.ts** - Dashboard UI types
10. **email-types.ts** - Email service types
11. **framer-motion-types.ts** - Animation types
12. **function-types.ts** - Utility function types
13. **gallery-types.ts** - Gallery UI types
14. **service-types.ts** - Service/business logic types
15. **settings-types.ts** - Settings UI types
16. **trpc-types.ts** - tRPC related types
17. **utility-types.ts** - General utility types
18. **validation-types.ts** - Validation schemas

## Recommended Actions

### Phase 1: Update Prisma Schema
1. Add missing enums that represent database state:
   ```prisma
   enum BookingSource {
     WEBSITE
     PHONE
     EMAIL
     SOCIAL
     WALK_IN
     REFERRAL
   }
   
   enum TattooSize {
     SMALL
     MEDIUM
     LARGE
     EXTRA_LARGE
     FULL_SLEEVE
     HALF_SLEEVE
     BACK_PIECE
     CUSTOM
   }
   
   enum TattooStyle {
     TRADITIONAL
     NEO_TRADITIONAL
     REALISM
     WATERCOLOR
     BLACKWORK
     TRIBAL
     JAPANESE
     MINIMALIST
     GEOMETRIC
     PORTRAIT
     SCRIPT
     COVER_UP
     CUSTOM
   }
   ```

2. Reconcile conflicting enums (AppointmentStatus, PaymentStatus, UserRole, CalBookingStatus)

### Phase 2: Remove Duplicate Type Files
1. Delete files that duplicate Prisma models:
   - model-types.ts
   - customer-types.ts
   - payments-types.ts
   - note-types.ts
   - database.types.ts

2. Update imports throughout codebase to use `@prisma/client`

### Phase 3: Clean up enum-types.ts
1. Remove enums that exist in Prisma
2. Keep only UI/business logic enums
3. Consider splitting into multiple files:
   - ui-enums.ts (Breakpoint, Size, ColorScheme, etc.)
   - error-enums.ts (ErrorCode, ErrorCategory, ErrorSeverity)
   - analytics-enums.ts (CalAnalyticsEventType, BookingEventType)
   - integration-enums.ts (MeetingType, CalErrorCode)

### Phase 4: Update lib/prisma-types.ts
1. Remove redundant re-exports
2. Keep only utility types and type helpers
3. Focus on Prisma.GetPayload patterns and type combinations

## Benefits
1. Single source of truth for database types
2. Automatic type generation from schema
3. Reduced maintenance overhead
4. Better type safety
5. Cleaner, more organized codebase
6. Easier onboarding for new developers

## Risks to Consider
1. Breaking changes in existing code
2. Need to update many import statements
3. Potential runtime issues if enum values differ
4. May need database migrations for new enums
