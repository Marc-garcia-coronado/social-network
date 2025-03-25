import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
