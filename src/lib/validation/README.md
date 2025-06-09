# Enhanced Input Validation System

## Overview

This enhanced validation system goes far beyond basic Zod checks to provide comprehensive, production-ready input validation with security, business logic, and user experience enhancements.

## Features

### 🔒 **Security-First Validation**
- **XSS Prevention**: Detects and blocks cross-site scripting attempts
- **SQL Injection Protection**: Identifies and prevents SQL injection patterns
- **Path Traversal Protection**: Blocks directory traversal attempts
- **Command Injection Protection**: Prevents command injection attacks
- **Input Sanitization**: Automatically sanitizes HTML and text content
- **File Upload Security**: Validates file types, sizes, and names

### 🏢 **Business Logic Validation**
- **Email Uniqueness**: Checks for duplicate email addresses
- **Appointment Scheduling**: Validates business hours and availability
- **Pricing Validation**: Ensures pricing falls within acceptable ranges
- **Service Consistency**: Validates budget/service combinations
- **Rate Limiting**: Prevents spam and abuse

### 🎯 **Real-Time User Experience**
- **Live Validation**: Real-time feedback as users type
- **Security Warnings**: Immediate alerts for potentially dangerous input
- **Progress Indicators**: Visual feedback on form completion
- **Smart Debouncing**: Optimized validation timing
- **Field-Level Feedback**: Granular validation messages

## Architecture

```
src/lib/validation/
├── enhanced-validation.ts     # Core validation system
├── README.md                 # This documentation
└── examples/                 # Usage examples

src/hooks/
├── use-enhanced-validation.ts # React hook for forms

src/components/validation/
├── ValidationFeedback.tsx    # UI feedback components

src/app/api/contact/enhanced/
├── route.ts                  # Example API endpoint
```

## Quick Start

### 1. Basic Form Validation

```typescript
import { enhancedContactFormSchema } from '@/lib/validation/enhanced-validation';
import { useEnhancedValidation } from '@/hooks/use-enhanced-validation';

function MyForm() {
  const { validateForm, handleFieldChange, getFieldState } = useEnhancedValidation(
    enhancedContactFormSchema
  );
  
  const handleSubmit = async (data: any) => {
    const result = await validateForm(data);
    if (result.success) {
      // Submit form
    }
  };
}
```

### 2. API Route Protection

```typescript
import { createEnhancedApiRoute, enhancedContactFormSchema } from '@/lib/validation/enhanced-validation';

export const POST = createEnhancedApiRoute(
  enhancedContactFormSchema,
  async (data, req) => {
    // Your API logic here
    return NextResponse.json({ success: true });
  },
  {
    rateLimit: { max: 5, windowMs: 15 * 60 * 1000 },
    requireCsrf: true,
  }
);
```

### 3. Custom Security Validation

```typescript
import { SecurityValidator } from '@/lib/validation/enhanced-validation';

const userInput = "Some user input";
const security = SecurityValidator.isSecureInput(userInput);

if (!security.safe) {
  console.log('Security threats:', security.threats);
}

const sanitized = SecurityValidator.sanitizeText(userInput);
```

## Validation Schemas

### Enhanced Contact Form
```typescript
const enhancedContactFormSchema = z.object({
  name: createSecureString({
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'.-]+$/,
  }),
  email: createSecureEmail(),
  message: createSecureString({
    minLength: 10,
    maxLength: 2000,
    allowHtml: false,
  }),
  agreeToTerms: z.boolean().refine(val => val === true),
  honeypot: z.string().max(0), // Anti-spam
});
```

### File Upload Validation
```typescript
const enhancedGalleryUploadSchema = z.object({
  file: createFileValidator({
    requireImage: true,
    maxSize: 10 * 1024 * 1024, // 10MB
  }),
  title: createSecureString({
    minLength: 3,
    maxLength: 100,
  }),
});
```

### Admin User Creation
```typescript
const enhancedAdminUserSchema = z.object({
  email: createSecureEmail()
    .refine(async (email) => !(await BusinessValidator.emailExists(email))),
  password: z.string()
    .min(12)
    .refine(password => SECURITY_PATTERNS.STRONG_PASSWORD.test(password)),
});
```

## Security Features

### XSS Prevention
```typescript
// Automatically detects patterns like:
"<script>alert('xss')</script>"
"javascript:alert(1)"
"onload=alert(1)"
```

### SQL Injection Protection
```typescript
// Blocks patterns like:
"'; DROP TABLE users; --"
"1' OR '1'='1"
"UNION SELECT * FROM passwords"
```

### File Upload Security
```typescript
// Validates:
- File extensions (.exe, .bat, .php blocked)
- MIME types (only allowed types)
- File size limits
- Filename safety
```

## Business Logic Examples

### Appointment Validation
```typescript
BusinessValidator.validateAppointmentTime(dateTime)
// Checks:
// - Future date only
// - Business hours (9 AM - 8 PM)
// - Business days (Mon-Sat)
```

