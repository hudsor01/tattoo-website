# Deployment Environment Variables

## Required for Vercel Deployment

### Core Application
```bash
NEXT_PUBLIC_APP_URL=https://ink37tattoos.com
NEXT_PUBLIC_BASE_URL=https://ink37tattoos.com
NEXT_PUBLIC_SITE_URL=https://ink37tattoos.com
```

### Database (Supabase)
```bash
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]?schema=public
DIRECT_URL=postgresql://[username]:[password]@[host]:[port]/[database]?schema=public
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Authentication (Clerk)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin
CLERK_WEBHOOK_SECRET=whsec_...
```

### Cal.com Integration
```bash
NEXT_PUBLIC_CAL_USERNAME=your-cal-username
CAL_API_KEY=cal_live_...
CAL_WEBHOOK_SECRET=your-webhook-secret
```

### Email (Resend)
```bash
RESEND_API_KEY=re_...
ADMIN_EMAIL=hello@ink37tattoos.com
ARTIST_EMAIL=hello@ink37tattoos.com
```

### Optional Analytics
```bash
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

## Security Notes

- ✅ All sensitive keys (SECRET, API_KEY) are server-side only
- ✅ Only NEXT_PUBLIC_* variables are exposed to client
- ✅ No secrets in client-side code
- ✅ Rate limiting protects sensitive endpoints
- ✅ Security headers prevent common attacks

## Vercel Setup

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all the above variables (except NEXT_PUBLIC_* can be added to .env.local for development)

## GitHub Secrets

NO secrets should be added to GitHub repository. All environment variables should be set in:
- Vercel dashboard for production
- Local .env files for development (never commit these)