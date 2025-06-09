/**
 * Advanced Rate Limiting and Security Middleware
 * 
 * This file centralizes all rate limiting functionality using in-memory storage.
 * For production at scale, consider implementing a distributed cache solution.
 */
import { NextRequest } from 'next/server';
import { logger } from "@/lib/logger";

// Rate limit configurations
const RATE_LIMITS = {
// API endpoints
API_GENERAL: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
API_CONTACT: { requests: 5, window: 60 * 1000 }, // 5 contact form submissions per minute
API_BOOKING: { requests: 10, window: 60 * 1000 }, // 10 booking requests per minute
API_UPLOAD: { requests: 20, window: 60 * 1000 }, // 20 uploads per minute

// Admin API endpoints (stricter limits for security)
API_ADMIN_GENERAL: { requests: 50, window: 60 * 1000 }, // 50 admin requests per minute
API_ADMIN_ANALYTICS: { requests: 30, window: 60 * 1000 }, // 30 analytics requests per minute
API_ADMIN_CUSTOMERS: { requests: 20, window: 60 * 1000 }, // 20 customer operations per minute
API_ADMIN_APPOINTMENTS: { requests: 40, window: 60 * 1000 }, // 40 appointment operations per minute
API_ADMIN_PAYMENTS: { requests: 15, window: 60 * 1000 }, // 15 payment operations per minute

// Authentication endpoints
AUTH_SIGNIN: { requests: 5, window: 15 * 60 * 1000 }, // 5 sign-in attempts per 15 minutes
AUTH_SIGNUP: { requests: 3, window: 60 * 60 * 1000 }, // 3 sign-ups per hour

// Public pages
GALLERY_VIEW: { requests: 200, window: 60 * 1000 }, // 200 gallery views per minute
PAGE_VIEW: { requests: 300, window: 60 * 1000 }, // 300 page views per minute
} as const;

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Clean every minute

/**
 * Get client IP address with support for various proxy configurations
 */
function getClientIP(request: NextRequest): string {
  // Check common proxy headers
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  if (xRealIp) {
    return xRealIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to connection IP
  return 'unknown';
}

/**
 * Determine rate limit configuration based on request path and method
 */
function getRateLimitConfig(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Authentication endpoints
  if (pathname.includes('/sign-in')) {
    return RATE_LIMITS.AUTH_SIGNIN;
  }
  if (pathname.includes('/sign-up')) {
    return RATE_LIMITS.AUTH_SIGNUP;
  }

  // API endpoints
  if (pathname.startsWith('/api/')) {
  // Admin API endpoints (stricter security)
  if (pathname.startsWith('/api/admin/')) {
  if (pathname.includes('/analytics')) {
  return RATE_LIMITS.API_ADMIN_ANALYTICS;
  }
  if (pathname.includes('/customers')) {
  return RATE_LIMITS.API_ADMIN_CUSTOMERS;
  }
  if (pathname.includes('/appointments')) {
  return RATE_LIMITS.API_ADMIN_APPOINTMENTS;
  }
  if (pathname.includes('/payments')) {
  return RATE_LIMITS.API_ADMIN_PAYMENTS;
  }
  return RATE_LIMITS.API_ADMIN_GENERAL;
  }
  
  // Public API endpoints
  if (pathname.includes('/contact')) {
  return RATE_LIMITS.API_CONTACT;
  }
  if (pathname.includes('/booking') || pathname.includes('/appointments')) {
  return RATE_LIMITS.API_BOOKING;
  }
  if (pathname.includes('/upload')) {
  return RATE_LIMITS.API_UPLOAD;
  }
  return RATE_LIMITS.API_GENERAL;
  }

  // Gallery pages (higher limit for browsing)
  if (pathname.startsWith('/gallery')) {
    return RATE_LIMITS.GALLERY_VIEW;
  }

  // Default for other pages
  return RATE_LIMITS.PAGE_VIEW;
}

/**
 * Check if request should be rate limited
 * 
 * Uses a token bucket algorithm with in-memory storage.
 * For distributed applications, consider using a shared cache like Redis or DynamoDB.
 */
export async function checkRateLimit(request: NextRequest): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  limit: number;
}> {
  const clientIP = getClientIP(request);
  const config = getRateLimitConfig(request);
  const key = `rate_limit:${clientIP}:${request.nextUrl.pathname}`;
  const now = Date.now();

  try {
    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + config.window,
      };
    }

    // Increment request count
    entry.count++;
    rateLimitStore.set(key, entry);

    const allowed = entry.count <= config.requests;
    const remaining = Math.max(0, config.requests - entry.count);

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      limit: config.requests,
    };
  } catch (error) {
    logger.error('Rate limiting error:', error);
    
    // In case of failure, allow the request with warning log
    // This is a fail-open approach to maintain availability
    return {
      allowed: true,
      remaining: config.requests - 1,
      resetTime: now + config.window,
      limit: config.requests
    };
  }
}

