import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  // Disable Image Optimization API for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

