# Type System Consolidation Plan

## Executive Summary
The types directory contains significant duplication with Prisma-generated types. We should consolidate to use Prisma as the single source of truth for database models while keeping UI/business logic types separate.

## Immediate Actions

### 1. Enum Conflicts to Resolve
These enums exist in both places with different values and need immediate reconciliation:

```typescript
// AppointmentStatus - Prisma uses UPPERCASE, types uses lowercase
// PaymentStatus - types has more values than Prisma
// UserRole - Different values completely
// CalBookingStatus - types has RESCHEDULED, Prisma doesn't
```

### 2. Files to Delete
These files duplicate Prisma models and should be removed:
- `src/types/model-types.ts` - All interfaces (Booking, Customer, Payment, etc.) exist in Prisma
- `src/types/customer-types.ts` - Customer model exists in Prisma, keep only validation schemas
- `src/types/payments-types.ts` - Payment model exists in Prisma
- `src/types/note-types.ts` - Note model exists in Prisma
- `src/types/database.types.ts` - Redundant with Prisma client

### 3. Enums to Add to Prisma Schema
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

enum NotificationType {
  APPOINTMENT_REMINDER
  APPOINTMENT_BOOKED
  APPOINTMENT_UPDATED
  APPOINTMENT_CANCELLED
  DESIGN_READY
  PAYMENT_RECEIVED
  PAYMENT_FAILED
  MESSAGE_RECEIVED
}

enum ContactFormStatus {
  NEW
  CONTACTED
  CONVERTED
  NOT_INTERESTED
  SPAM
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  CONSULTATION_SCHEDULED
  APPOINTMENT_BOOKED
  LOST
}

enum GalleryImageStatus {
  PENDING
  APPROVED
  FEATURED
  ARCHIVED
  REJECTED
}
```

### 4. Restructure enum-types.ts
Split into focused files:
- `ui-enums.ts` - Breakpoint, Size, ColorScheme, ThemeColor, Variant
- `error-enums.ts` - ErrorCode, ErrorCategory, ErrorSeverity
- `analytics-enums.ts` - CalAnalyticsEventType, BookingEventType, CalBookingStage
- `integration-enums.ts` - MeetingType, CalErrorCode, CalServiceCategory

### 5. Update Import Strategy
```typescript
// OLD - importing from types directory
import { Customer, Payment } from '@/types/model-types';
import { PaymentStatus } from '@/types/enum-types';

// NEW - importing from Prisma
import type { Customer, Payment, PaymentStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';

// For relations
type CustomerWithPayments = Prisma.CustomerGetPayload<{
  include: { payments: true }
}>;
```

## Migration Script Needed
Create a script to:
1. Find all imports from deleted type files
2. Replace with Prisma imports
3. Update enum value case (lowercase to UPPERCASE)
4. Handle any type mismatches

## Benefits
1. **Single Source of Truth**: Database schema drives all model types
2. **Automatic Updates**: Schema changes automatically update TypeScript types
3. **Reduced Maintenance**: No manual type synchronization needed
4. **Better Type Safety**: Guaranteed consistency between database and code
5. **Cleaner Codebase**: ~50% reduction in type files

## Risks & Mitigations
1. **Breaking Changes**: Enum value changes (lowercase to UPPERCASE)
   - Mitigation: Search and replace script
2. **Missing Types**: Some app-specific types might be lost
   - Mitigation: Keep validation schemas and UI types
3. **Import Updates**: Hundreds of import statements need updating
   - Mitigation: Automated migration script

## Timeline
1. **Phase 1** (1 day): Update Prisma schema with new enums
2. **Phase 2** (1 day): Create and run migration scripts
3. **Phase 3** (2 days): Test and fix any runtime issues
4. **Phase 4** (1 day): Clean up and reorganize remaining types

## Recommendation
Proceed with this consolidation. The long-term benefits of maintainability and type safety outweigh the short-term migration effort. This aligns with the principle of "Clarity over cleverness" and "The stack is not the innovation."
