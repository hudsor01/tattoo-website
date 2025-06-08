/**
 * Cal.com OAuth Token Refresh Endpoint for Atoms
 * 
 * Purpose: Handle OAuth token refresh for Cal.com Atoms
 * This endpoint receives expired access tokens and returns fresh ones
 * 
 * Required Environment Variables:
 * - NEXT_PUBLIC_X_CAL_ID: OAuth client ID
 * - X_CAL_SECRET_KEY: OAuth client secret
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }
    
    const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
    
    // Look up the user by their access token
    // Note: In a real implementation, you'd store user tokens in your database
    // For now, we'll use a simplified approach
    
    // Get OAuth credentials from environment
    const clientId = process.env['NEXT_PUBLIC_X_CAL_ID'] ?? process.env['CAL_CLIENT_ID'];
    const clientSecret = process.env['X_CAL_SECRET_KEY'] ?? process.env['CAL_CLIENT_SECRET'];
    
    if (!clientId || !clientSecret) {
      logger.error('Cal.com OAuth credentials not configured');
      return NextResponse.json(
        { error: 'OAuth credentials not configured' },
        { status: 500 }
      );
    }
    
    // For demo purposes, we'll use the provided access token as the refresh token
    // In production, you'd fetch the actual refresh token from your database
    const refreshToken = accessToken; // This should come from your database
    
    // Call Cal.com refresh endpoint with timeout
    // The correct endpoint format is /v2/oauth-clients/{clientId}/refresh
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`https://api.cal.com/v2/oauth-clients/${clientId}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clientSecret}`,
      },
      body: JSON.stringify({ 
        refreshToken: refreshToken 
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      logger.error('Cal.com token refresh failed:', { 
        status: response.status, 
        error: errorData 
      });
      
      // If refresh fails, return appropriate error
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid refresh token' },
          { status: 401 }
        );
      }
      
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Store the new tokens in your database here
    // await updateUserTokens(userId, data);
    
    return NextResponse.json({
      accessToken: data.access_token ?? data.accessToken,
    });
    
  } catch (error) {
    logger.error('Token refresh error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to refresh token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Also support POST method for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
}
