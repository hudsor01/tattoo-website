/**
 * Cal.com OAuth Token Management API
 * 
 * Handles OAuth token exchange and refresh for Cal.com Atoms integration
 */

import { NextRequest, NextResponse } from 'next/server';

const CAL_CLIENT_ID = process.env['CALCOM_CLIENT_ID'];
const CAL_CLIENT_SECRET = process.env['CALCOM_CLIENT_SECRET'];
const CAL_REDIRECT_URI = process.env['CALCOM_REDIRECT_URI'] ?? `${process.env['NEXT_PUBLIC_APP_URL']}/api/cal/oauth/callback`;

export async function POST(request: NextRequest) {
  try {
    const { code, grant_type, refresh_token } = await request.json();

    if (!CAL_CLIENT_ID || !CAL_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Cal.com OAuth credentials not configured' },
        { status: 500 }
      );
    }

    let body;
    
    if (grant_type === 'authorization_code') {
      // Initial token exchange
      body = {
        grant_type: 'authorization_code',
        client_id: CAL_CLIENT_ID,
        client_secret: CAL_CLIENT_SECRET,
        redirect_uri: CAL_REDIRECT_URI,
        code,
      };
    } else if (grant_type === 'refresh_token') {
      // Token refresh
      body = {
        grant_type: 'refresh_token',
        client_id: CAL_CLIENT_ID,
        client_secret: CAL_CLIENT_SECRET,
        refresh_token,
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid grant_type' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.cal.com/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Cal.com OAuth error:', error);
      return NextResponse.json(
        { error: 'Failed to exchange token' },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('OAuth endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get('error');
  const code = searchParams.get('code');

  if (error) {
    return NextResponse.json(
      { error: `OAuth error: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: 'No authorization code received' },
      { status: 400 }
    );
  }

  // This would typically redirect to your app with the code
  // For now, return the code for manual handling
  return NextResponse.json({ code });
}
