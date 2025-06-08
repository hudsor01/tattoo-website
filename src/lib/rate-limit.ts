/**
 * This file is kept for backward compatibility
 * The rate limiting logic has been consolidated in src/lib/security/rate-limiter.ts
 */

export { 
  rateLimit,
  rateLimitResponse
} from '@/lib/security/rate-limiter';
