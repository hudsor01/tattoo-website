
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

interface EmailRequest {
  action: string;
  recipient?: string;
  templateId?: string;
  data?: Record<string, unknown>;
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Parse request
    const { action, recipient, templateId, data } = await req.json() as EmailRequest
    
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Handle different email automation actions
    switch (action) {
      case 'send_template':
        if (!recipient || !templateId) {
          return new Response(
            JSON.stringify({ error: 'Missing recipient or templateId' }),
            { headers: { 'Content-Type': 'application/json' }, status: 400 }
          )
        }
        
        // TODO: Logic to send email template
        const result = await processEmailTemplate(supabaseClient, recipient, templateId, data)
        
        return new Response(
          JSON.stringify({ success: true, result }),
          { headers: { 'Content-Type': 'application/json' } }
        )
        
      case 'run_daily_automations':
        // Process scheduled email automations
        const automationResults = await processDailyAutomations(supabaseClient)
        
        return new Response(
          JSON.stringify({ success: true, processed: automationResults.length }),
          { headers: { 'Content-Type': 'application/json' } }
        )
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { headers: { 'Content-Type': 'application/json' }, status: 400 }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Function to process an email template
async function processEmailTemplate(
  supabase: ReturnType<typeof createClient>, 
  recipient: string, 
  templateId: string, 
  data: Record<string, unknown> = {}
) {
  // Get template from database
  const { data: template, error } = await supabase
    .from('EmailTemplate')
    .select('*')
    .eq('id', templateId)
    .single()
    
  if (error || !template) {
    throw new Error(`Template not found: ${error?.message}`)
  }
    
  // TODO: Replace with your email service implementation
  console.error(`Sending email to ${recipient} using template ${template.name}`)
  console.error(`Template data: ${JSON.stringify(data)}`)
    
  // Record email sent in database
  // emailLog is not used but will be needed for future implementation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: emailLog, error: logError } = await supabase
    .from('EmailLog')
    .insert({
      recipient,
      template_id: templateId,
      data: data,
      status: 'sent'
    })
    
  if (logError) {
    console.error('Error logging email:', logError)
  }
    
  return { sent: true, recipient, templateId }
}

// Function to process daily email automations
async function processDailyAutomations(supabase: ReturnType<typeof createClient>) {
  // Get automations to process
  const { data: automations, error } = await supabase
    .from('EmailAutomation')
    .select('*')
    .eq('active', true)
    .eq('trigger_type', 'scheduled')
    
  if (error) {
    throw new Error(`Error fetching automations: ${error.message}`)
  }
    
  const results = []
    
  for (const automation of automations) {
    try {
      // Process each automation based on its criteria
      // This is a simplified example - real implementation would be more complex
      const { data: recipients, error: recipientsError } = await supabase
        .from('Client')
        .select('email, id')
        .eq('status', 'active')
        
      if (recipientsError) {
        throw new Error(`Error fetching recipients: ${recipientsError.message}`)
      }
        
      for (const recipient of recipients) {
        await processEmailTemplate(
          supabase,
          recipient.email,
          automation.template_id,
          { clientId: recipient.id }
        )
        results.push({ automation_id: automation.id, recipient: recipient.email })
      }
    } catch (error) {
      console.error(`Error processing automation ${automation.id}:`, error)
      results.push({ automation_id: automation.id, error: error.message })
    }
  }
    
  return results
}
