import { EmailRequest } from '../../../src/lib/services/email-automations';
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

/**
 * This is a bridge file that adapts our application email service for use in Deno runtime environment.
 * In a real implementation, you would:
 * 1. Create a shared module between Next.js and Deno with adapted implementations
 * 2. Use proper build steps to ensure compatibility
 * 
 * For this example, we're creating a simplified version that replicates the core functionalities
 * from src/lib/services/email-automations.ts
 */

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  status: string;
}

interface EmailAutomation {
  id: string;
  name: string;
  active: boolean;
  trigger_type: string;
  template_id: string;
}

// Define specific result types for handleRequest
interface SendTemplateResult {
  sent: boolean;
  recipient: string;
  templateId: string;
}

interface DailyAutomationsResultItem {
  automation_id: string;
  recipient?: string;
  error?: string;
}

interface RunDailyAutomationsResult {
  processed: number;
  automations: DailyAutomationsResultItem[];
}

type HandleRequestResultPayload = SendTemplateResult | RunDailyAutomationsResult;

/**
 * Handle an email request from the Edge Function
 */
export async function handleRequest(
  supabase: SupabaseClient,
  request: EmailRequest
): Promise<{ success: boolean; result?: HandleRequestResultPayload; error?: string }> {
  try {
    const { action, recipient, templateId, data } = request;
    
    if (!action) {
      return { success: false, error: 'Missing required parameters' };
    }
    
    // Handle different email automation actions
    switch (action) {
      case 'send_template':
        if (!recipient || !templateId) {
          return { success: false, error: 'Missing recipient or templateId' };
        }
        
        const result = await processEmailTemplate(supabase, recipient, templateId, data);
        return { success: true, result };
        
      case 'run_daily_automations':
        // Process scheduled email automations
        const automationResults = await processDailyAutomations(supabase);
        return { success: true, result: { processed: automationResults.length, automations: automationResults } };
        
      default:
        return { success: false, error: 'Invalid action' };
    }
  } catch (error) {
    console.error('Error handling email request:', error);    
    return { success: false, error: (error as { message: string }).message || 'Unknown error occurred' };
  }
}

/**
 * Process an email template and send it
 */
async function processEmailTemplate(
  supabase: SupabaseClient,
  recipient: string,
  templateId: string,
  data: Record<string, unknown> = {}
): Promise<SendTemplateResult> { // Updated return type to be more specific
  try {
    // Get template from database
    const { data: template, error } = await supabase
      .from<EmailTemplate>('EmailTemplate') // Use EmailTemplate type
      .select('*')
      .eq('id', templateId)
      .single();
      
    if (error || !template) {
      throw new Error(`Template not found: ${error?.message || 'Unknown error'}`);
    }
      
    console.warn(`Sending email to ${recipient} using template ${template.name}`);
    
    /**
     * In a real implementation, you would have an Edge-compatible email sending service here.
     * For this example, we'll just log it and record it in the database.
     * 
     * For real email sending, use Resend.com which has a Deno-compatible SDK
     */
    console.warn(`Email would be sent with subject: ${template.subject}`);
    console.warn(`Template data: ${JSON.stringify(data)}`);
      
    // Record email sent in database
    const { error: logError } = await supabase
      .from('EmailLog')
      .insert({
        recipient,
        template_id: templateId,
        data: data,
        status: 'sent'
      });
      
    if (logError) {
      console.error('Error logging email:', logError);
    }
      
    return { sent: true, recipient, templateId };
  } catch (error) {
    console.error(`Error processing email template:`, error); // error is already logged
    throw error;
  }
}

/**
 * Process daily email automations
 */
async function processDailyAutomations(
  supabase: SupabaseClient
): Promise<DailyAutomationsResultItem[]> { // Updated return type
  try {
    // Get automations to process
    const { data: automationsData, error } = await supabase
      .from<EmailAutomation>('EmailAutomation') // Use EmailAutomation type
      .select('*')
      .eq('active', true)
      .eq('trigger_type', 'scheduled');
      
    if (error) {
      throw new Error(`Error fetching automations: ${error.message}`);
    }
      
    const results: DailyAutomationsResultItem[] = []; // Type the results array
    
    // Handle cases where automationsData might be null or undefined, though Supabase usually returns []
    const automations = automationsData || [];

    if (automations.length === 0) {
        console.warn('No active scheduled automations found.');
        return results;
    }
      
    for (const automation of automations) {
      try {
        // Process each automation based on its criteria
        const { data: recipientsData, error: recipientsError } = await supabase
          .from<Client>('Client') // Use Client type
          .select('email, id, first_name, last_name')
          .eq('status', 'active');
          
        if (recipientsError) {
          throw new Error(`Error fetching recipients: ${recipientsError.message}`);
        }

        // Handle cases where recipientsData might be null or undefined
        const recipients = recipientsData || [];
          
        for (const recipient of recipients) {
          await processEmailTemplate(
            supabase,
            recipient.email,
            automation.template_id,
            { 
              clientId: recipient.id,
              recipientName: `${recipient.first_name || ''} ${recipient.last_name || ''}`.trim(),
              first_name: recipient.first_name,
              last_name: recipient.last_name
            }
          );
          results.push({ automation_id: automation.id, recipient: recipient.email });
        }
      } catch (error) {
        console.error(`Error processing automation ${automation.id}:`, error);
        results.push({ automation_id: automation.id, error: (error as { message: string }).message || 'Unknown error processing automation' });
      }
    }
      
    return results;
  } catch (error) {
    console.error('Error processing daily automations:', error);
    throw error;
  }
}

export type { EmailRequest };
