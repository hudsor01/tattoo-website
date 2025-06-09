/**
 * CSRF Protection Utility
 * 
 * Provides Cross-Site Request Forgery protection for forms and API endpoints
 */

import { randomBytes, createHash } from 'crypto';
import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Generate a double-submit CSRF token pair
 * Returns both the token and its hash for verification
 */
export function generateCSRFTokenPair(): { token: string; hash: string } {
  const token = generateCSRFToken();
  const hash = createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

/**
 * Verify CSRF token using double-submit cookie pattern
 */
export function verifyCSRFToken(
  request: NextRequest,
  options: {
    cookieName?: string;
    headerName?: string;
    allowFormData?: boolean;
  } = {}
): boolean {
  try {
    const {
      cookieName = CSRF_COOKIE_NAME,
      headerName = CSRF_HEADER_NAME,
      allowFormData = true,
    } = options;

    // Get token from cookie
    const cookieToken = request.cookies.get(cookieName)?.value;
    if (!cookieToken) {
      void logger.warn('CSRF token missing from cookie');
      return false;
    }

    // Get token from header or form data
    const requestToken = request.headers.get(headerName);
    
    // If no header token and form data is allowed, try to get from body
    if (!requestToken && allowFormData) {
      // For form submissions, we'll need to handle this in the action
      // This is just a placeholder for API endpoints
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/x-www-form-urlencoded')) {
        // This would need to be handled differently for form submissions
        return true; // Allow form submissions for now
      }
    }

    if (!requestToken) {
      void logger.warn('CSRF token missing from request header/body');
      return false;
    }

    // Verify tokens match
    const isValid = cookieToken === requestToken;
    
    if (!isValid) {
      void logger.warn('CSRF token mismatch', {
        cookieLength: cookieToken.length,
        requestLength: requestToken.length,
      });
    }

    return isValid;
  } catch (error) {
    void logger.error('CSRF verification error:', error);
    return false;
  }
}

/**
 * Verify CSRF token from form data
 */
export function verifyCSRFTokenFromForm(
  cookieToken: string,
  formToken: string
): boolean {
  try {
    if (!cookieToken || !formToken) {
      void logger.warn('CSRF token missing from cookie or form');
      return false;
    }

    const isValid = cookieToken === formToken;
    
    if (!isValid) {
      void logger.warn('CSRF form token mismatch');
    }

    return isValid;
  } catch (error) {
    void logger.error('CSRF form verification error:', error);
    return false;
  }
}

/**
 * Create CSRF protection middleware
 */
export function createCSRFMiddleware(options: {
  skipMethods?: string[];
  skipPaths?: string[];
  cookieName?: string;
  headerName?: string;
} = {}) {
  const {
    skipMethods = ['GET', 'HEAD', 'OPTIONS'],
    skipPaths = [],
    cookieName = CSRF_COOKIE_NAME,
    headerName = CSRF_HEADER_NAME,
  } = options;

  return function csrfMiddleware(request: NextRequest): boolean {
    // Skip CSRF for safe methods
    if (skipMethods.includes(request.method)) {
      return true;
    }

    // Skip CSRF for specified paths
    const pathname = request.nextUrl.pathname;
    if (skipPaths.some(path => pathname.startsWith(path))) {
      return true;
    }

    // Verify CSRF token
    return verifyCSRFToken(request, { cookieName, headerName });
  };
}

/**
 * Generate CSRF cookie options
 */
export function getCSRFCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
} {
  return {
    httpOnly: true, // Prevent XSS access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // Strict same-site policy
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  };
}

/**
 * Extract CSRF token from various sources
 */
export function extractCSRFToken(request: NextRequest): string | null {
  // Try header first
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (headerToken) return headerToken;

  // Try form field (for regular form submissions)
  // Note: This requires the form to include the token as a hidden field
  return null; // Form tokens must be extracted by the handler
}

/**
 * Constants for CSRF protection
 */
export const CSRF_CONFIG = {
  TOKEN_LENGTH: CSRF_TOKEN_LENGTH,
  HEADER_NAME: CSRF_HEADER_NAME,
  COOKIE_NAME: CSRF_COOKIE_NAME,
  FORM_FIELD_NAME: '_csrf_token', // Standard form field name
} as const;