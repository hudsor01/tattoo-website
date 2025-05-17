import { NextRequest, NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase/server-client';
import {
  sendAppointmentReminder,
  sendDepositReminder,
  processEmailQueue,
} from '@/lib/email/email-service';

/**
 * Edge Function for handling automated cron jobs
 *
 * This endpoint is designed to be called by a cron service (e.g., Vercel Cron)
 * It handles different automated tasks based on the job type
 */
// export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Get secret key from header for authorization
    const authHeader = request.headers.get('x-cron-secret');

    // Verify secret key
    if (authHeader !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Supabase client
    const supabase = serverClient();

    // Parse request body
    const body = await request.json();
    const { jobType } = body;

    if (!jobType) {
      return NextResponse.json({ error: 'Job type is required' }, { status: 400 });
    }

    // Execute different jobs based on job type
    switch (jobType) {
      case 'appointment_reminders': {
        // Send reminders for appointments scheduled tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setHours(23, 59, 59, 999);

        // Find appointments scheduled for tomorrow that are confirmed
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .gte('start_date', tomorrow.toISOString())
          .lte('start_date', endOfTomorrow.toISOString())
          .eq('status', 'confirmed');

        if (appointmentsError) {
          throw appointmentsError;
        }

        // Send reminder emails
        const results = await Promise.allSettled(
          (appointments || []).map(appointment => sendAppointmentReminder(appointment.id))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        return NextResponse.json({
          success: true,
          job: 'appointment_reminders',
          totalProcessed: appointments?.length || 0,
          successful,
          failed,
        });
      }

      case 'deposit_reminders': {
        // Send reminders for unpaid deposits with appointments in the next 7 days
        const now = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

        // Find appointments in the next 7 days with unpaid deposits
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .gte('start_date', now.toISOString())
          .lte('start_date', sevenDaysLater.toISOString())
          .eq('status', 'scheduled')
          .eq('deposit_paid', false)
          .gt('deposit', 0);

        if (appointmentsError) {
          throw appointmentsError;
        }

        // Send deposit reminder emails
        const results = await Promise.allSettled(
          (appointments || []).map(appointment => sendDepositReminder(appointment.id))
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        return NextResponse.json({
          success: true,
          job: 'deposit_reminders',
          totalProcessed: appointments?.length || 0,
          successful,
          failed,
        });
      }

      case 'process_email_queue': {
        // Process any pending emails in the queue
        const result = await processEmailQueue();

        return NextResponse.json({
          success: true,
          job: 'process_email_queue',
          ...result,
        });
      }

      case 'auto_cancel_unpaid_deposits': {
        // Auto-cancel appointments with unpaid deposits that are due within 48 hours
        const now = new Date();
        const fortyEightHoursLater = new Date();
        fortyEightHoursLater.setHours(fortyEightHoursLater.getHours() + 48);

        // Find appointments within 48 hours with unpaid deposits
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .gte('start_date', now.toISOString())
          .lte('start_date', fortyEightHoursLater.toISOString())
          .eq('status', 'scheduled')
          .eq('deposit_paid', false)
          .gt('deposit', 0);

        if (appointmentsError) {
          throw appointmentsError;
        }

        // Auto-cancel these appointments
        for (const appointment of appointments || []) {
          // Update appointment status
          await supabase
            .from('appointments')
            .update({
              status: 'cancelled',
              updated_at: now.toISOString(),
            })
            .eq('id', appointment.id);

          // Add a note about auto-cancellation
          await supabase
            .from('notes')
            .insert({
              content: 'Appointment auto-cancelled due to unpaid deposit within 48 hours of scheduled time.',
              type: 'system',
              customer_id: appointment.client_id, // Using client_id instead of customerId
            });

          // Create notification
          await supabase
            .from('notification_queue')
            .insert({
              recipient_id: appointment.client_id, // Using client_id instead of customerId
              recipient_type: 'customer',
              title: 'Appointment Cancelled',
              message: `Your appointment on ${new Date(appointment.start_date).toLocaleDateString()} has been cancelled due to unpaid deposit.`,
              action_url: `/appointments/${appointment.id}`,
              notification_type: 'cancellation',
            });
        }

        return NextResponse.json({
          success: true,
          job: 'auto_cancel_unpaid_deposits',
          totalCancelled: appointments?.length || 0,
        });
      }

      case 'cleanup': {
        // Cleanup old data
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        // Delete old notifications
        const { data, error } = await supabase
          .from('notification_queue')
          .delete()
          .eq('is_read', true)
          .lt('created_at', oneYearAgo.toISOString())
          .select('count');

        if (error) {
          throw error;
        }

        return NextResponse.json({
          success: true,
          job: 'cleanup',
          deletedNotifications: data?.[0]?.count || 0,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid job type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing cron job:', error);

    return NextResponse.json(
      {
        error: 'Failed to process cron job',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Allow GET requests for health check
export async function GET(request: NextRequest) {
  try {
    // Verify secret key for health check
    const authHeader = request.headers.get('x-cron-secret');

    if (authHeader !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return health status
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in health check:', error);

    return NextResponse.json({ error: 'Health check failed' }, { status: 500 });
  }
}