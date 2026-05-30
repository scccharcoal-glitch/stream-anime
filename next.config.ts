import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.stream-anime.org',
        pathname: '/wp-content/uploads/**',
      },
    ],
    // Allow unoptimized for Thai-character URLs as fallback
    unoptimized: false,
  },
}

export default nextConfig