/**
 * Simple rate limiter (kept for backward compatibility)
 */
export function rateLimit(req: NextRequest, limit: number = 100, windowMs: number = 60000) {
  const clientIP = getClientIP(req);
  const key = `${clientIP}:${req.nextUrl.pathname}`;
  const now = Date.now();

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  // Increment request count
  entry.count++;
  rateLimitStore.set(key, entry);

  const isAllowed = entry.count <= limit;
  const remaining = Math.max(0, limit - entry.count);

  return {
    success: isAllowed,
    remaining,
    resetTime: entry.resetTime,
    limit,
  };
}

/**
 * Generate response for rate limited requests
 * 
 * Can be used with either the legacy rateLimit function or the modern checkRateLimit function
 */
export function rateLimitResponse(
  rateLimitResult: 
    | ReturnType<typeof rateLimit> 
    | Awaited<ReturnType<typeof checkRateLimit>>
) {
  const headers = new Headers();
  const isLegacy = 'success' in rateLimitResult;
  
  // Handle both legacy and modern rate limit result formats
  const limit = isLegacy ? rateLimitResult.limit : rateLimitResult.limit;
  const remaining = isLegacy ? rateLimitResult.remaining : rateLimitResult.remaining;
  const resetTime = rateLimitResult.resetTime;
  const allowed = isLegacy ? rateLimitResult.success : rateLimitResult.allowed;
  
  headers.set('X-RateLimit-Limit', limit.toString());
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());

  if (!allowed) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    headers.set('Retry-After', retryAfter.toString());
    
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers.entries()),
        },
      }
    );
  }

  return null;
}

/**
 * Generate rate limit headers for client
 * 
 * Works with both legacy and modern rate limit result formats
 */
export function getRateLimitHeaders(
  rateLimitResult: 
    | ReturnType<typeof rateLimit> 
    | Awaited<ReturnType<typeof checkRateLimit>>
) {
  const isLegacy = 'success' in rateLimitResult;
  const limit = isLegacy ? rateLimitResult.limit : rateLimitResult.limit;
  const remaining = isLegacy ? rateLimitResult.remaining : rateLimitResult.remaining;
  const resetTime = rateLimitResult.resetTime;
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetTime).toISOString(),
    'Retry-After': retryAfter.toString(),
  };
}

/**
 * Advanced security headers configuration
 */
export function getSecurityHeaders(nonce: string) {
  return {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // XSS protection (legacy but still useful)
    'X-XSS-Protection': '1; mode=block',

    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', '),

    // Strict Transport Security (HTTPS only)
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

    // Content Security Policy with nonce
    'Content-Security-Policy': [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com`,
      `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://fonts.googleapis.com`,
      "font-src 'self' https://fonts.gstatic.com https://ssl.gstatic.com",
      "img-src 'self' https: data: blob:",
      "connect-src 'self' https: wss: https://www.google-analytics.com https://analytics.google.com https://*.googleapis.com https://*.gstatic.com",
      "worker-src 'self' blob:",
      "frame-src 'self' https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
  };
}

/**
 * Detect potential security threats and suspicious patterns
 */
export function detectThreats(request: NextRequest): {
  isSuspicious: boolean;
  threats: string[];
} {
  const threats: string[] = [];
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') ?? '';

  // Check for common attack patterns in URL
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /vbscript:/i, // VBScript injection
    /onload=/i, // Event handler injection
    /onerror=/i, // Error handler injection
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(pathname) || pattern.test(searchParams.toString())) {
      threats.push(`Suspicious pattern in URL: ${pattern.source}`);
    }
  }

  // Check for bot/scanner user agents
  const botPatterns = [/sqlmap/i, /nikto/i, /nessus/i, /openvas/i, /nmap/i, /masscan/i];

  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      threats.push(`Malicious scanner detected: ${pattern.source}`);
    }
  }

  return {
    isSuspicious: threats.length > 0,
    threats,
  };
}