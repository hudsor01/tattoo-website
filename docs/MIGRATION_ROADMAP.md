# 🚀 COMPLETE PRISMA TYPE MIGRATION ROADMAP

# PRISMA-FIRST TYPE SYSTEM PROCESS

## 🎯 SINGLE SOURCE OF TRUTH: Prisma Schema → TypeScript Types

**NO MORE MANUAL TYPE DEFINITIONS. EVERYTHING FLOWS FROM PRISMA SCHEMA.**

## ⚡ The Process (When You Need Types)

### 1. **FIRST: Check if Type Exists in Prisma**
```bash
# Check what types are available from Prisma
npx prisma generate
```

Look in these places for existing types:
- `@prisma/client` - All entity types, input types, where clauses
- `@/lib/prisma-types` - Utility types and type helpers

### 2. **SECOND: Use Prisma-Generated Types**
```typescript
// ✅ CORRECT - Use Prisma-generated types
import { Customer, Payment, CalBooking } from '@prisma/client';
import type { 
  CustomerCreateInput, 
  CustomerUpdateInput,
  CustomerWithRelations,
  PaymentWithRelations 
} from '@/lib/prisma-types';

// ❌ WRONG - Never create manual types
interface CustomCustomerType {
  id: string;
  name: string;
  // ... manual type definition
}
```

### 3. **THIRD: If Type Doesn't Exist - Add to Schema First**
If you need a type that doesn't exist, **DO NOT CREATE A MANUAL TYPE**. Instead:

1. **Add to Prisma Schema** (`/prisma/schema.prisma`)
2. **Run Migration** (`npx prisma db push`)
3. **Generate Client** (`npx prisma generate`)
4. **Import from Prisma** (`@prisma/client` or `@/lib/prisma-types`)

### 4. **FOURTH: Add to Memory Knowledge Graph**
Use the MCP memory system to document the type addition:

```typescript
// Add to knowledge graph
{
  entityType: "TypeDefinition",
  name: "NewEntityType",
  observations: [
    "Added to Prisma schema on [date]",
    "Available from @prisma/client",
    "Relations: [list relations]",
    "Used in: [list usage]"
  ]
}
```

## 🚫 BANNED PRACTICES

### ❌ Manual Type Definitions
```typescript
// NEVER DO THIS
interface Customer {
  id: string;
  name: string;
}

// NEVER DO THIS
type PaymentStatus = 'pending' | 'completed';

// NEVER DO THIS
export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
});
```

### ❌ Using any/unknown/never
```typescript
// NEVER DO THIS
function processPayment(data: any) { }
function handleCustomer(customer: unknown) { }
const result: never = undefined;
```

### ❌ Importing from Manual Type Files
```typescript
// NEVER DO THIS - ESLint will block these
import { CustomerType } from '@/types/customer-types';
import { PaymentData } from '@/types/payments-types';
import { BookingInfo } from '@/types/booking-types';
```

## ✅ APPROVED PRACTICES

### ✅ Import from Prisma
```typescript
// Always do this
import { Customer, Payment, CalBooking } from '@prisma/client';
import type { 
  CustomerCreateInput,
  PaymentWithRelations,
  ApiResponse 
} from '@/lib/prisma-types';
```

### ✅ Use Type Utilities
```typescript
// Create derived types using Prisma utilities
import { Prisma } from '@prisma/client';

// Select specific fields
const customerPublic = Prisma.validator<Prisma.CustomerSelect>()({
  id: true,
  firstName: true,
  lastName: true,
  email: true,
});

type CustomerPublic = Prisma.CustomerGetPayload<{ select: typeof customerPublic }>;
```

### ✅ Use Type Guards
```typescript
// Use provided type guards
import { isPaymentStatus, isUserRole } from '@/lib/prisma-types';

if (isPaymentStatus(status)) {
  // TypeScript knows status is PaymentStatus
}
```

## 🔧 Tools & Enforcement

### TSConfig.json Enforcement
- `noImplicitAny: true` - No implicit any types
- `strictNullChecks: true` - Null safety
- `noImplicitReturns: true` - All code paths return
- `noUnusedParameters: true` - Clean code

