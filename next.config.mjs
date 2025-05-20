/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const withBundleAnalyzer = process.env.ANALYZE === 'true' 
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const nextConfig = {
  // Expose environment variables to the client
  env: {
    NEXT_PUBLIC_CAL_USERNAME: process.env.NEXT_PUBLIC_CAL_USERNAME,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000',
  },
  reactStrictMode: true,
  experimental: {
    optimizeCss: false,
    optimisticClientCache: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    // Disable TypeScript checks during builds to avoid frequent issues
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
  serverExternalPackages: [
    'zod', 
    '@trpc/server', 
    '@trpc/next', 
    'winston', 
    'superjson', 
    'stripe',
    '@prisma/client',
    '@calcom/embed-react'
  ],
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/supabase/:path*',
        destination: 'https://qrcweallqlcgwiwzhqpb.supabase.co/:path*',
      },
      {
        source: '/api/webhooks/stripe',
        destination: '/api/webhooks/stripe',
        has: [
          {
            type: 'header',
            key: 'stripe-signature',
          },
        ],
      },
      // Add Cal.com webhook handling
      {
        source: '/api/webhooks/cal',
        destination: '/api/booking',
        has: [
          {
            type: 'header',
            key: 'X-Cal-Signature-256',
          },
        ],
      },
    ]
  }
}

export default withBundleAnalyzer(nextConfig);