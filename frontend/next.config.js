const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // Монорепо (app/ в корне + frontend/): standalone должен подтянуть все чанки/CSS в образ
  outputFileTracingRoot: path.join(__dirname, '..'),
  experimental: {
    externalDir: true,
  },
  images: {
    domains: [],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/icons/:name*.png',
        destination: '/icons/:name*.svg',
      },
    ]
  },
}

module.exports = nextConfig

