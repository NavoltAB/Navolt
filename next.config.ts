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

  /**
   * The old site's flat URLs, for the two that don't carry over unchanged.
   *
   * /bat, /motorservice, /campervan and /batrutor were all top-level pages
   * there; three of them still are, so only /bat needs pointing at its new
   * name. /galleri has no equivalent — the Instagram feed on /om-oss is the
   * nearest thing to it, which beats a 404 on a URL that has links to it.
   *
   * Confirm the full list against Search Console before launch; anything else
   * with traffic belongs here too.
   */
  async redirects() {
    return [
      { source: '/bat', destination: '/marinelektronik', permanent: true },
      // The basket moved from /offert to /varukorg, which is what it has said
      // on the page and in the header all along. Temporary rather than 308:
      // the URL is disallowed to crawlers so there is no ranking to hand over,
      // and a permanent redirect would sit in visitors' browser caches
      // indefinitely for a path we may well want back.
      { source: '/offert', destination: '/varukorg', permanent: false },
      { source: '/galleri', destination: '/om-oss', permanent: true },
    ]
  },
}

export default nextConfig
