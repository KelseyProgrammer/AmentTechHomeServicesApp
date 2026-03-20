/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve AVIF/WebP when browser supports it (next/image auto-selects)
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Strip X-Powered-By header
  poweredByHeader: false,
  // Security headers + aggressive cache for static assets
  async headers() {
    return [
      {
        source: '/frames/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.jpg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*.png',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
