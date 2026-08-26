import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP as the fallback for browsers that don't take it. The
    // hero is the LCP element and by far the heaviest thing on the landing
    // page, so the format is worth more here than anywhere else on the site.
    // Encoding AVIF is slower, but only on the first request per size — the
    // result is cached after that.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

export default nextConfig
