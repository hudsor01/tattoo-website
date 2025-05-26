import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    lastReset: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(req: NextRequest, limit: number = 100, windowMs: number = 60000) {
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const key = `${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();
  
  store[key] ??= { count: 0, lastReset: now };
  
  const timeElapsed = now - store[key].lastReset;
  
  if (timeElapsed > windowMs) {
    store[key] = { count: 0, lastReset: now };
  }
  
  store[key].count++;
  
  const isAllowed = store[key].count <= limit;
  const remaining = Math.max(0, limit - store[key].count);
  const resetTime = store[key].lastReset + windowMs;
  
  return {
    success: isAllowed,
    remaining,
    resetTime,
    limit
  };
}

export function rateLimitResponse(rateLimitResult: ReturnType<typeof rateLimit>) {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
  
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({ 
        error: 'Rate limit exceeded', 
        message: 'Too many requests. Please try again later.' 
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers.entries())
        }
      }
    );
  }
  
  return null;
}