# Cal.com Payment Integration Setup Guide

This guide explains how to configure Cal.com to handle payments for tattoo bookings and deposits.

## Overview

Your application now properly processes payment data from Cal.com webhooks. When payments are made through Cal.com, they will automatically:

1. Create booking records with payment status
2. Create payment records in your database
3. Update payment status when payments complete
4. Handle payment updates and refunds

## Required Setup in Cal.com Dashboard

### 1. Connect Stripe to Cal.com

1. **Login to Cal.com Dashboard**: https://app.cal.com
2. **Go to Settings > Payments**
3. **Connect Stripe Account**:
   - Click "Connect Stripe"
   - Login to your Stripe account or create one
   - Complete the Stripe Connect flow
   - Verify the connection is successful

### 2. Configure Event Types for Payments

For each event type (consultation, tattoo session, etc.):

1. **Go to Event Types**
2. **Edit your event type**
3. **Scroll to "Payment" section**
4. **Enable payments and set:**
   - **Payment Required**: Yes
   - **Payment Type**: "Hold payment" (recommended for deposits) or "Require payment"
   - **Amount**: Set your deposit amount (e.g., $50)
   - **Currency**: USD

### 3. Recommended Event Types Setup

Create these event types with payments:

#### Tattoo Consultation (15-30 min)
- **Amount**: $25-50 (applied toward final tattoo cost)
- **Payment Type**: "Hold payment"
- **Buffer Time**: 15 minutes

#### Tattoo Session (2-4 hours)
- **Amount**: $100-200 (deposit)
- **Payment Type**: "Hold payment" 
- **Buffer Time**: 30 minutes

#### Touch-up Session (1-2 hours)
- **Amount**: $50 (deposit)
- **Payment Type**: "Hold payment"
- **Buffer Time**: 15 minutes

### 4. Custom Form Fields

Add these custom fields to gather tattoo-specific information:

1. **Tattoo Type** (Select):
   - Traditional
   - Realism
   - Japanese
   - Custom Design
   - Cover-up
   - Other

2. **Size** (Select):
   - Small (2-4 inches)
   - Medium (4-8 inches)
   - Large (8+ inches)
   - Sleeve
   - Other

3. **Placement** (Text):
   - Where on the body

4. **Description** (Long text):
   - Detailed description of the tattoo idea

5. **Phone Number** (Text):
   - Required for communication

## Webhook Configuration

### 1. Set Webhook URL

In Cal.com Settings > Webhooks:

- **Webhook URL**: `https://your-domain.com/api/cal/webhook`
- **Events**: Select all booking events:
  - `booking.created`
  - `booking.updated` 
  - `booking.cancelled`
  - `booking.rescheduled`

### 2. Environment Variables

Ensure these are set in your `.env`:

```bash
NEXT_PUBLIC_CAL_USERNAME="your-cal-username"
CAL_WEBHOOK_SECRET="your-webhook-secret"
```

## Payment Flow

### How It Works

1. **Customer books through Cal.com**:
   - Selects service and time
   - Fills out tattoo details
   - Pays deposit via Stripe

2. **Cal.com sends webhook**:
   - Webhook creates booking record
   - Payment data is processed
   - Customer receives confirmation

3. **Artist gets notification**:
   - New booking appears in admin dashboard
   - Payment status is tracked
   - Customer details are available

### Payment States

- **Pending**: Payment initiated but not completed
- **Paid**: Payment successfully processed
- **Failed**: Payment failed (booking remains but marked as unpaid)
- **Refunded**: Payment was refunded

## Testing

### Test Mode Setup

1. **Use Stripe Test Mode**:
   - Connect test Stripe account to Cal.com
   - Use test credit card numbers
   - Payments won't be real charges

2. **Test Cards**:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`
   - Insufficient funds: `4000 0000 0000 9995`

### Verify Integration

1. **Make a test booking**
2. **Check webhook received**: Look in your application logs
3. **Verify database**: Check booking and payment records
4. **Test refunds**: Process a refund through Stripe

## Troubleshooting

### Common Issues

1. **Webhook not received**:
   - Check webhook URL is correct
   - Verify webhook secret matches
   - Check firewall/security settings

2. **Payment not processed**:
   - Verify Stripe connection
   - Check event type payment settings
   - Review webhook logs

3. **Customer data missing**:
   - Ensure custom fields are required
   - Check field names match webhook processing

### Logs and Monitoring

- **Application logs**: Check webhook processing
- **Cal.com dashboard**: View booking status
- **Stripe dashboard**: Monitor payment activity

## Production Considerations

### Security
- Use HTTPS for webhook URL
- Verify webhook signatures
- Store sensitive data securely

### Monitoring
- Set up alerts for failed payments
- Monitor webhook delivery success
- Track payment conversion rates

### Customer Experience
- Clear payment policies on website
- Email confirmations for payments
- Easy rebooking for failed payments

## Support

If you have issues:

1. **Check Cal.com documentation**: https://docs.cal.com
2. **Stripe documentation**: https://docs.stripe.com
3. **Test webhook delivery**: Use webhook testing tools
4. **Review application logs**: Check for error messages

## Next Steps

After setup:

1. **Test thoroughly** with small amounts
2. **Train staff** on the booking system
3. **Update website** with new booking flow
4. **Monitor payments** closely for first few weeks
5. **Gather customer feedback** and adjust as needed