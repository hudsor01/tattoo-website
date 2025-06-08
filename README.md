# Tattoo Studio Website

Professional tattoo artist website with booking system and portfolio management.

## Features

- Portfolio gallery with admin management
- Integrated booking system via Cal.com
- Customer management dashboard
- Email automation and notifications
- Payment processing integration
- Mobile-responsive design
- Role-based authentication system

## Tech Stack

- Next.js 15 with TypeScript
- Prisma + PostgreSQL database
- Better Auth authentication
- Tailwind CSS styling
- tRPC for type-safe APIs

## Quick Start

1. Clone the repository
2. Run `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in your environment variables
4. Run `npx prisma db push` to set up the database
5. Run `npm run dev` to start the development server

## Authentication

This application uses Better Auth with email/password and Google OAuth for authentication. 

### Admin Access
Users with these emails automatically get admin privileges:
- `fennyg83@gmail.com`
- `ink37tattoos@gmail.com`

### Environment Variables
```bash
# Generate with: openssl rand -hex 32
BETTER_AUTH_SECRET=your-generated-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Usage
Visit `/auth` to sign in. Admin users can access `/admin` routes.

See `AUTH_SETUP.md` for detailed setup instructions.

## Development

```bash
npm run dev         # Start development server
npm run type-check  # Check TypeScript types
npm run lint        # Run ESLint
npm run build       # Build for production
```

## Deployment

1. Set environment variables in your deployment platform
2. Configure Google OAuth authorized domains
3. Update `BETTER_AUTH_URL` to production domain
4. Deploy with your preferred platform (Vercel recommended)

## Authentication System

✅ **Production Ready Features:**
- Email/password authentication
- Google OAuth integration  
- Role-based access control
- Session management
- Route protection
- TypeScript integration
- Automatic admin role assignment
