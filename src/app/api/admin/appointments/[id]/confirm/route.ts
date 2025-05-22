import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * Confirm an appointment using Supabase functions and triggers
 * This leverages database functions and triggers for automatic notification and logging
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const appointmentId = params.id;
    const supabase = await createClient();

    // Check if admin is authorized
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Check if admin is authorized
    const isAdmin = user?.user_metadata && user.user_metadata['role'] === 'admin';
    if (authError || !user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    // Confirm the appointment - this will trigger database functions automatically
    // to handle notifications and activity logging
    const { error } = await supabase
      .from('Appointment')
      .update({
        status: 'confirmed',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    if (error) {
      console.error('Error confirming appointment:', error);
      return NextResponse.json({ error: 'Failed to confirm appointment' }, { status: 500 });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Appointment confirmed successfully',
      appointmentId,
    });
  } catch (error) {
    console.error('Error in appointment confirmation endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
