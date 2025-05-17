/**
 * Universal Cookie API
 *
 * This module provides a unified cookie handling implementation for client,
 * server, and middleware environments, all in a single file for easy imports.
 */

import { type NextRequest, type NextResponse } from 'next/server';

// Cookie options interface
export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * CLIENT-SIDE IMPLEMENTATION
 *
 * Safe implementation for client-side cookie handling
 */
export const ClientCookies = {
  /**
   * Get a cookie value
   */
  get(name: string): string | undefined {
    try {
      if (typeof document === 'undefined') return undefined;

      const value = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${name}=`))
        ?.split('=')[1];

      return value ? decodeURIComponent(value) : undefined;
    } catch {
      return undefined;
    }
  },

  /**
   * Set a cookie with options
   */
  set(name: string, value: string, options: CookieOptions = {}): void {
    try {
      if (typeof document === 'undefined') return;

      let cookieString = `${name}=${encodeURIComponent(value)}`;

      if (options.maxAge) cookieString += `; Max-Age=${options.maxAge}`;
      if (options.expires) cookieString += `; Expires=${options.expires.toUTCString()}`;
      if (options.path) cookieString += `; Path=${options.path}`;
      if (options.domain) cookieString += `; Domain=${options.domain}`;
      if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;
      if (options.secure) cookieString += `; Secure`;
      if (options.httpOnly) cookieString += `; HttpOnly`;

      document.cookie = cookieString;
    } catch {
      // Ignore errors in cookie setting
    }
  },

  /**
   * Remove a cookie
   */
  remove(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
    try {
      if (typeof document === 'undefined') return;

      let cookieString = `${name}=; Max-Age=0`;

      if (options.path) cookieString += `; Path=${options.path}`;
      if (options.domain) cookieString += `; Domain=${options.domain}`;

      document.cookie = cookieString;
    } catch {
      // Ignore errors in cookie removal
    }
  },

  /**
   * Get all cookies as an object
   */
  getAll(): Record<string, string> {
    try {
      if (typeof document === 'undefined') return {};

      return document.cookie.split('; ').reduce(
        (acc, curr) => {
          const [key, value] = curr.split('=');
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        },
        {} as Record<string, string>,
      );
    } catch {
      return {};
    }
  },
};

/**
 * SERVER-SIDE IMPLEMENTATION
 *
 * Safe implementation for server components and API routes
 */
export const ServerCookies = {
  /**
   * Get a cookie value
   */
  async get(name: string): Promise<string | undefined> {
    try {
      // In server context use the cookies API
      if (typeof window === 'undefined') {
        const { cookies: getCookies } = await import('next/headers');
        return getCookies().get(name)?.value;
      }
      return undefined;
    } catch (e) {
      // console.error('ServerCookies.get error:', e); // Optional: log error
      return undefined;
    }
  },

  /**
   * Set a cookie with options
   */
  async set(name: string, value: string, options: CookieOptions = {}): Promise<void> {
    try {
      // In server context use the cookies API
      if (typeof window === 'undefined') {
        const { cookies: setCookies } = await import('next/headers');
        setCookies().set({
          name,
          value,
          ...options,
        });
      }
    } catch (e) {
      // console.error('ServerCookies.set error:', e); // Optional: log error
      // Ignore errors in server cookie setting
    }
  },

  /**
   * Remove a cookie
   */
  async remove(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): Promise<void> {
    try {
      // In server context use the cookies API
      if (typeof window === 'undefined') {
        const { cookies: delCookies } = await import('next/headers');
        delCookies().set({
          name,
          value: '',
          ...options,
          maxAge: 0,
        });
      }
    } catch (e) {
      // console.error('ServerCookies.remove error:', e); // Optional: log error
      // Ignore errors in server cookie removal
    }
  },

  /**
   * Get all cookies
   */
  async getAll(): Promise<Record<string, string>> {
    try {
      // In server context use the cookies API
      if (typeof window === 'undefined') {
        const { cookies: getAllCookies } = await import('next/headers');
        const allCookies = getAllCookies().getAll();

        return allCookies.reduce(
          (acc, cookie) => {
            acc[cookie.name] = cookie.value;
            return acc;
          },
          {} as Record<string, string>,
        );
      }
      return {};
    } catch (e) {
      // console.error('ServerCookies.getAll error:', e); // Optional: log error
      return {};
    }
  },
};

/**
 * MIDDLEWARE IMPLEMENTATION
 *
 * Create a cookie API for middleware with NextRequest/NextResponse
 */
export function createMiddlewareCookies(req: NextRequest, res: NextResponse) {
  return {
    /**
     * Get a cookie value from the request
     */
    get(name: string): string | undefined {
      return req.cookies.get(name)?.value;
    },

    /**
     * Set a cookie in the response
     */
    set(name: string, value: string, options: CookieOptions = {}): void {
      res.cookies.set({
        name,
        value,
        ...options,
      });
    },

    /**
     * Remove a cookie in the response
     */
    remove(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
      res.cookies.set({
        name,
        value: '',
        ...options,
        maxAge: 0,
      });
    },

    /**
     * Get all cookies from the request
     */
    getAll(): Record<string, string> {
      const cookieEntries = req.cookies.getAll();
      return cookieEntries.reduce(
        (acc, cookie) => {
          acc[cookie.name] = cookie.value;
          return acc;
        },
        {} as Record<string, string>,
      );
    },
  };
}

/**
 * Legacy compatibility layer for existing code
 * New code should import directly from the standardized cookie implementations
 */
export function getCookie(name: string): string | undefined {
  return ClientCookies.get(name);
}

export function setCookie(name: string, value: string, options?: CookieOptions): void {
  ClientCookies.set(name, value, options);
}

export function removeCookie(name: string, options?: Pick<CookieOptions, 'path' | 'domain'>): void {
  ClientCookies.remove(name, options);
}

export function getAllCookies(): Record<string, string> {
  return ClientCookies.getAll();
}

/**
 * Utility functions for handling cookies
 */

/**
 * For middleware and API routes
 * Get a cookie from a NextRequest object
 */
export function getCookieFromRequest(req: NextRequest, name: string): string | undefined {
  const cookie = req.cookies.get(name);
  return cookie?.value;
}

/**
 * For middleware and API routes
 * Set a cookie in a NextResponse object
 */
export function setCookieInResponse(
  res: NextResponse,
  name: string,
  value: string,
  options?: CookieOptions,
): NextResponse {
  res.cookies.set({
    name,
    value,
    ...options,
  });
  return res;
}

/**
 * Parse cookies from a cookie header string
 * Useful when working with raw headers
 * @param cookieHeader The cookie header string
 * @returns Record of cookie name to cookie value
 */
export function parseCookieString(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) cookies[name] = rest.join('=');
  });

  return cookies;
}

/**
 * Server-side compatibility exports
 * These match the API of the old server-cookies.ts file
 */
export function getServerCookie(name: string): string | undefined {
  return ServerCookies.get(name);
}

export function setServerCookie(name: string, value: string, options?: CookieOptions): void {
  ServerCookies.set(name, value, options);
}

export function deleteServerCookie(
  name: string,
  options?: Pick<CookieOptions, 'path' | 'domain'>,
): void {
  ServerCookies.remove(name, options);
}

export function getAllServerCookies(): Record<string, string> {
  return ServerCookies.getAll();
}

/**
 * Default export is client-side implementation for easy import
 */
export default ClientCookies;
