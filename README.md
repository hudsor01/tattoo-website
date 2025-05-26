# Tattoo Studio Website

Professional tattoo artist website with booking system and portfolio management.

## Features

- Portfolio gallery with admin management
- Integrated booking system via Cal.com
- Customer management dashboard
- Email automation and notifications
- Payment processing integration
- Mobile-responsive design

## Tech Stack

- Next.js 15 with TypeScript
- Prisma + Supabase database
- Clerk authentication
- Tailwind CSS styling
- tRPC for type-safe APIs

## Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Initialize database
npm run prisma:generate
npm run prisma:migrate

# Start development server
npm run dev
```

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
npm run type-check   # TypeScript checking
```

## Environment Setup

Required environment variables in `.env.local`:

- Database connection (Supabase)
- Clerk authentication keys
- Cal.com integration settings
- Email service configuration
- File storage settings

## Deployment

Deploy to Vercel:

```bash
npx vercel --prod
```

Configure environment variables in Vercel dashboard before deployment.