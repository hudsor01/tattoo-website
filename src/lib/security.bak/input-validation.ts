import { z } from 'zod'

// Common validation patterns
export const securityPatterns = {
  // SQL injection prevention
  noSqlInjection: /^[^';\"\\<>]*$/,
  
  // XSS prevention - basic HTML tag detection
  noHtmlTags: /^[^<>]*$/,
  
  // Script injection prevention
  noScriptTags: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  
  // Safe filename pattern
  safeFilename: /^[a-zA-Z0-9._-]+$/,
  
  // Safe URL pattern
  safeUrl: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?$/,
  
  // Safe email pattern (more restrictive)
  safeEmail: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Phone number pattern
  phoneNumber: /^\+?[1-9]\d{1,14}$/,
  
  // Alphanumeric with basic punctuation
  alphanumericSafe: /^[a-zA-Z0-9\s.,!?-]*$/,
}

// Enhanced string validation with security checks
export const secureString = (options?: {
  minLength?: number
  maxLength?: number
  allowHtml?: boolean
  pattern?: RegExp
}) => {
  const { minLength = 1, maxLength = 1000, allowHtml = false, pattern } = options || {}
  
  return z
    .string()
    .min(minLength, `Must be at least ${minLength} characters`)
    .max(maxLength, `Must be at most ${maxLength} characters`)
    .refine((val) => {
      // Check for SQL injection patterns
      if (!securityPatterns.noSqlInjection.test(val)) {
        return false
      }
      return true
    }, 'Invalid characters detected')
    .refine((val) => {
      // Check for HTML tags if not allowed
      if (!allowHtml && !securityPatterns.noHtmlTags.test(val)) {
        return false
      }
      return true
    }, 'HTML tags are not allowed')
    .refine((val) => {
      // Check for script tags
      if (securityPatterns.noScriptTags.test(val)) {
        return false
      }
      return true
    }, 'Script tags are not allowed')
    .refine((val) => {
      // Check custom pattern if provided
      if (pattern && !pattern.test(val)) {
        return false
      }
      return true
    }, 'Invalid format')
}

// Secure email validation
export const secureEmail = z
  .string()
  .email('Invalid email format')
  .refine((email) => securityPatterns.safeEmail.test(email), 'Email format not allowed')
  .transform((email) => email.toLowerCase().trim())

// Secure phone validation
export const securePhone = z
  .string()
  .refine((phone) => {
    const cleaned = phone.replace(/[\s()-]/g, '')
    return securityPatterns.phoneNumber.test(cleaned)
  }, 'Invalid phone number format')
  .transform((phone) => phone.replace(/[\s()-]/g, ''))

// Secure URL validation
export const secureUrl = z
  .string()
  .url('Invalid URL format')
  .refine((url) => securityPatterns.safeUrl.test(url), 'URL format not allowed')
  .refine((url) => {
    // Prevent javascript: and data: URLs
    const protocol = url.split(':')[0]?.toLowerCase()
    return ['http', 'https'].includes(protocol)
  }, 'Only HTTP and HTTPS URLs are allowed')

// Secure filename validation
export const secureFilename = z
  .string()
  .min(1, 'Filename is required')
  .max(255, 'Filename too long')
  .refine((filename) => securityPatterns.safeFilename.test(filename), 'Invalid filename format')
  .refine((filename) => {
    // Prevent dangerous extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js', '.jar']
    const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'))
    return !dangerousExtensions.includes(ext)
  }, 'File type not allowed')

// Sanitization functions
export const sanitize = {
  // Remove HTML tags and encode special characters
  htmlStrip: (input: string): string => {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>&"']/g, (match) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#x27;',
        }
        return entities[match] || match
      })
  },

  // Remove potentially dangerous characters
  sqlSafe: (input: string): string => {
    return input.replace(/[';\"\\]/g, '')
  },

  // Normalize whitespace and trim
  normalize: (input: string): string => {
    return input.replace(/\s+/g, ' ').trim()
  },

  // Remove all non-alphanumeric characters except specified ones
  alphanumeric: (input: string, allowed = ' .-_'): string => {
    const regex = new RegExp(`[^a-zA-Z0-9${allowed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g')
    return input.replace(regex, '')
  },
}

// Rate limiting validation
export const rateLimitValidation = z.object({
  identifier: z.string().min(1),
  action: z.string().min(1),
  timestamp: z.number(),
  count: z.number().min(0),
})

// Content Security Policy validation
export const cspValidation = z.object({
  directive: z.enum([
    'default-src',
    'script-src',
    'style-src',
    'img-src',
    'connect-src',
    'font-src',
    'object-src',
    'media-src',
    'frame-src',
  ]),
  sources: z.array(z.string()),
})

// User agent validation for security
export const userAgentValidation = z
  .string()
  .min(1)
  .max(512) // Prevent excessively long user agents
  .refine((ua) => {
    // Block known malicious user agents
    const maliciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nessus/i,
      /w3af/i,
      /dirbuster/i,
      /masscan/i,
    ]
    return !maliciousPatterns.some((pattern) => pattern.test(ua))
  }, 'Blocked user agent')

// Request validation helpers
export const validateRequest = {
  // Validate request headers for security
  headers: (headers: Record<string, string | string[] | undefined>) => {
    const schema = z.object({
      'user-agent': userAgentValidation.optional(),
      'content-type': z.string().optional(),
      'content-length': z.string().refine((val) => {
        if (!val) return true
        const num = parseInt(val, 10)
        return !isNaN(num) && num >= 0 && num <= 10485760 // 10MB limit
      }).optional(),
      referer: secureUrl.optional(),
      origin: secureUrl.optional(),
    })
    
    return schema.safeParse(headers)
  },

  // Validate query parameters
  query: (query: Record<string, string | string[] | undefined>) => {
    const schema = z.record(
      z.string(),
      z.union([
        z.string(),
        z.array(z.string()),
        z.undefined(),
      ])
    )
    
    return schema.safeParse(query)
  },

  // Validate body size
  bodySize: (contentLength: number, maxSize = 10485760) => { // 10MB default
    return z.number().min(0).max(maxSize).safeParse(contentLength)
  },
}

// Database query validation
export const dbQueryValidation = {
  // Validate table names (prevent injection)
  tableName: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid table name'),
  
  // Validate column names (prevent injection)
  columnName: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid column name'),
  
  // Validate order by direction
  orderDirection: z.enum(['asc', 'desc', 'ASC', 'DESC']),
  
  // Validate limit and offset
  limit: z.number().int().min(1).max(1000),
  offset: z.number().int().min(0),
}