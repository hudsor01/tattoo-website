'use server'

import { headers } from 'next/headers'

// In-memory store for development (use Redis in production)
const store = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  max: number // Maximum requests
  windowMs: number // Time window in milliseconds
  identifier?: string // Custom identifier (defaults to IP)
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  totalHits: number
}

export class RateLimiter {
  private config: Required<RateLimitConfig>

  constructor(config: RateLimitConfig) {
    this.config = {
      max: config.max,
      windowMs: config.windowMs,
      identifier: config.identifier ?? '',
      skipSuccessfulRequests: config.skipSuccessfulRequests ?? false,
      skipFailedRequests: config.skipFailedRequests ?? false,
    }
  }

  async check(customIdentifier?: string): Promise<RateLimitResult> {
    const now = Date.now()
    const identifier = customIdentifier ?? this.config.identifier ?? await this.getClientIdentifier()
    
    // Clean up expired entries
    this.cleanup(now)
    
    const key = `${identifier}:${Math.floor(now / this.config.windowMs)}`
    const current = store.get(key) ?? { count: 0, resetTime: now + this.config.windowMs }
    
    // Check if limit exceeded
    if (current.count >= this.config.max) {
      return {
        success: false,
        remaining: 0,
        resetTime: current.resetTime,
        totalHits: current.count,
      }
    }

    // Increment counter
    current.count += 1
    store.set(key, current)

    return {
      success: true,
      remaining: this.config.max - current.count,
      resetTime: current.resetTime,
      totalHits: current.count,
    }
  }

  async increment(customIdentifier?: string): Promise<void> {
    const now = Date.now()
    const identifier = customIdentifier ?? this.config.identifier ?? await this.getClientIdentifier()
    const key = `${identifier}:${Math.floor(now / this.config.windowMs)}`
    
    const current = store.get(key) ?? { count: 0, resetTime: now + this.config.windowMs }
    current.count += 1
    store.set(key, current)
  }

  private async getClientIdentifier(): Promise<string> {
    const headersList = await headers()
    
    // Try to get real IP from various headers
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const cfConnectingIp = headersList.get('cf-connecting-ip')
    
    const ip = forwardedFor?.split(',')[0]?.trim() ?? 
             realIp ?? 
             cfConnectingIp ?? 
             'unknown'

    // Add user agent for additional uniqueness
    const userAgent = headersList.get('user-agent') ?? ''
    const userAgentHash = this.simpleHash(userAgent)
    
    return `${ip}:${userAgentHash}`
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  private cleanup(now: number): void {
    for (const [key, data] of store.entries()) {
      if (data.resetTime < now) {
        store.delete(key)
      }
    }
  }

  // Get current status without incrementing
  async status(customIdentifier?: string): Promise<RateLimitResult> {
    const now = Date.now()
    const identifier = customIdentifier ?? this.config.identifier ?? await this.getClientIdentifier()
    const key = `${identifier}:${Math.floor(now / this.config.windowMs)}`
    
    const current = store.get(key) ?? { count: 0, resetTime: now + this.config.windowMs }
    
    return {
      success: current.count < this.config.max,
      remaining: Math.max(0, this.config.max - current.count),
      resetTime: current.resetTime,
      totalHits: current.count,
    }
  }

  // Reset a specific identifier's limit
  async reset(customIdentifier?: string): Promise<void> {
    const now = Date.now()
    const identifier = customIdentifier ?? this.config.identifier ?? await this.getClientIdentifier()
    const key = `${identifier}:${Math.floor(now / this.config.windowMs)}`
    store.delete(key)
  }
}

// Predefined rate limiters for different use cases
export const rateLimiters = {
  // General API requests
  api: new RateLimiter({
    max: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }),

  // Authentication requests
  auth: new RateLimiter({
    max: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }),

  // Contact form submissions
  contact: new RateLimiter({
    max: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  }),

  // Booking requests
  booking: new RateLimiter({
    max: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  }),

  // File uploads
  upload: new RateLimiter({
    max: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
  }),

  // Search requests
  search: new RateLimiter({
    max: 50,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }),

  // Password reset requests
  passwordReset: new RateLimiter({
    max: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  }),

  // Email sending
  email: new RateLimiter({
    max: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  }),
}

// Middleware helper for Next.js API routes
export function withRateLimit(limiter: RateLimiter) {
  return async function rateLimitMiddleware() {
    const result = await limiter.check()
    
    if (!result.success) {
      const resetDate = new Date(result.resetTime)
      throw new Error(`Rate limit exceeded. Resets at ${resetDate.toISOString()}`)
    }

    return {
      remaining: result.remaining,
      resetTime: result.resetTime,
      totalHits: result.totalHits,
    }
  }
}

// Helper to get rate limit headers for responses
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': '100', // Fixed value since we can't access private config
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    'Retry-After': result.success ? '0' : Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
  }
}

// Sliding window rate limiter for more precise control
export class SlidingWindowRateLimiter {
  private requests = new Map<string, number[]>()
  private config: { max: number; windowMs: number }

  constructor(config: { max: number; windowMs: number }) {
    this.config = config
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    
    // Get existing requests for this identifier
    let requests = this.requests.get(identifier) ?? []
    
    // Remove requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart)
    
    // Update the stored requests
    this.requests.set(identifier, requests)
    
    const remaining = Math.max(0, this.config.max - requests.length)
    const success = requests.length < this.config.max
    
    if (success) {
      requests.push(now)
      this.requests.set(identifier, requests)
    }

    return {
      success,
      remaining: success ? remaining - 1 : remaining,
      resetTime: (requests?.length && requests[0] !== undefined)
        ? requests[0] + this.config.windowMs
        : now + this.config.windowMs,
      totalHits: requests.length,
    }
  }

  cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart)
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
  }
}

// Token bucket rate limiter for burst handling
export class TokenBucketRateLimiter {
  private buckets = new Map<string, { tokens: number; lastRefill: number }>()
  private config: { capacity: number; refillRate: number; refillPeriod: number }

  constructor(config: { capacity: number; refillRate: number; refillPeriod: number }) {
    this.config = config
  }

  async check(identifier: string, tokensNeeded = 1): Promise<RateLimitResult> {
    const now = Date.now()
    const bucket = this.buckets.get(identifier) ?? {
      tokens: this.config.capacity,
      lastRefill: now,
    }

    // Calculate tokens to add
    const timePassed = now - bucket.lastRefill
    const tokensToAdd = Math.floor(timePassed / this.config.refillPeriod) * this.config.refillRate
    
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(this.config.capacity, bucket.tokens + tokensToAdd)
      bucket.lastRefill = now
    }

    const success = bucket.tokens >= tokensNeeded
    
    if (success) {
      bucket.tokens -= tokensNeeded
    }

    this.buckets.set(identifier, bucket)

    const nextRefillTime = bucket.lastRefill + this.config.refillPeriod

    return {
      success,
      remaining: bucket.tokens,
      resetTime: nextRefillTime,
      totalHits: this.config.capacity - bucket.tokens,
    }
  }
}