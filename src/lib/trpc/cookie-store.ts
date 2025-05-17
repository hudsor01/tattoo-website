/**
 * Cookie Store Implementation for Supabase and tRPC
 * 
 * Provides a standardized implementation of a cookie store
 * compatible with Supabase's requirements, for use in tRPC context
 * and other server-side operations.
 */

import { NextRequest } from 'next/server';
// Import from the consolidated cookie module
import { parseCookieString } from '../cookie';

/**
 * Type definitions for a cookie store compatible with Supabase
 */
export interface CookieStore {
  get: (name: string) => { name: string; value: string } | undefined;
  set: (name: string, value: string, options: CookieOptions) => void;
  getAll: () => Array<{ name: string; value: string }>;
  delete: (name: string, options: CookieOptions) => void;
}

/**
 * Options for cookie operations
 */
export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  domain?: string;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
  secure?: boolean;
  httpOnly?: boolean;
}

/**
 * Create a cookie store for NextRequest/Headers
 * For use in API routes and middleware
 */
export function createRequestCookieStore(req: NextRequest, resHeaders: Headers): CookieStore {
  const cookieHeader = req.headers.get('cookie') || '';
  
  return {
    get: (name: string) => {
      const match = cookieHeader.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
      return match ? { name, value: match[2] } : undefined;
    },
    
    set: (name: string, value: string, options: CookieOptions) => {
      let cookie = `${name}=${value}`;
      if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`;
      if (options.maxAge) cookie += `; Max-Age=${options.maxAge}`;
      if (options.domain) cookie += `; Domain=${options.domain}`;
      if (options.path) cookie += `; Path=${options.path || '/'}`;
      if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
      if (options.secure) cookie += `; Secure`;
      if (options.httpOnly) cookie += `; HttpOnly`;
      
      resHeaders.append('Set-Cookie', cookie);
    },
    
    getAll: () => {
      return cookieHeader
        .split(';')
        .filter(Boolean)
        .map(cookie => {
          const [name, ...rest] = cookie.trim().split('=');
          return { name, value: rest.join('=') };
        });
    },
    
    delete: (name: string, options: CookieOptions) => {
      // Delete by setting an expired cookie
      let cookie = `${name}=; Max-Age=0`;
      if (options.path) cookie += `; Path=${options.path || '/'}`;
      if (options.domain) cookie += `; Domain=${options.domain}`;
      if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
      if (options.secure) cookie += `; Secure`;
      if (options.httpOnly) cookie += `; HttpOnly`;
      
      resHeaders.append('Set-Cookie', cookie);
    }
  };
}

/**
 * Parse cookies from a raw cookie header
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  return parseCookieString(cookieHeader);
}