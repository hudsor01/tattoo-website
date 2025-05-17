// Real-time notifications Edge Function
// Handles sending notifications to clients via WebSockets and email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

// Initialize email client
const smtpClient = new SmtpClient();

interface Notification {
  id: string;
  recipient_id: string;
  recipient_type: string;
  title: string;
  message: string;
  action_url?: string;
  notification_type: string;
  is_read: boolean;
  is_processed: boolean;
  created_at: string;
  processed_at?: string;
  recipient_email?: string; // For email notifications
}

interface WebhookPayload {
  type: string;
  table: string;
  record: Notification;
  old_record?: Notification;
  schema: string;
}

// Create a reusable function to process notifications
async function processNotification(notification: Notification, supabaseAdmin: ReturnType<typeof createClient>) {
  // Get recipient details
  let recipientEmail = notification.recipient_email;
  
  if (!recipientEmail && notification.recipient_type === 'customer') {
    // Look up customer email
    const { data: customer } = await supabaseAdmin
      .from('Customer')
      .select('email')
      .eq('id', notification.recipient_id)
      .single();
      
    if (customer?.email) {
      recipientEmail = customer.email;
    }
  }
  
  // For email notifications, send an email
  if (recipientEmail && ['appointment_reminder', 'appointment_update', 'payment_confirmation'].includes(notification.notification_type)) {
    try {
      await smtpClient.connect({
        hostname: Deno.env.get('SMTP_HOST') || '',
        port: parseInt(Deno.env.get('SMTP_PORT') || '587'),
        username: Deno.env.get('SMTP_USERNAME') || '',
        password: Deno.env.get('SMTP_PASSWORD') || '',
      });
      
      const emailTemplate = getEmailTemplate(notification);
      
      await smtpClient.send({
        from: Deno.env.get('SMTP_FROM') || '37 Ink <no-reply@37ink.com>',
        to: recipientEmail,
        subject: notification.title,
        html: emailTemplate,
      });
      
      await smtpClient.close();
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
  
  // Mark notification as processed
  await supabaseAdmin
    .from('NotificationQueue')
    .update({
      is_processed: true,
      processed_at: new Date().toISOString(),
    })
    .eq('id', notification.id);
    
  return {
    success: true,
    notification_id: notification.id,
    notification_type: notification.notification_type,
    recipient: notification.recipient_id,
  };
}

// Function to generate email templates based on notification type
function getEmailTemplate(notification: Notification): string {
  // Base template
  const baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${notification.title}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #000; color: #fff; padding: 10px 20px; text-align: center; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        .button { display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; 
                 text-decoration: none; border-radius: 4px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>37 Ink Tattoo Studio</h1>
        </div>
        <div class="content">
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          ${notification.action_url ? `<a href="${Deno.env.get('APP_URL')}${notification.action_url}" class="button">View Details</a>` : ''}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} 37 Ink Tattoo Studio. All rights reserved.</p>
          <p>123 Tattoo Street, Ink City, TX 12345</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return baseTemplate;
}

// Handle HTTP request
serve(async (req) => {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Parse the request body
    const payload: WebhookPayload = await req.json();
    
    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // Handle different operations based on the webhook payload
    if (payload.type === 'INSERT' && payload.table === 'NotificationQueue') {
      // Process new notification
      const result = await processNotification(payload.record, supabaseAdmin);
      
      return new Response(
        JSON.stringify(result),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } else if (payload.type === 'UPDATE' && payload.table === 'NotificationQueue') {
      // Handle updates to notifications (e.g., marked as read)
      return new Response(
        JSON.stringify({ 
          success: true, 
          notification_id: payload.record.id, 
          message: 'Notification updated' 
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Unsupported operation
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Unsupported operation' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error processing notification:`, errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