### ESLint Enforcement
- `@typescript-eslint/no-explicit-any: error` - Blocks any
- `@typescript-eslint/no-unsafe-*: error` - Blocks unsafe operations
- `no-restricted-imports` - Blocks manual type imports
- Custom rules block imports from `/types/` directories

### Next.js Build Enforcement
- `typescript.ignoreBuildErrors: false` - Build fails on type errors
- `eslint.ignoreDuringBuilds: false` - Build fails on lint errors

## 📋 Checklist for Every Type Usage

Before writing any type:

- [ ] **Check**: Does this type exist in `@prisma/client`?
- [ ] **Check**: Does this type exist in `@/lib/prisma-types`?
- [ ] **Check**: Can I derive this from existing Prisma types?
- [ ] **If No**: Should I add this to the Prisma schema?
- [ ] **Never**: Create a manual type definition
- [ ] **Never**: Use any, unknown, or never
- [ ] **Always**: Import from Prisma or utility file

## 🎯 Benefits of This System

1. **Zero Type Drift** - Database and TypeScript always aligned
2. **Automatic Updates** - Schema changes auto-update types
3. **Better IntelliSense** - Prisma types include relations
4. **Faster Development** - No manual type maintenance
5. **Safer Code** - Runtime validation matches compile-time types
6. **Team Alignment** - Everyone uses same type source

## 🚨 When You See Type Errors

Instead of adding `any` or creating manual types:

1. **Run**: `npx prisma generate` (regenerate types)
2. **Check**: Are you importing from the right place?
3. **Update**: Use Prisma-generated types
4. **Add**: New fields to Prisma schema if needed
5. **Ask**: Team for guidance if stuck

## 📖 Quick Reference

### Common Import Patterns
```typescript
// Entities
import { Customer, Payment, User } from '@prisma/client';

// Input Types  
import type { CustomerCreateInput, PaymentUpdateInput } from '@prisma/client';

// Relations
import type { CustomerWithRelations, PaymentWithRelations } from '@/lib/prisma-types';

// API Types
import type { ApiResponse, PaginatedResponse } from '@/lib/prisma-types';

// Type Guards
import { isPaymentStatus, isUserRole } from '@/lib/prisma-types';
```

### Common Type Patterns
```typescript
// API Response
function getCustomers(): ApiResponse<Customer[]> { }

// With Relations
function getCustomerWithPayments(): CustomerWithRelations { }

// Public API (selected fields)
function getPublicCustomer(): CustomerPublic { }

// Form Data
function createCustomer(data: CustomerCreateInput): Customer { }
```

**Remember: When in doubt, ask the team. Never create manual types.**

## 📊 **Current Status: Infrastructure Complete**

✅ **Phase 1: Foundation** (COMPLETED)
- Prisma type system created (`/src/lib/prisma-types.ts`)
- Build guardrails implemented (TSConfig, ESLint, Next.js)
- Process documented (CLAUDE.md, PRISMA_TYPE_PROCESS.md)
- MCP memory updated with new workflow

## 🎯 **Remaining Work: File Migration (~500 files)**

### **Phase 2: Critical File Migration** (IMMEDIATE - 2-3 hours)

**Priority 1: API Layer (High Impact)**
```bash
# tRPC Routers (~15 files) - CRITICAL
src/lib/trpc/routers/*.ts
src/lib/trpc/routers/admin/*.ts
src/lib/trpc/routers/dashboard/*.ts

# API Routes (~20 files) - HIGH IMPACT  
src/app/api/**/*.ts
```

**Priority 2: Core Libraries (High Impact)**
```bash
# Database utilities (~10 files)
src/lib/db/*.ts

# Authentication (~5 files)
src/lib/auth*.ts

# Actions (~5 files)  
src/lib/actions/*.ts
```

### **Phase 3: Component Migration** (3-4 hours)

**Priority 3: Admin Components (Medium Impact)**
```bash
# Admin dashboard (~30 files)
src/components/admin/*.tsx
src/app/admin/**/*.tsx
```

**Priority 4: Form Components (Medium Impact)**
```bash
# Contact/booking forms (~10 files)
src/components/contact/*.tsx
src/components/booking/*.tsx
```

