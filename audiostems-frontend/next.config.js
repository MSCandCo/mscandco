/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

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
    ],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'], // Optimize large package imports
  },
};

module.exports = nextConfig;
