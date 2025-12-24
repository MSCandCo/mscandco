const { withSentryConfig } = require('@sentry/nextjs')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Enable gzip compression
  compress: true,

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Remove console.logs in production
  },

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
      },
      {
        protocol: "https",
        hostname: "dev-dashboard.mscandco.com",
      },
      {
        protocol: "https",
        hostname: "mscandco.com",
      },
      {
        protocol: "https",
        hostname: "fzqpoayhdisusgrotyfg.supabase.co",
      },
    ],
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Webpack configuration to handle Supabase client build-time issues
  webpack: (config, { isServer }) => {
    // Externalize @supabase/ssr for client-side to prevent build-time evaluation
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Prevent webpack from bundling @supabase/ssr at build time
        '@supabase/ssr': false,
      }
    }
    return config
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      '@headlessui/react',
      '@heroicons/react',
      'recharts',
      'chart.js',
      'react-chartjs-2',
    ],
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize for production
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },

}

// Sentry options
const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  
  // These options are passed to Sentry via the wrapper
  hideSourceMaps: true,
  widenClientFileUpload: true,
}

// Wrap config with Bundle Analyzer and Sentry
let config = withBundleAnalyzer(nextConfig)

// Apply Sentry only if environment variables are set
if (process.env.SENTRY_ORG && process.env.SENTRY_AUTH_TOKEN) {
  config = withSentryConfig(config, sentryWebpackPluginOptions)
}

module.exports = config
