import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'blog.dervisgenc.com',
                port: '',
                pathname: '/api/uploads/images/**', // Ensure this matches the backend URL structure
            }
        ],
    },
};

export default nextConfig;