### **Phase 4: Hook Migration** (1-2 hours)

**Priority 5: Custom Hooks (Low-Medium Impact)**
```bash
# Custom hooks (~15 files)
src/hooks/*.ts
```

### **Phase 5: Type File Cleanup** (1 hour)

**Priority 6: Remove Legacy Types (Cleanup)**
```bash
# Remove manual type files
src/types/customer-types.ts      # DELETE
src/types/payments-types.ts      # DELETE  
src/types/booking-types.ts       # DELETE
src/types/appointment-types.ts   # DELETE
# Keep only: utility-types.ts, trpc-types.ts, enum-types.ts (if still needed)
```

## 🔧 **Migration Strategy: Systematic Approach**

### **Step 1: Automated Search & Replace** (30 minutes)
```bash
# Find all files with banned imports
grep -r "from '@/types/" src/ --include="*.ts" --include="*.tsx" | wc -l

# Create list of files to migrate
grep -r "from '@/types/customer-types'" src/ --include="*.ts" --include="*.tsx" -l > customer-migration-list.txt
grep -r "from '@/types/payments-types'" src/ --include="*.ts" --include="*.tsx" -l > payment-migration-list.txt
grep -r "from '@/types/booking-types'" src/ --include="*.ts" --include="*.tsx" -l > booking-migration-list.txt
```

### **Step 2: Batch Migration Tool** (45 minutes)
```bash
# Create migration script to process files in batches
# Replace common patterns:
# '@/types/customer-types' → '@prisma/client'  
# '@/types/payments-types' → '@prisma/client'
# CustomerType → Customer
# PaymentData → Payment
```

### **Step 3: File-by-File Verification** (2-3 hours)
- Process high-priority files first
- Test each file after migration
- Fix any unique type issues
- Ensure ESLint passes

## 📋 **Migration Checklist per File**

For each file being migrated:

```bash
# Before migration
□ Identify current imports from @/types/
□ Note any manual type definitions  
□ Check for any, unknown, never usage

# During migration  
□ Replace imports with @prisma/client equivalents
□ Update type references to Prisma types
□ Remove manual type definitions
□ Add relation types if needed

# After migration
□ Run: npx eslint [filename] --quiet
□ Run: npx tsc --noEmit [filename]  
□ Test functionality still works
□ Commit changes
```

## 🎯 **Expected Timeline**
**Total Estimated Time: 7-10 hours**

| Phase | Time | Files | Impact |
|-------|------|-------|---------|
| Phase 2: API Layer | 2-3 hours | ~50 files | HIGH |
| Phase 3: Components | 3-4 hours | ~40 files | MEDIUM |
| Phase 4: Hooks | 1-2 hours | ~15 files | MEDIUM |
| Phase 5: Cleanup | 1 hour | ~10 files | LOW |

## 🚀 **Migration Benefits Per Phase**

**After Phase 2 (API Layer):**
- ✅ Zero type drift in API layer
- ✅ All tRPC procedures use Prisma types
- ✅ Database operations fully type-safe

**After Phase 3 (Components):**
- ✅ Admin dashboard fully Prisma-aligned
- ✅ Forms use proper input types
- ✅ UI components type-safe

**After Phase 4 (Hooks):**
- ✅ Custom hooks use Prisma types
- ✅ Data fetching fully aligned
- ✅ State management type-safe

**After Phase 5 (Cleanup):**
- ✅ Legacy type files removed
- ✅ Build passes with zero warnings
- ✅ ESLint enforces compliance
- ✅ **DEVELOPMENT IS SO MUCH FUCKING FASTER** 🚀

## 🛠️ **Tools for Migration**

1. **VS Code Multi-file Search & Replace**
2. **ESLint**: Instant feedback on violations
3. **TypeScript**: Catch issues immediately  
4. **Git**: Commit changes incrementally
5. **Automated Scripts**: For batch processing

## 🎉 **End Goal**

After complete migration:
- **ZERO manual type definitions**
- **ZERO type drift possible**
- **ZERO build failures from types**
- **100% Prisma-first development**
- **Massive development speed increase**

The infrastructure is ready. Now it's systematic file migration to complete the transformation.