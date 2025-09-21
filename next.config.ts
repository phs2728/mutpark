import type { NextConfig } from "next";

// Extend NextConfig typing to allow turbopack.root until types catch up
const nextConfig: NextConfig & { turbopack?: { root?: string } } = {
  // Force correct workspace root for Turbopack to avoid lockfile mis-detection
  turbopack: {
    root: __dirname,
  },
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.mutpark.com",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      "@heroicons/react",
      "lucide-react",
    ],
  },

  // Compression
  compress: true,

  // PWA and caching headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=300",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
  },

  // Bundle analyzer
  ...(process.env.ANALYZE === "true" && {
    experimental: {
      bundlePagesExternals: false,
    },
  }),
};

export default nextConfig;
