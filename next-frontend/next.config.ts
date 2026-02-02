import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Standalone output for Docker deployment
    output: 'standalone',
    
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'blog.dervisgenc.com',
                port: '',
                pathname: '/api/uploads/images/**',
            }
        ],
    },
};

export default nextConfig;
