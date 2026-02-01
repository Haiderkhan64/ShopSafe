import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  images: {
    domains: ['cdn.sanity.io'],
    // Alternatively, you can use the newer remotePatterns config:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'cdn.sanity.io',
    //     pathname: '/images/**',
    //   },
    // ],
  },
};

export default nextConfig;
