# Vercel Environment Variables

Copy these into Vercel Dashboard → Project Settings → Environment Variables:

## Core App
```
NEXT_PUBLIC_APP_URL=https://ink37tattoos.com
```

## Database (Supabase)
```
DATABASE_URL=postgresql://postgres.qrcweallqlcgwiwzhqpb:fernandogovea83%21@aws-0-us-east-2.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.qrcweallqlcgwiwzhqpb:fernandogovea83%21@aws-0-us-east-2.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://qrcweallqlcgwiwzhqpb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyY3dlYWxscWxjZ3dpd3pocXBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTE3MjUsImV4cCI6MjA2MTY4NzcyNX0.lbtOc54j2PJ2BgEKtnugmAIzZODpI01NFvOgNb7dT3w
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyY3dlYWxscWxjZ3dpd3pocXBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjExMTcyNSwiZXhwIjoyMDYxNjg3NzI1fQ.4a8C6viZIjDhCAY0tG-rxn20FEcjRi5RdX4nRrdAGsA
```

## Authentication (Clerk) - WARNINGS ARE SAFE TO IGNORE
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cHJvZm91bmQtc3dpZnQtNzYuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_aND0rEHabKG3Vac7MhF71ngBb4tSG11BLKw3X9OM6v
CLERK_WEBHOOK_SECRET=whsec_T3JKlpIzZWsbb/+eDWvxgeQRFrwQTVug
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/admin
CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/admin
```

## Integrations
```
NEXT_PUBLIC_CAL_USERNAME=ink37tattoos
CAL_WEBHOOK_SECRET=cal_live_6951a9a9c72bb0a4d991e16dad6d5977
RESEND_API_KEY=re_4p2C2onz_2uzGXEHwSwrHUGyajEusLPeF
ADMIN_SETUP_KEY=tattoo-admin-setup-2024
```

## Notes:
- Set Environment: "Production, Preview, Development" for all
- Warnings for NEXT_PUBLIC_* keys are false positives - these are designed to be public
- After deployment, update Clerk dashboard authorized domains to include ink37tattoos.com