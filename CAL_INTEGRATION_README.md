# Cal.com Integration Guide

This guide documents the Cal.com integration with the tattoo website.

## Overview

The integration replaces the existing booking system with Cal.com, providing:
- Appointment scheduling
- Payment processing
- Email notifications
- Calendar synchronization
- Webhook events for real-time updates

## Setup Instructions

### 1. Cal.com Account Setup

1. Create a Cal.com account at https://cal.com
2. Set up an event type for tattoo consultations
3. Configure custom fields for tattoo-specific information:
   - Tattoo Type/Style
   - Size
   - Placement
   - Description
   - Reference Images (optional)
   - Budget (optional)

### 2. Environment Variables

Add these to your `.env` file:

```env
# Cal.com Configuration
NEXT_PUBLIC_CAL_USERNAME=your-cal-username
CAL_WEBHOOK_SECRET=your-webhook-secret-from-cal

# Cal.com Event Settings (optional)
NEXT_PUBLIC_CAL_EVENT_TYPE=consultation
NEXT_PUBLIC_CAL_NAMESPACE=cal

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key
ARTIST_EMAIL=artist@example.com
```

### 3. Webhook Configuration

1. Log into Cal.com dashboard
2. Go to Settings > Developer > Webhooks
3. Add a new webhook:
   - URL: `https://yourdomain.com/api/cal/webhook`
   - Events: booking.created, booking.cancelled, booking.rescheduled
   - Copy the webhook secret to your `.env` file

### 4. Testing

1. **Local Development:**
   ```bash
   npm run dev
   ```

2. **Test Webhook Locally:**
   ```bash
   # Use ngrok or similar for local webhook testing
   ngrok http 3000
   ```

3. **Test Booking Flow:**
   ```bash
   node scripts/test-booking.js
   ```

## File Structure

```
src/
├── app/
│   ├── booking/
│   │   ├── page.tsx          # Main booking page with Cal.com embed
│   │   └── booking.css       # Custom styles for Cal.com embed
│   ├── api/
│   │   └── cal/
│   │       └── webhook/
│   │           └── route.ts  # Webhook handler for Cal.com events
│   └── admin-dashboard/
│       └── cal-bookings/
│           └── page.tsx      # Admin view for Cal.com bookings
├── lib/
│   └── cal/
│       ├── config.ts         # Cal.com configuration
│       └── email-integration.ts  # Email notification integration
└── types/
    └── cal-types.ts          # TypeScript types for Cal.com

```

## Key Components

### 1. Booking Page (`/booking`)

The main booking interface using the Cal.com React embed:

```typescript
import Cal from '@calcom/embed-react';

export default function BookingPage() {
  return (
    <Cal
      namespace="cal"
      calLink="username/event-type"
      config={{
        theme: 'light',
        branding: { brandColor: '#000000' }
      }}
    />
  );
}
```

### 2. Webhook Handler

Processes Cal.com events and triggers email notifications:

```typescript
// /api/cal/webhook/route.ts
export async function POST(request: NextRequest) {
  // Verify webhook signature
  // Parse payload
  // Handle events (booking.created, etc.)
  // Send email notifications
}
```

### 3. Email Integration

Sends customized emails for booking events:

```typescript
// lib/cal/email-integration.ts
export async function sendCalBookingConfirmation(booking: CalBookingPayload) {
  // Extract tattoo data
  // Render email template
  // Send via Resend
}
```

## Customization

### Styling

Customize the Cal.com embed appearance in `/app/booking/booking.css`:

```css
[data-cal-namespace="cal"] {
  --cal-brand-color: #000;
  --cal-text-color: #333;
  /* More CSS variables */
}
```

### Custom Fields

Configure tattoo-specific fields in Cal.com dashboard:
1. Tattoo Type (dropdown or text)
2. Size (dropdown: Small, Medium, Large, etc.)
3. Placement (text)
4. Description (textarea)
5. Reference Images (file upload or URL)

## Troubleshooting

### Common Issues

1. **Embed Not Loading:**
   - Check Cal.com username in environment variables
   - Verify event type exists in Cal.com account
   - Check browser console for errors

2. **Webhooks Not Working:**
   - Ensure webhook URL is accessible publicly
   - Verify webhook secret matches
   - Check webhook logs in Cal.com dashboard

3. **Emails Not Sending:**
   - Verify Resend API key
   - Check email templates are valid
   - Monitor Resend dashboard for errors

## API Reference

### Webhook Events

- `booking.created` - New booking created
- `booking.cancelled` - Booking cancelled
- `booking.rescheduled` - Booking time changed
- `booking.updated` - Booking details updated

### Payload Structure

```typescript
interface CalWebhookPayload {
  event: string;
  payload: {
    id: string;
    startTime: string;
    endTime: string;
    attendees: Array<{
      email: string;
      name: string;
    }>;
    customInputs: Array<{
      label: string;
      value: any;
    }>;
    // ... more fields
  };
}
```

## Security Considerations

1. Always verify webhook signatures
2. Validate all input data
3. Use environment variables for secrets
4. Implement rate limiting on webhook endpoint
5. Log all webhook events for auditing

## Support

For Cal.com specific issues:
- Documentation: https://cal.com/docs
- Support: https://cal.com/support

For integration issues:
- Check this repository's issues
- Review webhook logs
- Test with the provided test scripts