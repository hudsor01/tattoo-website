# Vercel Environment Variables Template

Copy these variable NAMES into Vercel Dashboard → Project Settings → Environment Variables:

## Core App
```
NEXT_PUBLIC_APP_URL=https://ink37tattoos.com
```

## Database (Supabase)
```
DATABASE_URL=[your database connection string]
DIRECT_URL=[your direct database connection]
NEXT_PUBLIC_SUPABASE_URL=[your supabase project url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your supabase anon key]
SUPABASE_SERVICE_ROLE_KEY=[your supabase service role key]
```

## Authentication (Clerk)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[your clerk publishable key]
CLERK_SECRET_KEY=[your clerk secret key]
CLERK_WEBHOOK_SECRET=[your clerk webhook secret]
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/admin
CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/admin
```

## Integrations
```
NEXT_PUBLIC_CAL_USERNAME=ink37tattoos
CAL_WEBHOOK_SECRET=[your cal.com webhook secret]
RESEND_API_KEY=[your resend api key]
ADMIN_SETUP_KEY=[your admin setup key]
```

## Instructions:
1. Get actual values from your .env file
2. Set Environment: "Production, Preview, Development" for all variables
3. Never commit actual keys to Git - use this template only