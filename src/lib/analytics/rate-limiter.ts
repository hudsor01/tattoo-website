/**
 * Rate Limiting for Analytics API
 * Implements sliding window rate limiting with IP-based tracking
 */

import { TRPCError } from '@trpc/server';
import { rateLimitConfig } from './config';
import type { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  windowStart: number;
  lastRequest: number;
}

interface AppTRPCContext {
  req?: NextRequest;
  user?: { id: string } | null;
  session?: { user?: { id: string } };
  [key: string]: unknown;
}

interface TRPCMiddlewareOpts {
  ctx: AppTRPCContext;
  next: () => Promise<unknown>;
  [key: string]: unknown;
}

class AnalyticsRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a request should be rate limited
   */
  public checkRateLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    totalHits: number;
  } {
    const now = Date.now();
    const windowMs = rateLimitConfig.windowMs;
    const maxRequests = rateLimitConfig.maxRequests;

    // Get or create entry for this identifier
    let entry = this.store.get(identifier);
    
    if (!entry) {
      entry = {
        count: 0,
        windowStart: now,
        lastRequest: now,
      };
      this.store.set(identifier, entry);
    }

    // Check if we need to reset the window
    if (now - entry.windowStart >= windowMs) {
      entry.count = 0;
      entry.windowStart = now;
    }

    // Increment counter
    entry.count++;
    entry.lastRequest = now;

    const remaining = Math.max(0, maxRequests - entry.count);
    const resetTime = entry.windowStart + windowMs;
    const allowed = entry.count <= maxRequests;

    return {
      allowed,
      remaining,
      resetTime,
      totalHits: entry.count,
    };
  }

  /**
   * Middleware function for tRPC procedures
   */
  public middleware() {
    return async (opts: TRPCMiddlewareOpts) => {
      const { ctx, next } = opts;
      
      // Extract identifier (IP address or user ID)
      const identifier = this.getIdentifier(ctx);
      
      // Check rate limit
      const rateLimit = this.checkRateLimit(identifier);
      
      if (!rateLimit.allowed) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds`,
          cause: {
            resetTime: rateLimit.resetTime,
            remaining: rateLimit.remaining,
          },
        });
      }

      // Add rate limit info to context
      ctx['rateLimit'] = rateLimit;

      return next();
    };
  }

  /**
   * Get identifier for rate limiting (IP or user ID)
   */
  private getIdentifier(ctx: AppTRPCContext): string {
    // Prefer user ID if authenticated
    if (ctx.user?.id) {
      return `user:${ctx.user.id}`;
    }
    
    if (ctx.session?.user?.id) {
      return `user:${ctx.session.user.id}`;
    }

    // Fall back to IP address
    const ip = this.extractClientIP(ctx);
    return `ip:${ip}`;
  }

  /**
   * Extract client IP address with proper fallback
   */
  private extractClientIP(ctx: AppTRPCContext): string {
    const req = ctx.req;
    
    if (!req?.headers) {
      return 'unknown';
    }

    // Check various headers for the real IP from NextRequest
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
    }

    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
      return realIp;
    }

    // NextRequest doesn't have connection/socket properties
    // IP would need to be extracted differently in Vercel/Edge runtime
    return 'unknown';
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const windowMs = rateLimitConfig.windowMs;
    
    for (const [key, entry] of this.store.entries()) {
      // Remove entries that haven't been accessed in 2 windows
      if (now - entry.lastRequest > windowMs * 2) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Get current rate limit stats (for monitoring)
   */
  public getStats(): {
    totalIdentifiers: number;
    memoryUsage: number;
    topConsumers: Array<{ identifier: string; count: number; lastRequest: number }>;
  } {
    const entries = Array.from(this.store.entries()).map(([identifier, entry]) => ({
      identifier,
      count: entry.count,
      lastRequest: entry.lastRequest,
    }));

    return {
      totalIdentifiers: this.store.size,
      memoryUsage: JSON.stringify(Object.fromEntries(this.store)).length,
      topConsumers: entries
        .sort((a, b) => b.count - a.count)
        .slice(0, 10), // Top 10 consumers
    };
  }

  /**
   * Reset rate limit for a specific identifier (admin function)
   */
  public resetRateLimit(identifier: string): boolean {
    return this.store.delete(identifier);
  }

  /**
   * Cleanup on shutdown
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Singleton instance
let rateLimiterInstance: AnalyticsRateLimiter | null = null;

export function getRateLimiter(): AnalyticsRateLimiter {
  rateLimiterInstance ??= new AnalyticsRateLimiter();
  return rateLimiterInstance;
}

// Export for graceful shutdown
export function destroyRateLimiter(): void {
  if (rateLimiterInstance) {
    rateLimiterInstance.destroy();
    rateLimiterInstance = null;
  }
}
