/** @type {import('next').NextConfig} */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const withBundleAnalyzer = process.env.ANALYZE === 'true' 
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const nextConfig = {
  reactStrictMode: true,
  
  // Enable source maps for debugging
  productionBrowserSourceMaps: true,
  
  
  experimental: {
    optimizeCss: false,
    optimisticClientCache: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Webpack configuration for better debugging
  webpack: (config, { dev }) => {
    // Disable minification in development to prevent env var corruption
    if (dev) {
      config.optimization.minimize = false
    }
    
    return config
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