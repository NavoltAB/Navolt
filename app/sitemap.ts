import type { MetadataRoute } from 'next'
import { getAllProducts, getAllServices } from '@/sanity/queries'
import { hasServicePage, serviceHref } from '@/lib/services'
import { siteConfig } from '@/config/site'

/**
 * XML sitemap at /sitemap.xml.
 *
 * Matters most right now: the site is a relaunch of an existing domain, and
 * the new URLs — /batrutor above all, which the old site ranked on — need to
 * be found again quickly rather than crawled into over weeks.
 *
 * /studio, /api and /varukorg are deliberately absent. /varukorg is the one
 * worth spelling out: robots.txt lets a crawler fetch it, so that it can read
 * the noindex in its <head> — but a page nobody should land on from a search
 * result has no business being advertised here either.
 * Products come from Sanity and simply disappear from the list when no project
 * is configured, which is what should happen — an empty catalogue has no
 * product URLs to offer.
 */

export const revalidate = 3600

// Priority is a hint, not a ranking lever. Kept coarse on purpose: the money
// pages first, the legal pages last.
const staticRoutes = [
  { path: '/', priority: 1 },
  { path: '/tjanster', priority: 0.9 },
  { path: '/batrutor', priority: 0.9 },
  { path: '/produkter', priority: 0.9 },
  { path: '/kontakt', priority: 0.7 },
  { path: '/om-oss', priority: 0.6 },
  { path: '/kopvillkor', priority: 0.3 },
  { path: '/integritetspolicy', priority: 0.2 },
  { path: '/cookies', priority: 0.2 },
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, services] = await Promise.all([getAllProducts(), getAllServices()])
  const now = new Date()

  const entries = [
    ...staticRoutes.map((route) => ({
      url: `${siteConfig.url}${route.path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: route.priority,
    })),
    // The service pages, at the top level. /batrutor is listed among the
    // static routes as well — it has a route of its own that stands up with no
    // Sanity project at all — so the two lists are deduped below rather than
    // trusting them not to overlap.
    ...services
      .filter((service) => hasServicePage(service.slug))
      .map((service) => ({
        url: `${siteConfig.url}${serviceHref(service.slug)}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.9,
      })),
    ...products.map((product) => ({
      url: `${siteConfig.url}/produkter/${product.slug}`,
      lastModified: product._createdAt ? new Date(product._createdAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]

  // A URL listed twice is a sitemap Google treats with suspicion, and the
  // first entry is the one with the hand-set priority.
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()]
}
