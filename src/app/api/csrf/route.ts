/**
 * CSRF Token API
 * 
 * Provides CSRF tokens for form protection
 */

import { NextResponse } from 'next/server';
import { generateCSRFToken, getCSRFCookieOptions } from '@/lib/security/csrf';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Generate new CSRF token
    const token = generateCSRFToken();
    
    // Create response with token
    const response = NextResponse.json({
      token,
      timestamp: new Date().toISOString(),
    });

    // Set CSRF token in cookie
    const cookieOptions = getCSRFCookieOptions();
    response.cookies.set('csrf-token', token, cookieOptions);

    // Add security headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    void logger.error('CSRF token generation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}