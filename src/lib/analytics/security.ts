/**
 * Security Utilities for Analytics
 * Handles encryption, access control, and security validation
 */

import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { logger } from "@/lib/logger";

export interface SecurityConfig {
  encryptionKey?: string;
  algorithm?: string;
  ivLength?: number;
  hashAlgorithm?: string;
}

export interface AccessControl {
  userId: string;
  role: string;
  permissions: string[];
}

// In-memory rate limit store
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

export class SecurityUtils {
  private config: Required<SecurityConfig>;

  constructor(config: SecurityConfig = {}) {
    this.config = {
      encryptionKey: config.encryptionKey ?? process.env.ANALYTICS_ENCRYPTION_KEY ?? this.generateKey(),
      algorithm: config.algorithm ?? 'aes-256-gcm',
      ivLength: config.ivLength ?? 16,
      hashAlgorithm: config.hashAlgorithm ?? 'sha256',
    };
  }

  /**
   * Generate a secure encryption key
   */
  private generateKey(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    const iv = randomBytes(this.config.ivLength);
    const cipher = createCipheriv(this.config.algorithm, Buffer.from(this.config.encryptionKey, 'hex'), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = createDecipheriv(
      this.config.algorithm,
      Buffer.from(this.config.encryptionKey, 'hex'),
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(data: string, salt?: string): string {
    const actualSalt = salt ?? randomBytes(16).toString('hex');
    const hash = createHash(this.config.hashAlgorithm);
    hash.update(data + actualSalt);
    return hash.digest('hex');
  }

  /**
   * Validate user access to analytics data
   */
  validateAccess(accessControl: AccessControl, requiredPermission: string): boolean {
    // Admin and superadmin have full access
    if (['admin', 'superadmin'].includes(accessControl.role.toLowerCase())) {
      return true;
    }

    // Check specific permissions
    return accessControl.permissions.includes(requiredPermission);
  }

  /**
   * Sanitize user input to prevent injection attacks
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML/XML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;\\]/g, '') // Remove potential SQL injection chars
      .trim()
      .substring(0, 1000); // Limit length
  }

  /**
   * Generate a secure token for API access
   */
  generateToken(userId: string, expiresIn: number = 3600): string {
    const payload = {
      userId,
      exp: Date.now() + (expiresIn * 1000),
      nonce: randomBytes(16).toString('hex')
    };
    
    const tokenData = JSON.stringify(payload);
    return Buffer.from(tokenData).toString('base64');
  }

  /**
   * Validate and parse an access token
   */
  validateToken(token: string): { userId: string; exp: number } | null {
    try {
      const tokenData = Buffer.from(token, 'base64').toString('utf8');
      const payload = JSON.parse(tokenData);
      
      if (payload.exp < Date.now()) {
        return null; // Token expired
      }
      
      return {
        userId: payload.userId,
        exp: payload.exp
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if request is coming from a trusted source
   */
  validateOrigin(origin: string, allowedOrigins: string[]): boolean {
    if (!origin) return false;
    
    return allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.includes('*')) {
        const pattern = allowed.replace(/\*/g, '.*');
        return new RegExp(`^${pattern}$`).test(origin);
      }
      return allowed === origin;
    });
  }

  /**
   * Rate limit check using in-memory storage
   * For production at scale, consider implementing a distributed cache
   */
  async checkRateLimit(identifier: string, maxRequests: number, windowMs: number): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `rate_limit:${identifier}:${windowMs}`;
    const now = Date.now();
    
    try {
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

      const allowed = entry.count <= maxRequests;
      const remaining = Math.max(0, maxRequests - entry.count);

      return {
        allowed,
        remaining,
        resetTime: entry.resetTime,
      };
    } catch (error) {
      // Log the error but don't fail the application
      logger.error('Rate limiting error:', error);
      
      // In case of error, default to allowing the request
      // This is a fail-open approach that prioritizes availability
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      };
    }
  }

  /**
   * Generate secure random ID
   */
  generateSecureId(length: number = 32): string {
    return randomBytes(length / 2).toString('hex');
  }
}

// Export singleton instance
export const securityUtils = new SecurityUtils();

// Security constants
export const SECURITY_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  TOKEN_EXPIRY: 3600, // 1 hour
  RATE_LIMIT_WINDOW: 900000, // 15 minutes
  MAX_REQUESTS_PER_WINDOW: 100,
  ALLOWED_DOMAINS: [
    'localhost',
    '127.0.0.1',
    process.env.DOMAIN_NAME ?? 'tattoo-website.com'
  ]
} as const;