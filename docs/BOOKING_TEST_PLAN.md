# Cal.com Booking Flow Test Plan

## Pre-requisites
1. Ensure you have a Cal.com account set up
2. Set up the following environment variables in `.env`:
   - `NEXT_PUBLIC_CAL_USERNAME` (your Cal.com username)
   - `CAL_WEBHOOK_SECRET` (from Cal.com settings)
   - `RESEND_API_KEY` (for email notifications)
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY` (if using database)

## Test Scenarios

### 1. Initial Setup Test
- [ ] Visit the booking page at `/booking`
- [ ] Verify Cal.com embed loads correctly
- [ ] Check styling matches the tattoo website theme
- [ ] Ensure the embed shows the correct event type

### 2. Booking Creation Test
- [ ] Fill out the booking form with:
  - Name and email
  - Select a date and time
  - Fill tattoo-specific fields:
    - Tattoo type/style
    - Size
    - Placement
    - Description
  - Add reference images (if applicable)
- [ ] Submit the booking
- [ ] Verify booking confirmation page appears

### 3. Email Notification Test
- [ ] Check if client receives confirmation email
- [ ] Verify email contains:
  - Booking date and time
  - Tattoo details (style, size, placement)
  - Any special instructions
- [ ] Check if artist receives notification email

### 4. Webhook Processing Test
- [ ] Monitor console logs for webhook events
- [ ] Verify webhook handler receives:
  - `booking.created` event
  - Correct payload data
  - Tattoo-specific custom fields
- [ ] Check if emails are sent successfully

### 5. Admin Dashboard Test
- [ ] Navigate to `/admin-dashboard/cal-bookings`
- [ ] Verify new booking appears in the list
- [ ] Check booking details display correctly
- [ ] Test filtering by status and date

### 6. Booking Modification Test
- [ ] Test rescheduling through Cal.com
- [ ] Verify `booking.rescheduled` webhook fires
- [ ] Check if reschedule email is sent
- [ ] Confirm admin dashboard updates

### 7. Booking Cancellation Test
- [ ] Cancel a booking through Cal.com
- [ ] Verify `booking.cancelled` webhook fires
- [ ] Check if cancellation email is sent
- [ ] Confirm status updates in admin dashboard

### 8. Error Handling Test
- [ ] Test with invalid webhook signature
- [ ] Test with malformed payload
- [ ] Verify appropriate error messages

## Test Environment Setup

1. **Local Development:**
   ```bash
   npm run dev
   ```

2. **Monitor Webhook Events:**
   ```bash
   # In a separate terminal
   tail -f logs/webhook-events.log
   ```

3. **Email Testing:**
   - Use Mailtrap or similar service for testing emails
   - Or check Resend dashboard for sent emails

## Common Issues & Solutions

### Cal.com Embed Not Loading
- Check if Cal.com username is correct
- Verify event type exists in Cal.com account
- Check browser console for errors

### Webhooks Not Firing
- Ensure webhook URL is registered in Cal.com
- Verify webhook secret matches
- Check if local tunnel (ngrok) is needed for local testing

### Emails Not Sending
- Verify Resend API key is valid
- Check email templates are rendering correctly
- Monitor Resend dashboard for errors

## Production Testing Checklist

Before deploying to production:
- [ ] Test with real Cal.com account
- [ ] Verify webhook signature validation
- [ ] Test email delivery to real addresses
- [ ] Check booking data persistence
- [ ] Test under load (multiple concurrent bookings)
- [ ] Verify SSL/HTTPS for webhook endpoint
- [ ] Monitor error logs and alerts