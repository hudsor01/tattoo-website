/**
 * Security Utilities for Analytics
 * Handles encryption, access control, and security validation
 */

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
      encryptionKey: config.encryptionKey ?? process.env['ANALYTICS_ENCRYPTION_KEY'] ?? this.generateKey(),
      algorithm: config.algorithm ?? 'aes-256-gcm',
      ivLength: config.ivLength ?? 16,
      hashAlgorithm: config.hashAlgorithm ?? 'sha256',
    };
  }

  /**
   * Generate a secure encryption key
   */
  private generateKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypt sensitive data using Web Crypto API
   */
  async encrypt(data: string): Promise<{ encrypted: string; iv: string }> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const iv = new Uint8Array(this.config.ivLength);
    crypto.getRandomValues(iv);
    
    const key = await crypto.subtle.importKey(
      'raw',
      Buffer.from(this.config.encryptionKey, 'hex'),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );
    
    return {
      encrypted: Array.from(new Uint8Array(encrypted), byte => byte.toString(16).padStart(2, '0')).join(''),
      iv: Array.from(iv, byte => byte.toString(16).padStart(2, '0')).join('')
    };
  }

  /**
   * Decrypt sensitive data using Web Crypto API
   */
  async decrypt(encryptedData: { encrypted: string; iv: string }): Promise<string> {
    const key = await crypto.subtle.importKey(
      'raw',
      Buffer.from(this.config.encryptionKey, 'hex'),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const ivMatches = encryptedData.iv.match(/.{2}/g);
    const encryptedMatches = encryptedData.encrypted.match(/.{2}/g);
    
    if (!ivMatches || !encryptedMatches) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = new Uint8Array(ivMatches.map(byte => parseInt(byte, 16)));
    const encrypted = new Uint8Array(encryptedMatches.map(byte => parseInt(byte, 16)));
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Hash sensitive data (one-way) using Web Crypto API
   */
  async hash(data: string, salt?: string): Promise<string> {
    const actualSalt = salt ?? this.generateRandomString(16);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data + actualSalt);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return Array.from(new Uint8Array(hashBuffer), byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  private generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
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
      nonce: this.generateRandomString(16)
    };
    
    const tokenData = JSON.stringify(payload);
    return btoa(tokenData);
  }

  /**
   * Validate and parse an access token
   */
  validateToken(token: string): { userId: string; exp: number } | null {
    try {
      const tokenData = atob(token);
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
    return this.generateRandomString(length / 2);
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
    process.env['DOMAIN_NAME'] ?? 'tattoo-website.com'
  ]
} as const;