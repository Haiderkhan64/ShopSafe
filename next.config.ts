import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        // Restrict to image assets only — blocks attempts to proxy arbitrary
        // CDN paths through Next.js Image Optimization.
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;