# Type System Migration Guide

## Overview
We've completed a major type consolidation to eliminate duplication between Prisma models and custom type definitions. This guide explains the changes and how to update your code.

## Key Changes

### 1. Enum Consolidation
All database-related enums are now defined in the Prisma schema and imported from `@prisma/client`.

**Before:**
```typescript
import { PaymentStatus, PaymentMethod } from '@/types/enum-types';
```

**After:**
```typescript
import { PaymentStatus, PaymentMethod } from '@prisma/client';
```

### 2. New Enum Additions
The following enums have been added to the Prisma schema:
- `TattooSize`: Enum for tattoo sizes (SMALL, MEDIUM, LARGE, etc.)
- `TattooStyle`: Enum for tattoo styles (TRADITIONAL, REALISM, etc.)
- `BookingSource`: Enum for booking sources (WEBSITE, PHONE, etc.)

### 3. Type File Reorganization

#### Deleted Files
- `src/types/model-types.ts` - Duplicated Prisma models
- `src/types/enum-types.ts` - Moved to specialized files

#### New Type Files
- `src/types/prisma-enums.ts` - Re-exports all Prisma enums
- `src/types/ui-types.ts` - UI-only enums and types
- `src/types/error-types.ts` - Error handling types
- `src/types/analytics-enums.ts` - Analytics and tracking enums

### 4. Import Updates

#### For Prisma Enums
```typescript
// Old
import { AppointmentStatus, PaymentStatus } from '@/types/enum-types';

// New
import { AppointmentStatus, PaymentStatus } from '@prisma/client';
// or
import { AppointmentStatus, PaymentStatus } from '@/types/prisma-enums';
```

#### For UI Types
```typescript
// Old
import { Size, ThemeColor } from '@/types/enum-types';

// New
import { Size, ThemeColor } from '@/types/ui-types';
```

#### For Analytics Types
```typescript
// Old
import { CalAnalyticsEventType } from '@/types/enum-types';

// New
import { CalAnalyticsEventType } from '@/types/analytics-enums';
```

## Migration Checklist

1. **Update imports** - Replace all imports from `enum-types.ts` with appropriate new locations
2. **Use Prisma types** - For database models, use types directly from `@prisma/client`
3. **Check enum values** - Some enum values have changed from lowercase to uppercase (e.g., 'pending' → 'PENDING')
4. **Run type checking** - Use `npm run type-check` to find any remaining type errors
5. **Test thoroughly** - Ensure all database operations still work correctly

## Benefits

1. **Single source of truth** - Database enums are defined once in Prisma schema
2. **Type safety** - Prisma generates TypeScript types automatically
3. **Reduced duplication** - No more maintaining duplicate type definitions
4. **Better organization** - Types are grouped by their purpose

## Common Issues and Solutions

### Issue: Enum value mismatch
If you get errors about enum values not matching:
- Check if the enum values changed from lowercase to uppercase
- Update your code to use the new values

### Issue: Missing imports
If TypeScript can't find a type:
- Check the migration guide above for the new import location
- Use the centralized export from `@/types/index`

### Issue: Type conflicts
If you have naming conflicts:
- Use aliased imports: `import { PaymentStatus as PrismaPaymentStatus } from '@prisma/client'`
- Or use the re-export files which handle conflicts

## Future Considerations

- Consider migrating more string fields to enums in the database
- Add validation at the API layer to ensure enum values are correct
- Use Zod schemas that align with Prisma enums for runtime validation