### Pricing Validation
```typescript
BusinessValidator.validatePricing(amount)
// Ensures:
// - Minimum $50
// - Maximum $5000
// - Reasonable for service type
```

### Email Uniqueness
```typescript
await BusinessValidator.emailExists(email)
// Checks database for existing email
```

## React Components

### Validation Feedback
```typescript
import { ValidationFeedback } from '@/components/validation/ValidationFeedback';

<ValidationFeedback
  fieldName="email"
  errors={['Invalid email format']}
  warnings={['Email already registered']}
  securityThreats={['XSS']}
  isValid={false}
  isTouched={true}
/>
```

### Field Status Indicator
```typescript
import { FieldStatusIndicator } from '@/components/validation/ValidationFeedback';

<FieldStatusIndicator
  isValid={true}
  hasErrors={false}
  hasWarnings={false}
  hasSecurityThreats={false}
  isValidating={false}
/>
```

## API Integration

### Enhanced API Route Options
```typescript
createEnhancedApiRoute(schema, handler, {
  requireAuth: boolean,        // Require authentication
  requireAdmin: boolean,       // Require admin role
  rateLimit: {                // Rate limiting config
    max: number,
    windowMs: number,
  },
  requireCsrf: boolean,        // CSRF protection
})
```

### Rate Limiting
- **Contact Form**: 5 submissions per 15 minutes
- **File Upload**: 10 uploads per hour
- **Admin Actions**: 100 requests per hour

### Response Format
```typescript
// Success
{
  success: true,
  data: ValidatedData,
  message?: string
}

// Validation Error
{
  success: false,
  error: "Validation failed",
  details: [
    {
      field: "email",
      message: "Invalid email format",
      code: "invalid_string"
    }
  ]
}

// Security Error
{
  success: false,
  error: "Security threat detected",
  threats: ["XSS", "SQL_INJECTION"]
}
```

## Performance Considerations

### Debouncing
- **Default**: 300ms debounce for real-time validation
- **Configurable**: Adjust per form requirements
- **Smart**: Only validates changed fields

### Caching
- **Email Validation**: Cache results for 5 minutes
- **Business Rules**: Cache validation results
- **Security Checks**: In-memory pattern matching

### Optimization
- **Lazy Loading**: Validation runs only when needed
- **Selective Validation**: Field-level validation
- **Batch Processing**: Multiple validations in single pass

## Testing

### Security Testing
```bash
# Test XSS prevention
curl -X POST /api/contact/enhanced \
  -d '{"message": "<script>alert(1)</script>"}'

# Test SQL injection prevention  
curl -X POST /api/contact/enhanced \
  -d '{"email": "test@test.com'; DROP TABLE users; --"}'
```

### Rate Limiting Testing
```bash
# Test rate limits
for i in {1..10}; do
  curl -X POST /api/contact/enhanced -d '{"email":"test@test.com"}'
done
```

## Migration Guide

### From Basic Zod
```typescript
// Before
const basicSchema = z.object({
  email: z.string().email(),
  message: z.string().min(1),
});

// After
const enhancedSchema = z.object({
  email: createSecureEmail(),
  message: createSecureString({
    minLength: 10,
    maxLength: 2000,
    allowHtml: false,
  }),
});
```

### Updating Existing Forms
1. Replace basic schemas with enhanced versions
2. Add validation feedback components
3. Update API routes to use enhanced middleware
4. Test security and business logic validation

## Best Practices

### 1. Security
- Always use enhanced schemas for user input
- Enable real-time security warnings
- Log security threats for monitoring
- Sanitize data before database storage

### 2. User Experience
- Provide immediate feedback on dangerous input
- Use progress indicators for long forms
- Group related validation messages
- Show success states for valid fields

### 3. Performance
- Use appropriate debounce timing
- Cache validation results when possible
- Validate only dirty fields
- Implement proper loading states

### 4. Business Logic
- Validate data consistency
- Check business constraints
- Prevent duplicate submissions
- Implement proper rate limiting

## Troubleshooting

### Common Issues

**Q: Validation is too slow**
A: Adjust debounce timing or disable real-time validation for complex forms

**Q: False positive security warnings**
A: Review security patterns and add exceptions for legitimate use cases

**Q: Rate limiting too strict**
A: Adjust limits based on actual usage patterns

**Q: Business validation failing**
A: Check database connectivity and business rule logic

### Debug Mode
```typescript
const validation = useEnhancedValidation(schema, {
  enableRealTimeValidation: true,
  showSecurityWarnings: true,
  debugMode: true, // Enables detailed logging
});
```

## Dependencies

- `zod`: Schema validation
- `isomorphic-dompurify`: HTML sanitization
- `validator`: Advanced string validation
- `@types/validator`: TypeScript types

## Contributing

When adding new validation rules:

1. Add security patterns to `SECURITY_PATTERNS`
2. Create reusable validators in `enhanced-validation.ts`
3. Add corresponding React components
4. Update documentation and examples
5. Add comprehensive tests

## License

Part of the Ink 37 Tattoos application. See main LICENSE file.