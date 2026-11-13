import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Immutable cache for versioned static files under `public/` (bump filenames when replacing assets). */
const STATIC_MEDIA_CACHE_HEADER = {
  key: "Cache-Control",
  value: "public, max-age=31536000, immutable",
} as const;

const STATIC_MEDIA_PATHS = ["/media/:path*", "/assets/:path*", "/logo/:path*", "/icons/:path*"];

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  async headers() {
    return STATIC_MEDIA_PATHS.map((source) => ({
      source,
      headers: [STATIC_MEDIA_CACHE_HEADER],
    }));
  },

  async redirects() {
    return [
      {
        source: "/about-us",
        destination: "/vi/about",
        permanent: true,
      },
      {
        source: "/en/about-us",
        destination: "/en/about",
        permanent: true,
      },
      {
        source: "/vi/about-us",
        destination: "/vi/about",
        permanent: true,
      },
      {
        source: "/projetcs",
        destination: "/vi/projects",
        permanent: true,
      },
      {
        source: "/en/projetcs",
        destination: "/en/projects",
        permanent: true,
      },
      {
        source: "/vi/projetcs",
        destination: "/vi/projects",
        permanent: true,
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    /** Matches `next/image` quality values used in the app (default 75 + custom 55). */
    qualities: [55, 75],
    minimumCacheTTL: 31536000,
  },

  /**
   * Required for Three.js / @react-three/* ESM packages to transpile
   * correctly through the webpack bundler.
   */
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],

  poweredByHeader: false,
};

export default withNextIntl(nextConfig);