# Unused Files Analysis Report

## Summary

I've analyzed the files reported as unused by your script. Here's what I found:

### ✅ Safe to Remove (14 files)

These files are duplicates or genuinely unused:

1. **src/components/ServicesSection.tsx** - Duplicate of `src/components/services/ServicesSection.tsx`
2. **src/hooks/create-optimistic-mutation-hook.ts** - Unused utility hook
3. **src/hooks/create-query-hooks.ts** - Unused utility hook
4. **src/hooks/createStandardQueryHooks.ts** - Unused utility hook
5. **src/lib/api-functions.ts** - Old API utilities (replaced by tRPC)
6. **src/utils/lazy-loading.ts** - Duplicate of `src/lib/utils/lazy-loading.ts`
7. **src/utils/memoization.ts** - Duplicate of `src/lib/utils/hooks/use-memoization.ts`
8. **src/shared/components/ModeSwitch.tsx** - Unused component
9. **src/lib/supabase-simple.ts** - Using other Supabase client files
10. **src/lib/dynamic-components.ts** - Not used in codebase
11. **src/lib/keys.tsx** - Unused constants file
12. **src/lib/validation-server.ts** - Using other validation files
13. **src/lib/validations/validation.ts** - Duplicate validations exist
14. **src/config/seo.ts** - SEO handled in metadata files

### ⚠️ Next.js Required Files (15 files)

**NEVER DELETE THESE** - They are required by Next.js App Router:

1. All `metadata.ts` files in app routes
2. `layout.tsx`, `page.tsx`, `error.tsx`, `loading.tsx`, `not-found.tsx`
3. `global-error.tsx`, `robots.ts`, `sitemap.ts`

### 🔍 Need Investigation (11 files)

These might be used dynamically or through email systems:

#### Booking Components (might be used in future)
- `src/components/booking/BookingForm.tsx`
- `src/components/booking/BookingStepTracker.tsx`
- `src/components/booking/submit-booking-button.tsx`

#### Payment Components (might be used in future)
- `src/components/payments/DepositPayment.tsx`
- `src/components/payments/PaymentProcessor.tsx`

#### Email Templates (likely used by email system)
- `src/emails/AuthConfirmation.tsx`
- `src/emails/ContactConfirmation.tsx`

#### Hooks (might be used dynamically)
- `src/hooks/use-realtime.ts`
- `src/hooks/use-supabase-upload.ts`

#### Store Files (might be used)
- `src/store/useAppStore.tsx`
- `src/store/useUIStore.tsx`

## Recommendations

1. **Immediate Action**: You can safely run the cleanup script to remove the 14 files in the "Safe to Remove" category.

2. **Keep All Next.js Files**: Never delete any files from the Next.js required list.

3. **Manual Review**: For the investigation files:
   - Check if there are future plans for booking/payment features
   - Verify email templates are not used by your email service
   - Check if hooks are imported dynamically
   - Review if store files are used in your state management

## How to Proceed

1. Run the safe cleanup script:
   ```bash
   ./safe-cleanup.sh
   # Choose option 1 to backup and remove safe files
   ```

2. For investigation files, check usage:
   ```bash
   # Check for dynamic imports
   grep -r "dynamic.*import.*BookingForm" src/
   
   # Check email usage
   grep -r "AuthConfirmation" src/lib/email/
   
   # Check store usage
   grep -r "useAppStore\|useUIStore" src/
   ```

3. Consider keeping booking/payment components if you plan to implement these features soon.

## Cleanup Results

After removing the safe files, you'll save approximately:
- 14 unused files
- Reduce code complexity
- Remove duplicate implementations

The backup will be stored in the `backup/` directory with a timestamp.