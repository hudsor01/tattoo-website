# Authentication System Guide

## Overview

Complete authentication system using Better Auth with Google OAuth, role-based access control, and production-ready security features.

## Quick Start

### 1. Environment Variables
Add to your `.env.local`:

```bash
# Generate with: openssl rand -hex 32
BETTER_AUTH_SECRET=your-generated-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Google OAuth Setup

#### Go to Google Cloud Console
Visit: https://console.cloud.google.com/

#### Configure OAuth Settings
1. Select your project (or create one)
2. Go to "APIs & Services" → "Credentials"
3. Click "Create Credentials" → "OAuth 2.0 Client IDs"
4. Choose "Web application"

#### Set Authorized Redirect URIs
Add these **exact** URIs:

**For Development:**
```
http://localhost:3000/api/auth/callback/google
```

**For Production:**
```
https://ink37tattoos.com/api/auth/callback/google
https://www.ink37tattoos.com/api/auth/callback/google
```

#### Set Authorized JavaScript Origins
**For Development:**
```
http://localhost:3000
```

**For Production:**
```
https://ink37tattoos.com
https://www.ink37tattoos.com
```

### 3. Database Setup
The Better Auth tables are already in your Prisma schema. Run:

```bash
npx prisma db push
npx prisma generate
```

### 4. Test Authentication
Visit `http://localhost:3000/auth` and sign up with either:
- `fennyg83@gmail.com` (auto-admin)
- `ink37tattoos@gmail.com` (auto-admin)

## Usage in Components

```tsx
import { useUser, useIsAdmin, AdminGuard } from '@/lib/auth-client';

function MyComponent() {
  const { user, isSignedIn } = useUser();
  const isAdmin = useIsAdmin();
  
  return (
    <AdminGuard>
      <div>Admin only content</div>
    </AdminGuard>
  );
}
```

## Key Files

- **Server Auth**: `src/lib/auth.ts`
- **Client Auth**: `src/lib/auth-client.ts`
- **Auth Form**: `src/components/auth/AuthForm.tsx`
- **User Menu**: `src/components/auth/UserMenu.tsx`
- **API Routes**: `src/app/api/auth/[...all]/route.ts`
- **Auth Pages**: `src/app/auth/page.tsx`
- **Middleware**: `middleware.ts`

## Admin System

### Auto Admin Assignment
Users signing up with these emails automatically get admin role:
- `fennyg83@gmail.com`
- `ink37tattoos@gmail.com`

To add more admin emails, edit the `ADMIN_EMAILS` array in `src/lib/auth.ts`.

### Admin Features
- User management (create, list, manage users)
- Role assignment (user, artist, admin, superadmin)
- User ban/unban with reasons and expiration
- Session management and revocation
- User impersonation (superadmin only)
- User deletion (superadmin only)
- Enhanced security with operation auditing

### Permission System
```typescript
const permissions = useAdminPermissions();
// Returns: { canCreateUsers, canBanUsers, canViewAllUsers, etc. }
```

## Architecture & Implementation

### Rendering Strategy: SSR with Client-Side Auth
- **Rationale**: Better TTFB for public pages, smooth auth transitions
- **Trade-off**: Slight complexity vs. optimal user experience

### Stability Patterns
```typescript
// Stable primitive dependencies to prevent re-renders
useMemo(() => ({ user, isAdmin }), [
  sessionRef.current.userId,
  sessionRef.current.userRole,
  isPending,
  error
]);
```

### Better Auth Integration
```typescript
// Proper Better Auth client method usage
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/admin",
});
```

### Hydration Safety
```typescript
// Mounting check to prevent hydration issues
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted || isLoading) {
  return <SimpleLoader />;
}
```

## Security Features

