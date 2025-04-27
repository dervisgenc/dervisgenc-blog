import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'blog.dervisgenc.com',
                port: '',
                pathname: '/api/uploads/images/**', // Ensure this matches the backend URL structure
            },
            {
                protocol: 'http', // Allow http for local development
                hostname: 'localhost',
                port: '8080', // Backend port
                pathname: '/api/uploads/images/**', // Ensure this matches the backend URL structure
            },
            // Add placeholder if needed
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
            { // Add this if you use placeholder.svg locally
                protocol: 'http',
                hostname: 'localhost',
                port: '3000', // Or your Next.js port
                pathname: '/placeholder.svg',
            },
        ],
    },
};

export default nextConfig;
