# Type Migration Plan for Tattoo Website

## Analysis Results

Based on the analysis, here are the 45 imports from `lib/prisma-types.ts`:

### Component Props & UI Types (Should move to component files or `types/component-props.ts`):
- `CTASectionProps` - CTA section component
- `LogoProps` - Logo component  
- `ServicesHeaderProps` - Services header
- `FAQAccordionProps`, `FAQSearchProps`, `FAQItemType`, `FAQCategory`, `AllFAQItem` - FAQ components
- `AuthContextType`, `AuthProviderProps` - Auth provider
- `AdminPageHeaderProps`, `AdminPageStructureProps` - Admin layout
- `VirtualizedBookingsListProps` - Bookings list
- `ContactFormState` - Contact form state
- `NavigationLink` - Navigation
- `MetricCardProps` - Dashboard metrics
- `ChartTooltipProps` - Chart tooltips
- `Service` - Service card component

### Business Logic Types (Should move to domain-specific files):
- `PricingBreakdown`, `StandardPricingData`, `ArtistRate` - Move to `lib/pricing/types.ts`
- `TattooImage`, `VideoProcess`, `GalleryDesign`, `GalleryDesignDto`, `UseGalleryInfiniteResult` - Move to `lib/gallery/types.ts`
- `ContactFormData` - Move to `lib/email/types.ts`
- `DashboardStatsResponse`, `DashboardPeriod` - Move to `lib/dashboard/types.ts`

### External API Types (Should stay in dedicated files):
- `CalWebhookPayload`, `CalBookingPayload`, `CalService`, `CalBookingWithRelations` - Keep in `types/cal-types.ts`
- `CalAnalyticsEventType`, `CalBookingStage` - Already in `types/analytics-enums.ts`

### Error Types (Already organized):
- `ErrorCode` - Already in `types/error-types.ts`
- `ApiError`, `ValidationError` - Move to `types/error-types.ts`

### Database Types (Should use Prisma directly):
- `DatabasePayment` - Use `Payment` from `@prisma/client`
- `AdminExtendedUser` - Use `User` from `@prisma/client`
- `AdminDataTableColumn` - Generic type, move to component

### Utility Types:
- `DateRange` - Move to `types/utility-types.ts`

## Migration Steps

### Step 1: Create Domain-Specific Type Files
