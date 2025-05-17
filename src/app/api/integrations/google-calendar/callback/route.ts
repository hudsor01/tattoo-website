import { NextRequest, NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase/server-client';

// Stub implementation for the Google APIs
// This will be replaced with the actual implementation once the googleapis package is installed
const googleStub = {
  auth: {
    OAuth2: class OAuth2Client {
      constructor(clientId: string, clientSecret: string, redirectUri: string) {
        // Stub implementation
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
    }
  })
};

// Create OAuth2 client
const oauth2Client = new googleStub.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID || "",
  process.env.GOOGLE_CLIENT_SECRET || "",
  `${process.env['WEBSITE_URL']}/settings/integrations/google-calendar/callback`,
);

/**
 * GET /api/integrations/google-calendar/callback
 *
 * Handle OAuth2 callback from Google
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // User ID from auth step

    if (!code) {
      return NextResponse.redirect(
        `${process.env['WEBSITE_URL']}/settings/integrations?error=No+code+provided`,
      );
    }

    if (!state) {
      return NextResponse.redirect(
        `${process.env['WEBSITE_URL']}/settings/integrations?error=Invalid+state`,
      );
    }

    // Initialize Supabase client
    const supabase = serverClient();

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', state)
      .single();

    if (userError || !user) {
      return NextResponse.redirect(
        `${process.env['WEBSITE_URL']}/settings/integrations?error=Invalid+user`,
      );
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Get access token, refresh token, and expiry
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

    if (!accessToken) {
      return NextResponse.redirect(
        `${process.env['WEBSITE_URL']}/settings/integrations?error=Invalid+token`,
      );
    }

    // Set credentials to get user info
    oauth2Client.setCredentials(tokens);

    // Create Calendar client
    const calendar = googleStub.calendar({ version: 'v3', auth: oauth2Client });

    // Get calendar info
    const calendarInfo = await calendar.calendars.get({
      calendarId: 'primary',
    });

    const calendarEmail = calendarInfo.data.id;
    const calendarName = calendarInfo.data.summary;

    // Check if integration already exists
    const { data: existingIntegration } = await supabase
      .from('integrations')
      .select('*')
      .eq('userId', user.id)
      .eq('provider', 'google_calendar')
      .maybeSingle();

    if (existingIntegration) {
      // Update existing integration
      await supabase
        .from('integrations')
        .update({
          accessToken,
          refreshToken: refreshToken || existingIntegration.refreshToken, // Keep old refresh token if not provided
          tokenExpiry,
          providerAccountId: calendarEmail,
          providerAccountName: calendarName,
          active: true,
          lastSyncedAt: new Date().toISOString(),
        })
        .eq('id', existingIntegration.id);
    } else {
      // Create new integration
      await supabase
        .from('integrations')
        .insert({
          userId: user.id,
          provider: 'google_calendar',
          providerAccountId: calendarEmail,
          providerAccountName: calendarName,
          accessToken,
          refreshToken,
          tokenExpiry: tokenExpiry?.toISOString(),
          active: true,
          lastSyncedAt: new Date().toISOString(),
        });
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env['WEBSITE_URL']}/settings/integrations?success=Google+Calendar+connected`,
    );
  } catch (error) {
    console.error('Error handling Google Calendar callback:', error);

    return NextResponse.redirect(
      `${process.env['WEBSITE_URL']}/settings/integrations?error=${encodeURIComponent(
        error instanceof Error ? error.message : 'Unknown error',
      )}`,
    );
  }
}