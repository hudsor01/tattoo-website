/**
 * Cal.com Token Refresh API
 * 
 * Handles automatic token refresh for Cal.com Atoms
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Call our OAuth endpoint to refresh the token
    const response = await fetch(`${process.env['NEXT_PUBLIC_APP_URL']}/api/cal/oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
