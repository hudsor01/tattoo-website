# Tattoo Website - Professional Booking & Portfolio Platform

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue) ![Prisma](https://img.shields.io/badge/Prisma-6.8.2-purple)

## 🎨 Overview

A modern, professional tattoo artist website featuring integrated booking, portfolio management, and customer relationship tools. Built with Next.js and TypeScript for maximum performance and type safety.

### ✨ Key Features

- **🗓️ Integrated Booking System** - Cal.com integration with payment processing
- **🖼️ Portfolio Gallery** - Dynamic gallery with admin management
- **💳 Payment Processing** - Stripe integration for deposits and payments
- **👥 Customer Management** - Admin dashboard for client tracking
- **📧 Email Automation** - Automated booking confirmations and reminders
- **📱 Responsive Design** - Mobile-first, optimized for all devices
- **🔐 Authentication** - Clerk-powered auth with role-based access
- **⚡ Performance** - Server-side rendering and optimized assets

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 15.3.2](https://nextjs.org/)** - App Router with SSR/SSG
- **[TypeScript 5.8.3](https://www.typescriptlang.org/)** - Strict type checking enabled
- **[React 19.1.0](https://react.dev/)** - Latest stable version

### Database & Backend
- **[Prisma 6.8.2](https://www.prisma.io/)** - Type-safe database client
- **[Supabase](https://supabase.com/)** - PostgreSQL database hosting
- **[tRPC 11.1.2](https://trpc.io/)** - End-to-end typesafe APIs
- **[Zod 3.25.28](https://zod.dev/)** - Runtime type validation

### Styling & UI
- **[Tailwind CSS 4.1.7](https://tailwindcss.com/)** - Utility-first CSS
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations

### Authentication & Payments
- **[Clerk](https://clerk.com/)** - Complete authentication solution
- **[Stripe](https://stripe.com/)** - Payment processing via Cal.com
- **[Cal.com](https://cal.com/)** - Professional booking system

### Developer Experience
- **[ESLint](https://eslint.org/)** - Strict linting rules
- **[Prettier](https://prettier.io/)** - Consistent code formatting
- **[TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)** - Maximum type safety

## 🚀 Getting Started

### Prerequisites

- **Node.js 22+** - [Download here](https://nodejs.org/)
- **npm or yarn** - Package manager
- **Git** - Version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/tattoo-website.git
   cd tattoo-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables** (see [Environment Setup](#environment-variables))

5. **Initialize database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

### Database
```bash
DATABASE_URL=\"postgresql://username:password@hostname:port/database\"
DIRECT_URL=\"postgresql://username:password@hostname:port/database\"
```

### Authentication (Clerk)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=\"pk_test_...\"
CLERK_SECRET_KEY=\"sk_test_...\"
NEXT_PUBLIC_CLERK_SIGN_IN_URL=\"/sign-in\"
NEXT_PUBLIC_CLERK_SIGN_UP_URL=\"/sign-up\"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=\"/admin\"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=\"/admin\"
```

### Cal.com Integration
```bash
NEXT_PUBLIC_CAL_USERNAME=\"your-cal-username\"
CAL_WEBHOOK_SECRET=\"your-webhook-secret\"
```

### Email Service (Resend)
```bash
RESEND_API_KEY=\"re_...\"
ARTIST_EMAIL=\"artist@example.com\"
```

### File Storage (Supabase)
```bash
NEXT_PUBLIC_SUPABASE_URL=\"https://your-project.supabase.co\"
NEXT_PUBLIC_SUPABASE_ANON_KEY=\"eyJ...\"
SUPABASE_SERVICE_ROLE_KEY=\"eyJ...\"
```

### Analytics (Optional)
```bash
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=\"your-analytics-id\"
```

## 📁 Project Structure

```plaintext
src/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Admin dashboard routes
│   │   ├── admin/
│   │   │   ├── appointments/     # Appointment management
│   │   │   ├── bookings/         # Booking management
│   │   │   ├── customers/        # Customer management
│   │   │   ├── gallery/          # Portfolio management
│   │   │   ├── payments/         # Payment tracking
│   │   │   └── settings/         # Admin settings
│   │   └── layout.tsx            # Admin layout wrapper
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin API endpoints
│   │   ├── cal/                  # Cal.com webhook handlers
│   │   ├── trpc/                 # tRPC API router
│   │   └── upload/               # File upload endpoints
│   ├── about/                    # About page
│   ├── booking/                  # Booking interface
│   ├── contact/                  # Contact page
│   ├── faq/                      # FAQ page  
│   ├── gallery/                  # Public portfolio
│   ├── services/                 # Services page
│   ├── sign-in/                  # Authentication
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── providers.tsx             # App providers
├── components/                   # Reusable components
│   ├── admin/                    # Admin-specific components
│   ├── blocks/                   # Content blocks
│   ├── gallery/                  # Gallery components
│   ├── navigation/               # Navigation components
│   └── ui/                       # Base UI components (Radix)
├── lib/                          # Utilities and configurations
│   ├── db/                       # Database utilities
│   ├── email/                    # Email services
│   ├── supabase/                 # Supabase client
│   ├── trpc/                     # tRPC setup
│   └── validations/              # Zod schemas
├── types/                        # TypeScript type definitions
└── styles/                       # Additional stylesheets
```

## 🎯 Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run build            # Production build with quality checks
npm run build:production # Build with comprehensive checks
npm run start            # Start production server
npm run preview          # Build and preview locally
```

### Code Quality
```bash
npm run lint             # Run ESLint (strict, max 0 warnings)
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run quality-check    # Run all quality checks
```

### Database
```bash
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:reset     # Reset database (development)
npm run prisma:seed      # Seed database with test data
```

## 🗓️ Cal.com Integration

### Booking System Setup

1. **Create Cal.com Account**
   - Sign up at [cal.com](https://cal.com)
   - Configure event types for tattoo services

2. **Configure Event Types**
   ```plaintext
   Tattoo Consultation (30 min)
   - Deposit: $50
   - Payment: Hold payment
   - Custom fields: Tattoo type, size, placement, description

   Tattoo Session (3 hours)
   - Deposit: $200
   - Payment: Hold payment
   - Custom fields: Design details, previous work
   ```

3. **Set Up Webhooks**
   - Webhook URL: `https://yourdomain.com/api/cal/webhook`
   - Events: booking.created, booking.cancelled, booking.rescheduled
   - Copy webhook secret to environment variables

4. **Payment Configuration**
   - Connect Stripe account in Cal.com dashboard
   - Configure deposit amounts and payment types
   - Test with Stripe test mode before going live

### Webhook Processing

The application automatically processes Cal.com webhooks to:
- Create booking records in database
- Send confirmation emails
- Update payment status
- Sync with admin dashboard

## 🎨 Gallery Management

### Admin Features
- **Upload Management** - Drag & drop image uploads
- **Approval System** - Review and approve designs
- **Categorization** - Organize by tattoo style and size
- **SEO Optimization** - Meta tags and image optimization

### Public Gallery
- **Responsive Grid** - Masonry layout for optimal viewing
- **Advanced Filtering** - Filter by style, size, and approval status  
- **Lightbox View** - Full-screen image viewing
- **Social Sharing** - Share designs on social platforms

## 🔐 Authentication & Authorization

### Role-Based Access Control
- **Public Users** - View gallery, book appointments, contact
- **Authenticated Users** - Access booking history, profile management
- **Admin Users** - Full dashboard access, content management

### Security Features
- **Clerk Integration** - Enterprise-grade authentication
- **Protected Routes** - Middleware-based route protection
- **Role Verification** - Server-side permission checking
- **Session Management** - Automatic session handling

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

2. **Configure Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Ensure database URLs point to production database
   - Configure custom domain if needed

3. **Database Setup**
   ```bash
   # Run migrations on production database
   npm run prisma:migrate
   ```

### Performance Optimizations
- **Static Generation** - Pre-generated pages for optimal performance
- **Image Optimization** - Next.js Image component with WebP/AVIF
- **Code Splitting** - Automatic bundle optimization
- **CDN Delivery** - Global asset distribution via Vercel

## 📊 Admin Dashboard

### Key Features
- **📈 Analytics Dashboard** - Booking metrics and revenue tracking
- **📅 Appointment Management** - Schedule and manage appointments
- **💰 Payment Tracking** - Monitor deposits and payments
- **👥 Customer Database** - Client information and history
- **🖼️ Gallery Management** - Upload and organize portfolio
- **⚙️ Settings Panel** - Configure application settings

### Dashboard Components
- **Real-time Updates** - Live booking notifications
- **Data Visualization** - Charts and metrics
- **Bulk Operations** - Manage multiple records
- **Export Functionality** - Export data for reporting
- **Mobile Responsive** - Full admin access on mobile

## 🔧 Development Guidelines

### Code Quality Standards
- **TypeScript Strict Mode** - All files must pass type checking
- **ESLint Rules** - Zero warnings policy in production
- **Prettier Formatting** - Consistent code style
- **Import Organization** - Proper import/export patterns

### Component Architecture
- **Reusable Components** - Maximum code reuse
- **TypeScript Props** - Strongly typed component interfaces  
- **Error Boundaries** - Graceful error handling
- **Accessibility** - WCAG 2.1 compliance

### Performance Best Practices
- **Server Components** - Use RSC where possible
- **Client Components** - Minimize client-side JavaScript
- **Image Optimization** - Proper sizing and formats
- **Bundle Analysis** - Regular bundle size monitoring

## 🐛 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear build cache
rm -rf .next
npm run build
```

**Database Connection Issues**
```bash
# Reset Prisma client
npx prisma generate
npx prisma db push
```

**Authentication Problems**
- Verify Clerk environment variables
- Check webhook URLs and secrets
- Confirm role assignments

**Cal.com Integration Issues**
- Verify webhook secret matches
- Check Cal.com dashboard for webhook logs
- Test with ngrok for local development

### Getting Help

1. **Check Console Logs** - Browser and server logs
2. **Review Environment Variables** - Ensure all required vars are set
3. **Database Status** - Verify database connectivity
4. **API Endpoint Testing** - Use tools like Postman or curl

## 📚 Documentation History

This README consolidates documentation from several specialized guides:

### Previous Documentation
- **Cal.com Integration Guide** - Complete setup and configuration
- **Sidebar Overlap Solution** - Layout architecture fixes
- **Cleanup Summary** - Codebase optimization (93 files removed, 24% reduction)
- **TypeScript Refactoring** - Type safety improvements
- **Payment Setup Guide** - Stripe and Cal.com payment integration

### Major Refactoring Efforts
1. **Component Cleanup** (67 files removed)
   - Removed duplicate authentication, booking, and UI components
   - Consolidated payment and gallery components
   - Eliminated unused hooks and utilities

2. **Library Cleanup** (26 files removed)
   - Unified email, API, and database systems
   - Streamlined tRPC configuration
   - Consolidated validation and utility systems

3. **TypeScript Centralization**
   - Moved inline types to centralized type definitions
   - Implemented generic types for improved reusability
   - Enhanced type safety across admin dashboard and gallery components

4. **Testing Infrastructure Removal**
   - Removed Playwright, Vitest, and Jest configurations
   - Eliminated testing packages for leaner production bundle
   - Focused on production-ready deployment optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow
- Follow the established code quality standards
- Run `npm run quality-check` before committing
- Ensure all TypeScript checks pass
- Update documentation for new features

## 📞 Support

For support and questions:
- **Technical Issues**: Open a GitHub issue
- **Business Inquiries**: Contact via the website form
- **Integration Help**: Check the Cal.com and Stripe documentation

---

**Built with ❤️ for professional tattoo artists**

*This project represents a complete, production-ready solution for tattoo artists looking to establish a professional online presence with integrated booking and portfolio management.*