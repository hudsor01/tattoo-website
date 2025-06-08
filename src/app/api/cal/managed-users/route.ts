/**
 * Cal.com Managed Users API
 * 
 * Handles creation and management of Cal.com managed users for Atoms
 */

import { NextRequest, NextResponse } from 'next/server';

const CAL_API_KEY = process.env['CAL_API_KEY'];
const CAL_API_BASE = 'https://api.cal.com/v2';

export async function POST(request: NextRequest) {
  try {
    const { email, username, name, timeZone = 'America/Chicago' } = await request.json();

    if (!CAL_API_KEY) {
      return NextResponse.json(
        { error: 'Cal.com API key not configured' },
        { status: 500 }
      );
    }

    if (!email || !username || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, username, name' },
        { status: 400 }
      );
    }

    // Create managed user
    const response = await fetch(`${CAL_API_BASE}/managed-users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CAL_API_KEY}`,
        'Content-Type': 'application/json',
        'cal-api-version': '2024-08-13',
      },
      body: JSON.stringify({
        email,
        username,
        name,
        timeZone,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Cal.com managed user creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create managed user' },
        { status: response.status }
      );
    }

    const userData = await response.json();
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Managed users endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!CAL_API_KEY) {
      return NextResponse.json(
        { error: 'Cal.com API key not configured' },
        { status: 500 }
      );
    }

    const url = userId 
      ? `${CAL_API_BASE}/managed-users/${userId}`
      : `${CAL_API_BASE}/managed-users`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${CAL_API_KEY}`,
        'cal-api-version': '2024-08-13',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Cal.com managed users fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch managed users' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Managed users GET endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
