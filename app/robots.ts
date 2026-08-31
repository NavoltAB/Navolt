import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

/**
 * /robots.txt.
 *
 * The studio and the API routes have nothing to offer a crawler, and /offert
 * is a checkout step that only makes sense with a cart behind it — indexing an
 * empty one would put a dead end in the search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/api/', '/offert'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
