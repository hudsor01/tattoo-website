
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Parse webhook data
    const webhookData = await req.json()
    const source = req.headers.get('X-Webhook-Source') || 'unknown'
    
    // Log webhook receipt
    await supabaseClient
      .from('WebhookLog')
      .insert({
        source,
        data: webhookData,
        processed: false
      })
    
    // Process based on source
    let result = null
    
    switch (source) {
      case 'stripe':
        result = await processStripeWebhook(supabaseClient, webhookData)
        break
        
      case 'google_calendar':
        result = await processGoogleCalendarWebhook(supabaseClient, webhookData)
        break
        
      default:
        console.error(`Received webhook from unknown source: ${source}`)
        result = { processed: false, reason: 'Unknown source' }
    }
    
    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Process Stripe webhook
async function processStripeWebhook(supabase: ReturnType<typeof createClient>, data: Record<string, unknown>) {
  try {
    const eventType = data.type
    const eventObject = data.data.object
    
    console.error(`Processing Stripe event: ${eventType}`)
    
    switch (eventType) {
      case 'payment_intent.succeeded':
        // Update payment record
        await supabase
          .from('Payment')
          .update({ 
            status: 'completed',
            stripe_data: data
          })
          .eq('stripe_payment_id', eventObject.id)
        
        // Create notification
        await supabase
          .from('NotificationQueue')
          .insert({
            recipient_id: eventObject.metadata.user_id,
            recipient_type: 'client',
            title: 'Payment Received',
            message: `Your payment of ${(eventObject.amount / 100).toFixed(2)} was successful.`,
            notification_type: 'payment'
          })
          
        return { processed: true, type: 'payment_success' }
        
      // Add other event types as needed
      
      default:
        return { processed: true, type: 'ignored_event' }
    }
  } catch (error) {
    console.error('Error processing Stripe webhook:', error)
    return { processed: false, error: error.message }
  }
}

// Process Google Calendar webhook
// Both supabase and data parameters are declared but not used in this simplified example
// Will be used when implementation is completed
async function processGoogleCalendarWebhook(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  supabase: ReturnType<typeof createClient>, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data: Record<string, unknown>
) {
  try {
    // Implementation depends on how Google Calendar webhooks are structured
    console.error('Processing Google Calendar webhook')
    
    // This is a simplified example
    return { processed: true, source: 'google_calendar' }
  } catch (error) {
    console.error('Error processing Google Calendar webhook:', error)
    return { processed: false, error: error.message }
  }
}
