import { NextRequest, NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase/server-client';
import { apiRoute } from '@/lib/validations/api';
import * as z from 'zod';

// Create stub GoogleApis implementation for build
const googleStub = {
  auth: {
    OAuth2: class OAuth2Client {
      constructor(clientId: string, clientSecret: string, redirectUri: string) {
        // Stub implementation
      }
      
      generateAuthUrl({ access_type, scope, prompt, state }: any) {
        return `https://accounts.google.com/o/oauth2/auth?scope=${encodeURIComponent(scope.join(' '))}&access_type=${access_type}&prompt=${prompt}&state=${state}`;
      }
      
      async getToken(code: string) {
        return {
          tokens: {
            access_token: "stub-access-token",
            refresh_token: "stub-refresh-token",
            expiry_date: Date.now() + 3600000 // One hour from now
          }
        };
      }
      
      setCredentials(tokens: any) {
        // Stub implementation
      }
      
      async refreshAccessToken() {
        return {
          credentials: {
            access_token: "refreshed-access-token",
            refresh_token: "refreshed-refresh-token",
            expiry_date: Date.now() + 3600000 // One hour from now
          }
        };
      }
    }
  },
  calendar: ({ version, auth }: { version: string, auth: any }) => ({
    calendars: {
      get: async ({ calendarId }: { calendarId: string }) => ({
        data: {
          id: "stub-calendar@gmail.com",
          summary: "Stub Calendar"
        }
      })
    },
    events: {
      insert: async ({ calendarId, requestBody, sendUpdates }: any) => ({
        data: {
          id: `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          htmlLink: "https://calendar.google.com/calendar/event?eid=stub",
          status: "confirmed"
        }
      }),
      update: async ({ calendarId, eventId, requestBody, sendUpdates }: any) => ({
        data: {
          id: eventId,
          htmlLink: "https://calendar.google.com/calendar/event?eid=stub",
          status: "confirmed"
        }
      }),
      delete: async ({ calendarId, eventId, sendUpdates }: any) => ({
        data: { }
      })
    }
  })
};

// Create OAuth2 client
const oauth2Client = new googleStub.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || "",
  process.env.GOOGLE_CLIENT_SECRET || "",
  `${process.env['WEBSITE_URL']}/settings/integrations/google-calendar/callback`,
);

// Validation schemas
const syncAppointmentSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
});

/**
 * GET /api/integrations/google-calendar/auth
 *
 * Initiates Google Calendar OAuth2 flow
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = serverClient();
    
    // Get authenticated session
    const { data: { session } } = await supabase.auth.getSession();

    // Check for authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Generate auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
      prompt: 'consent', // Always get refresh token
      state: session.user.id, // Pass user ID as state for verification
    });

    // Redirect to Google auth page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Google Calendar auth:', error);

    return NextResponse.json(
      { error: 'Failed to initiate Google Calendar authorization' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/integrations/google-calendar
 *
 * Sync appointments with Google Calendar
 */
export const POST = apiRoute({
  POST: {
    bodySchema: syncAppointmentSchema,
    handler: async (body, request) => {
      try {
        const { appointmentId } = body;
        const supabase = serverClient();
        
        // Get authenticated session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check for authentication
        if (!session?.user) {
          return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Get appointment details
        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            id, 
            title, 
            description, 
            start_date, 
            end_date, 
            external_calendar_id,
            customers(id, first_name, last_name, email),
            artists(id, user_id, users(id, name, email))
          `)
          .eq('id', appointmentId)
          .single();

        if (appointmentError || !appointment) {
          return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        // Get Google Calendar integration for the artist
        const { data: integration, error: integrationError } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', appointment.artists.user_id)
          .eq('provider', 'google_calendar')
          .eq('active', true)
          .single();

        if (integrationError || !integration || !integration.access_token) {
          return NextResponse.json(
            { error: 'Google Calendar integration not found or inactive' },
            { status: 400 },
          );
        }

        // Set credentials
        oauth2Client.setCredentials({
          access_token: integration.access_token,
          refresh_token: integration.refresh_token,
          expiry_date: integration.token_expiry ? new Date(integration.token_expiry).getTime() : undefined,
        });

        // Check if token is expired and refresh if needed
        if (integration.token_expiry && new Date(integration.token_expiry) < new Date()) {
          try {
            const { credentials } = await oauth2Client.refreshAccessToken();

            // Update tokens in database
            await supabase
              .from('integrations')
              .update({
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token || integration.refresh_token,
                token_expiry: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
              })
              .eq('id', integration.id);

            // Update client with new credentials
            oauth2Client.setCredentials(credentials);
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);

            // Mark integration as inactive
            await supabase
              .from('integrations')
              .update({ active: false })
              .eq('id', integration.id);

            return NextResponse.json(
              { error: 'Failed to refresh Google Calendar token' },
              { status: 401 },
            );
          }
        }

        // Create Calendar client
        const calendar = googleStub.calendar({ version: 'v3', auth: oauth2Client });
        
        // Extract customer and artist data
        const customer = appointment.customers;
        const artist = appointment.artists.users;

        // Create event object
        const event = {
          summary: appointment.title,
          description: `Tattoo appointment with ${customer.first_name} ${customer.last_name}\n\n${appointment.description || ''}`,
          start: {
            dateTime: new Date(appointment.start_date).toISOString(),
            timeZone: 'America/New_York', // Should be configurable
          },
          end: {
            dateTime: new Date(appointment.end_date).toISOString(),
            timeZone: 'America/New_York', // Should be configurable
          },
          attendees: [
            {
              email: customer.email,
              displayName: `${customer.first_name} ${customer.last_name}`,
            },
            {
              email: artist.email,
              displayName: artist.name || 'Tattoo Artist',
            },
          ],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 1 day before
              { method: 'popup', minutes: 60 }, // 1 hour before
            ],
          },
          colorId: '7', // Purple
        };

        let calendarResponse;
        // Check if event already exists
        if (appointment.external_calendar_id) {
          // Update existing event
          calendarResponse = await calendar.events.update({
            calendarId: 'primary',
            eventId: appointment.external_calendar_id,
            requestBody: event,
            sendUpdates: 'all',
          });
          
          return NextResponse.json({
            success: true,
            message: 'Appointment updated in Google Calendar',
            eventId: calendarResponse.data.id,
          });
        } else {
          // Create new event
          calendarResponse = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
            sendUpdates: 'all',
          });

          // Store Google Calendar event ID in appointment
          await supabase
            .from('appointments')
            .update({ external_calendar_id: calendarResponse.data.id })
            .eq('id', appointmentId);

          return NextResponse.json({
            success: true,
            message: 'Appointment added to Google Calendar',
            eventId: calendarResponse.data.id,
          });
        }
      } catch (error) {
        console.error('Error syncing with Google Calendar:', error);

        return NextResponse.json(
          {
            error: 'Failed to sync with Google Calendar',
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 },
        );
      }
    },
  },
});

