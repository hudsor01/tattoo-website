/**
 * Cal.com OAuth Token Refresh Endpoint
 * 
 * Purpose: Handle OAuth token refresh for Cal.com Atoms
 * Dependencies: Cal.com OAuth credentials
 */

import { NextRequest, NextResponse } from 'next/server';

import { logger } from "@/lib/logger";
export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }
    
    const response = await fetch('https://api.cal.com/v2/oauth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cal-client-id': process.env['CAL_CLIENT_ID'] ?? '',
        'x-cal-secret-key': process.env['X_CAL_SECRET_KEY'] ?? '',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    
  } catch (error) {
    void logger.error('Token refresh error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to refresh token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
