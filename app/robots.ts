import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

/**
 * /robots.txt.
 *
 * The studio and the API routes have nothing to offer a crawler.
 *
 * /varukorg is kept *out* of this list on purpose, even though it has no
 * business in the index. It carries `noindex, follow` in its own <head>
 * (app/(site)/varukorg/layout.tsx), and a crawler that is forbidden to fetch
 * the page never reads the tag that would drop it — a disallowed URL can still
 * be indexed on the strength of links alone, title and all. Allowing the fetch
 * is what makes the noindex work. It stays out of the sitemap either way.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/api/'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
