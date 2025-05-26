/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Performance optimizations
  experimental: {
    optimisticClientCache: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: ['lucide-react'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Build configuration - enable checks for production
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint during builds
  },
  
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking during builds
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Environment-specific optimizations
  env: {
    BUILD_TIME: new Date().toISOString(),
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Improve caching strategy
    if (config.cache && config.cache.type === 'filesystem') {
      // Optimize cache serialization
      config.cache.compression = 'gzip';
    }

    if (!dev && !isServer) {
      // Production client-side optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 200000, // Split large chunks
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            enforce: true,
            maxSize: 150000,
          },
          trpc: {
            test: /[\\/]node_modules[\\/]@trpc[\\/]/,
            name: 'trpc',
            priority: 20,
            enforce: true,
            maxSize: 100000,
          },
        },
      };
    }
    
    return config;
  },

  // Output configuration for deployment
  output: 'standalone',
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/admin-dashboard/:path*',
        destination: '/admin/:path*',
        permanent: true,
      },
    ];
  },
}

export default nextConfig;