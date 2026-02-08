import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Static export for Capacitor (mobile builds)
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,
  distDir: process.env.CAPACITOR_BUILD === 'true' ? 'out' : '.next',

  // Performance optimizations
  experimental: {
    // Tree-shake icon libraries and animation libraries
    optimizePackageImports: ['lucide-react', 'framer-motion', '@clerk/nextjs'],
  },
  compiler: {
    // Remove console.log in production for cleaner output
    removeConsole: process.env.NODE_ENV === 'production',
  },

  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  trailingSlash: false,
  skipProxyUrlNormalize: true,
  images: {
    // Unoptimized for static export (Capacitor requirement)
    unoptimized: process.env.CAPACITOR_BUILD === 'true',
    formats: ['image/avif', 'image/webp'],
    // Device sizes optimized for common breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  compress: true,
  poweredByHeader: false,
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    if (config.output) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
    }
    return config;
  },
};

export default nextConfig;