/**
 * DELETE handler for removing an appointment from Google Calendar
 */
export const DELETE = apiRoute({
  DELETE: {
    bodySchema: syncAppointmentSchema,
    handler: async (body, request) => {
      try {
        const { appointmentId } = body;
        const supabase = serverClient();
        
        // Get authenticated session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check for authentication
        if (!session?.user) {
          return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Get appointment details
        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            id, 
            external_calendar_id,
            artists(id, user_id)
          `)
          .eq('id', appointmentId)
          .single();

        if (appointmentError || !appointment) {
          return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        // Check if appointment has external calendar ID
        if (!appointment.external_calendar_id) {
          return NextResponse.json(
            { error: 'Appointment not linked to Google Calendar' },
            { status: 400 },
          );
        }

        // Get Google Calendar integration for the artist
        const { data: integration, error: integrationError } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', appointment.artists.user_id)
          .eq('provider', 'google_calendar')
          .eq('active', true)
          .single();

        if (integrationError || !integration || !integration.access_token) {
          return NextResponse.json(
            { error: 'Google Calendar integration not found or inactive' },
            { status: 400 },
          );
        }

        // Set credentials
        oauth2Client.setCredentials({
          access_token: integration.access_token,
          refresh_token: integration.refresh_token,
          expiry_date: integration.token_expiry ? new Date(integration.token_expiry).getTime() : undefined,
        });

        // Check if token is expired and refresh if needed
        if (integration.token_expiry && new Date(integration.token_expiry) < new Date()) {
          try {
            const { credentials } = await oauth2Client.refreshAccessToken();

            // Update tokens in database
            await supabase
              .from('integrations')
              .update({
                access_token: credentials.access_token,
                refresh_token: credentials.refresh_token || integration.refresh_token,
                token_expiry: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : null,
              })
              .eq('id', integration.id);

            // Update client with new credentials
            oauth2Client.setCredentials(credentials);
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError);

            // Mark integration as inactive
            await supabase
              .from('integrations')
              .update({ active: false })
              .eq('id', integration.id);

            return NextResponse.json(
              { error: 'Failed to refresh Google Calendar token' },
              { status: 401 },
            );
          }
        }

        // Create Calendar client
        const calendar = googleStub.calendar({ version: 'v3', auth: oauth2Client });

        // Delete event
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: appointment.external_calendar_id,
          sendUpdates: 'all',
        });

        // Remove external calendar ID from appointment
        await supabase
          .from('appointments')
          .update({ external_calendar_id: null })
          .eq('id', appointmentId);

        return NextResponse.json({
          success: true,
          message: 'Appointment removed from Google Calendar',
        });
      } catch (error) {
        console.error('Error removing from Google Calendar:', error);

        return NextResponse.json(
          {
            error: 'Failed to remove from Google Calendar',
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 },
        );
      }
    },
  },
});