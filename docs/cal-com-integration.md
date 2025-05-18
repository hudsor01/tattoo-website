# Cal.com Integration Documentation

This document explains how Cal.com has been integrated into the tattoo website to handle bookings, appointments, and payments.

## Overview

The integration replaces the custom booking system with Cal.com's professional scheduling solution. Cal.com handles:
- Appointment scheduling
- Calendar management
- Payment processing (optional)
- Email notifications
- Rescheduling and cancellations

## Setup Instructions

### 1. Cal.com Account Setup

1. Create a Cal.com account at [cal.com](https://cal.com)
2. Set up your profile with:
   - Business name: Fernando Govea Tattoo
   - Location: Dallas/Fort Worth, TX
   - Timezone: America/Chicago

### 2. Event Types Configuration

Create the following event types in Cal.com:

1. **Tattoo Consultation** (30 minutes)
   - Free initial consultation
   - Custom questions for tattoo details
   
2. **Deposit Payment** (15 minutes)
   - Quick meeting to collect deposit
   - Enable payment collection ($200)
   
3. **Design Review** (30 minutes)
   - Review custom tattoo design
   - Discuss any changes needed

### 3. Custom Fields

For each event type, add these custom fields:

```
- Tattoo Type (required, select)
  - Traditional
  - Realism
  - Japanese
  - Black & Grey
  - Watercolor
  - Minimalist
  - Geometric
  - Custom

- Size (required, select)
  - Small (2-4 inches)
  - Medium (4-6 inches)
  - Large (6-8 inches)
  - Extra Large (8+ inches)
  - Full Sleeve
  - Half Sleeve
  - Back Piece

- Placement (required, text)
- Description (required, textarea)
- Reference Images URLs (optional, textarea)
- Budget Range (optional, select)
```

### 4. Environment Variables

Add these to your `.env` file:

```bash
NEXT_PUBLIC_CAL_USERNAME="your-cal-username"
CAL_WEBHOOK_SECRET="your-webhook-secret"
```

### 5. Webhook Configuration

1. In Cal.com settings, go to Webhooks
2. Add a new webhook:
   - URL: `https://yourdomain.com/api/cal/webhook`
   - Events to subscribe:
     - booking.created
     - booking.cancelled
     - booking.rescheduled
     - booking.updated
3. Copy the webhook secret to your `.env` file

## File Structure

```
src/
├── app/
│   ├── booking/
│   │   ├── page.tsx         # Main booking page with Cal.com embed
│   │   ├── booking.css      # Custom styles for Cal.com embed
│   │   └── metadata.ts      # SEO metadata
│   └── api/
│       └── cal/
│           └── webhook/
│               └── route.ts # Webhook handler for Cal.com events
├── types/
│   └── cal-types.ts        # TypeScript types for Cal.com integration
├── lib/
│   └── cal/
│       └── config.ts       # Cal.com configuration settings
└── app/
    └── admin-dashboard/
        └── cal-bookings/
            └── page.tsx    # Admin page to view Cal.com bookings
```

## Implementation Details

### Booking Page (`/booking`)

The booking page embeds Cal.com's scheduling widget:

```typescript
<Cal
  namespace="tattoo-booking"
  calLink={`${CAL_USERNAME}/${CAL_EVENT_TYPE}`}
  config={{
    theme: 'light',
    branding: {
      brandColor: '#000000',
    },
    metadata: {
      tattooType: 'required',
      size: 'required',
      placement: 'required',
      description: 'required',
    },
  }}
/>
```

### Webhook Handler

The webhook handler (`/api/cal/webhook`) processes Cal.com events:

1. Verifies webhook signature for security
2. Parses the event payload
3. Extracts tattoo-specific data from custom fields
4. Logs events (database integration pending)
5. Triggers email notifications (pending)

### Custom Styling

Custom CSS overrides Cal.com's default styles to match the tattoo website theme:

```css
.cal-embed {
  --cal-primary-color: #000000;
  --cal-bg-color: #f8f8f8;
  --cal-text-color: #000000;
  --cal-border-radius: 8px;
}
```

## Free Plan Limitations

Cal.com's free plan includes:
- Unlimited event types
- 1 user (the tattoo artist)
- Basic integrations
- Email notifications
- Custom branding (limited)

Paid features not available:
- Team scheduling
- Advanced workflows
- SMS reminders
- Custom domains
- API access (limited)

## Testing

1. Test booking flow:
   - Navigate to `/booking`
   - Select a date and time
   - Fill out custom fields
   - Submit booking

2. Test webhook:
   - Create a test booking
   - Check console logs for webhook events
   - Verify data is captured correctly

3. Test admin view:
   - Navigate to `/admin-dashboard/cal-bookings`
   - View booking details
   - Test filtering by status

## Troubleshooting

### Common Issues

1. **Cal.com widget not loading**
   - Check if Cal.com username is correct
   - Verify event type exists in Cal.com
   - Check browser console for errors

2. **Webhook not receiving events**
   - Verify webhook URL is correct
   - Check webhook secret in environment variables
   - Ensure webhook is enabled in Cal.com

3. **Custom fields not showing**
   - Update event type in Cal.com to include custom fields
   - Clear browser cache
   - Refresh the booking page

## Future Enhancements

1. **Database Integration**
   - Store Cal.com bookings in local database
   - Sync customer data with CRM
   - Track booking history

2. **Email Integration**
   - Send custom confirmation emails
   - Appointment reminders
   - Follow-up emails

3. **Payment Processing**
   - Enable Stripe integration in Cal.com
   - Handle deposit payments
   - Track payment status

4. **Advanced Features**
   - Multi-artist scheduling
   - Resource management
   - Availability rules
   - Buffer times

## Maintenance

- Regularly check Cal.com for updates
- Monitor webhook logs for errors
- Update custom fields as needed
- Review booking analytics

## Support

For Cal.com specific issues:
- Documentation: [docs.cal.com](https://docs.cal.com)
- Support: support@cal.com

For integration issues:
- Check this documentation
- Review error logs
- Contact development team