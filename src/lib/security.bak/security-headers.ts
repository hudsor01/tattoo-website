import { NextResponse } from 'next/server'

export interface SecurityConfig {
  contentSecurityPolicy?: string
  frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM'
  contentTypeOptions?: boolean
  referrerPolicy?: string
  permissionsPolicy?: string
  xssProtection?: boolean
  hsts?: {
    maxAge: number
    includeSubDomains?: boolean
    preload?: boolean
  }
}

const defaultConfig: Required<SecurityConfig> = {
  contentSecurityPolicy: `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co;
    frame-src 'self' https://js.stripe.com https://cal.com;
    media-src 'self' https://*.supabase.co;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim(),
  frameOptions: 'DENY',
  contentTypeOptions: true,
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=(), payment=()',
  xssProtection: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}

export function createSecurityHeaders(config: SecurityConfig = {}): Record<string, string> {
  const mergedConfig = { ...defaultConfig, ...config }
  const headers: Record<string, string> = {}

  // Content Security Policy
  if (mergedConfig.contentSecurityPolicy) {
    headers['Content-Security-Policy'] = mergedConfig.contentSecurityPolicy
  }

  // X-Frame-Options
  headers['X-Frame-Options'] = mergedConfig.frameOptions

  // X-Content-Type-Options
  if (mergedConfig.contentTypeOptions) {
    headers['X-Content-Type-Options'] = 'nosniff'
  }

  // Referrer Policy
  if (mergedConfig.referrerPolicy) {
    headers['Referrer-Policy'] = mergedConfig.referrerPolicy
  }

  // Permissions Policy
  if (mergedConfig.permissionsPolicy) {
    headers['Permissions-Policy'] = mergedConfig.permissionsPolicy
  }

  // X-XSS-Protection
  if (mergedConfig.xssProtection) {
    headers['X-XSS-Protection'] = '1; mode=block'
  }

  // Strict Transport Security (only in production with HTTPS)
  if (process.env.NODE_ENV === 'production' && mergedConfig.hsts) {
    const { maxAge, includeSubDomains, preload } = mergedConfig.hsts
    let hstsValue = `max-age=${maxAge}`
    
    if (includeSubDomains) {
      hstsValue += '; includeSubDomains'
    }
    
    if (preload) {
      hstsValue += '; preload'
    }
    
    headers['Strict-Transport-Security'] = hstsValue
  }

  // Additional security headers
  headers['X-DNS-Prefetch-Control'] = 'off'
  headers['X-Download-Options'] = 'noopen'
  headers['X-Permitted-Cross-Domain-Policies'] = 'none'

  return headers
}

export function applySecurityHeaders(response: NextResponse, config?: SecurityConfig): NextResponse {
  const headers = createSecurityHeaders(config)
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Content Security Policy nonce generator
export function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64')
}

// CSRF protection helpers
export function generateCSRFToken(): string {
  return crypto.randomUUID()
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 36 // UUID length
}

// Rate limiting headers
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetTime: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString())
  
  if (remaining === 0) {
    response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString())
  }
  
  return response
}

// Audit logging for security events
export interface SecurityAuditEvent {
  type: 'auth_failure' | 'rate_limit_exceeded' | 'suspicious_request' | 'admin_action'
  userId?: string
  ip: string
  userAgent: string
  details: Record<string, unknown>
  timestamp: Date
}

export class SecurityAuditor {
  private static instance: SecurityAuditor
  private events: SecurityAuditEvent[] = []

  static getInstance(): SecurityAuditor {
    if (!SecurityAuditor.instance) {
      SecurityAuditor.instance = new SecurityAuditor()
    }
    return SecurityAuditor.instance
  }

  log(event: Omit<SecurityAuditEvent, 'timestamp'>): void {
    const auditEvent: SecurityAuditEvent = {
      ...event,
      timestamp: new Date(),
    }
    
    this.events.push(auditEvent)
    
    // In production, send to logging service
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(auditEvent)
    } else {
      console.warn('Security Event:', auditEvent)
    }
  }

  private sendToLoggingService(event: SecurityAuditEvent): void {
    // Implement logging service integration (e.g., Sentry, LogRocket, etc.)
    // This is a placeholder for the actual implementation
    if (process.env.SENTRY_DSN) {
      // Send to Sentry or other logging service
    }
  }

  getRecentEvents(limit = 100): SecurityAuditEvent[] {
    return this.events.slice(-limit)
  }

  clearOldEvents(olderThanHours = 24): void {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    this.events = this.events.filter(event => event.timestamp > cutoff)
  }
}

// IP validation and blocking
export class IPBlocklist {
  private static blockedIPs = new Set<string>()
  private static suspiciousIPs = new Map<string, number>()

  static block(ip: string): void {
    this.blockedIPs.add(ip)
    SecurityAuditor.getInstance().log({
      type: 'suspicious_request',
      ip,
      userAgent: '',
      details: { action: 'ip_blocked' },
    })
  }

  static isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip)
  }

  static reportSuspicious(ip: string): void {
    const current = this.suspiciousIPs.get(ip) ?? 0
    this.suspiciousIPs.set(ip, current + 1)
    
    // Auto-block after 5 suspicious reports
    if (current + 1 >= 5) {
      this.block(ip)
    }
  }

  static getSuspiciousIPs(): Record<string, number> {
    return Object.fromEntries(this.suspiciousIPs)
  }

  static clearSuspicious(ip: string): void {
    this.suspiciousIPs.delete(ip)
  }
}