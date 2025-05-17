import { NextRequest, NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase/server-client';

// Simple implementation of Google signature verification
// This will be replaced with a proper implementation in production
async function verifyGoogleCloudSignature(
  signature: string,
  timestamp: string,
  rawBody: string
): Promise<boolean> {
  // This is a stub implementation for build
  // In a real implementation, this would verify the signature
  return true;
}

// Handle Google Calendar webhook notifications
export async function POST(req: NextRequest) {
  try {
    // Verify that the request came from Google
    const signature = req.headers.get('x-goog-signature');
    const timestamp = req.headers.get('x-goog-channel-token');
    const rawBody = await req.text();

    if (!signature || !timestamp) {
      console.error('Missing headers for Google Calendar webhook verification');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the signature
    const isValid = await verifyGoogleCloudSignature(signature, timestamp, rawBody);

    if (!isValid) {
      console.error('Invalid signature for Google Calendar webhook');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the notification data
    const notificationData = JSON.parse(rawBody);
    const { id: eventId, resourceState, resourceData } = notificationData;

    // Skip if this is just a sync notification
    if (resourceState === 'sync') {
      return NextResponse.json({ success: true });
    }

    // Get the event details from Google Calendar API
    // This requires implementing a function to fetch event details
    const eventDetails = await fetchEventDetails(eventId);

    if (!eventDetails) {
      console.error('Failed to fetch event details', eventId);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // If the event has our extended properties, process it
    const extProps = eventDetails.extendedProperties?.private || {};
    const appointmentId = extProps.appointmentId;

    if (!appointmentId) {
      // This event doesn't have our appointment ID, so it wasn't created by our system
      return NextResponse.json({ success: true });
    }

    // Initialize Supabase client
    const supabase = serverClient();

    // Update the appointment in our database
    const { error } = await supabase
      .from('appointments')
      .update({
        title: eventDetails.summary,
        description: eventDetails.description,
        start_time: eventDetails.start?.dateTime,
        end_time: eventDetails.end?.dateTime,
        status: mapGoogleStatusToAppointmentStatus(eventDetails.status),
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    if (error) {
      console.error('Error updating appointment from Google Calendar webhook:', error);
      return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Google Calendar webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Function to fetch event details from Google Calendar
// This is a placeholder - you'll need to implement this
async function fetchEventDetails(eventId: string) {
  // This is a stub implementation for build
  // In a real implementation, this would fetch the event from Google Calendar
  return {
    id: eventId,
    summary: "Tattoo Appointment",
    description: "Tattoo session",
    start: {
      dateTime: new Date().toISOString(),
    },
    end: {
      dateTime: new Date(Date.now() + 3600000).toISOString(),
    },
    status: "confirmed",
    extendedProperties: {
      private: {
        appointmentId: "00000000-0000-0000-0000-000000000000"
      }
    }
  };
}

// Map Google Calendar status to our appointment status
function mapGoogleStatusToAppointmentStatus(googleStatus?: string): string {
  switch (googleStatus) {
    case 'confirmed':
      return 'confirmed';
    case 'cancelled':
      return 'cancelled';
    case 'tentative':
      return 'scheduled';
    default:
      return 'scheduled';
  }
}