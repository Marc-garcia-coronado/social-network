import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com", "assets.aceternity.com", "images.unsplash.com"],
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'cookie',
            key: 'token',
            value: '(?<token>.*)',
          },
        ],
        destination: '/login',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