### Multi-Layer Protection
1. **Admin Role Verification**: Multiple layers (middleware + component)
2. **Session Validation**: Server-side validation with Better Auth
3. **CSRF Protection**: Built into Better Auth
4. **Secure Cookies**: Handled by Better Auth configuration
5. **Rate Limiting**: Custom rules for auth operations
6. **Impersonation Logging**: Audit trail for admin operations

### Error Boundaries
- **Component Level**: Granular error handling
- **Page Level**: Fallback for critical failures
- **Global Level**: Application-wide safety net

## Database Schema

### Better Auth Tables
- `user` - User accounts and profiles
- `session` - Active user sessions
- `account` - OAuth account linking
- `verification` - Email verification tokens

### Business Logic Integration
- Clean separation of auth and business logic
- Foreign key relationships to auth tables
- Role-based data access patterns

## Common Issues & Solutions

### Issue: "redirect_uri_mismatch" Error
**Problem**: Google OAuth redirect URI not configured correctly
**Solution**: Add exact URIs to Google Cloud Console OAuth settings

### Issue: Infinite Re-render Loop
**Problem**: Unstable dependencies in authentication hooks
**Solution**: Use stable primitive dependencies and proper memoization

### Issue: Hydration Mismatches
**Problem**: SSR/client rendering differences
**Solution**: Use mounting checks and proper client components

### Issue: Admin Dashboard Authentication
**Problem**: Hardcoded user data instead of actual authentication
**Solution**: Implement proper authentication flow with Better Auth

## Testing

### Debug Tools
- **Auth Debug Endpoint**: `/api/debug/auth` - Check session status
- **Console Logging**: Better Auth client debug information
- **Prisma Studio**: `npx prisma studio` - View database state

### Testing Checklist
1. Visit `/auth` to test email/password login
2. Test Google OAuth login flow
3. Verify session persistence across page reloads
4. Test admin dashboard access with admin users
5. Verify unauthorized access is properly blocked
6. Check role-based permissions work correctly

### Test Script
```bash
# Run comprehensive auth tests
./test-auth.sh
```

## Performance Optimizations

1. **Eliminated Infinite Renders**: Reduced CPU usage significantly
2. **Simplified Components**: Faster initial load times
3. **Proper Memoization**: Reduced unnecessary re-calculations
4. **Session Caching**: Improved authentication performance
5. **Database Connection Pooling**: Better scalability

## Migration & Deployment

### Migration from Other Auth Systems
If migrating from Clerk or other auth providers:
1. Export existing user data
2. Update environment variables
3. Run database migrations
4. Update component imports
5. Test authentication flows thoroughly

### Production Deployment
1. Set `BETTER_AUTH_URL` to your production domain
2. Update Google OAuth authorized domains
3. Use secure database connection strings
4. Generate new `BETTER_AUTH_SECRET` for production
5. Configure security headers in production environment

### Environment Variables for Production
```bash
BETTER_AUTH_SECRET=production-secret-32-chars
BETTER_AUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=production-client-id
GOOGLE_CLIENT_SECRET=production-client-secret
DATABASE_URL=production-database-url
```

## Rollback Plan

If you need to rollback:
```bash
# Restore backup files
mv src/lib/auth-backup.ts src/lib/auth.ts
mv src/lib/auth-client-backup.ts src/lib/auth-client.ts
mv src/types/auth-types-backup.ts src/types/auth-types.ts
mv prisma/schema-backup.prisma prisma/schema.prisma

# Regenerate client
npx prisma generate
```

## Support & Resources

The Better Auth implementation follows official best practices:
- ✅ All required tables and fields
- ✅ Admin plugin with full feature set  
- ✅ Proper session management
- ✅ Security best practices
- ✅ TypeScript integration
- ✅ Production-ready configuration

**Documentation References:**
- [Better Auth Documentation](https://better-auth.com/docs)
- [Better Auth Admin Plugin](https://better-auth.com/docs/plugins/admin)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)

The authentication system is now production-ready with comprehensive features for user management, security, and scalability! 🎉