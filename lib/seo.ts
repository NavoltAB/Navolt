import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'

/**
 * Canonical URL and Open Graph for one page, decided in one place.
 *
 * Every public page needs the same four things — a canonical, og:url, an
 * og:image and a description — and writing them out per route is how they
 * drift. `metadataBase` in app/layout.tsx resolves the relative paths here
 * against `siteConfig.url`, so a preview deploy never advertises the
 * production domain as its own.
 *
 * og:title and og:description are deliberately not set: Next mirrors the
 * page's own title and description into them, and stating them twice is one
 * more pair to keep in sync.
 */

/**
 * The share image for pages with no picture of their own — the landing hero.
 * A real photograph rather than a generated card, which is what a link to a
 * marine electrician should look like in a Facebook feed.
 */
export const DEFAULT_OG_IMAGE = '/images/hero-img.jpg'

/** What Facebook, LinkedIn and X all crop to. */
const OG_WIDTH = 1200
const OG_HEIGHT = 630

/**
 * A Sanity asset cropped to the share-card aspect.
 *
 * The service pages project `image.asset->url`, which is the original — up to
 * 6000×4000 on some documents, in whatever aspect the photo was shot. Passing
 * that to og:image means every share is a multi-megabyte download that the
 * platform then crops from the middle. The CDN takes the same parameters
 * `urlFor()` produces, so the URL can be narrowed after the fact.
 *
 * Anything not on the Sanity CDN — a local file under /images — is returned
 * untouched.
 */
export function shareImage(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  if (!url.includes('cdn.sanity.io')) return url
  const join = url.includes('?') ? '&' : '?'
  return `${url}${join}w=${OG_WIDTH}&h=${OG_HEIGHT}&fit=crop&auto=format`
}

type PageSeo = {
  /** Path from the site root, with a leading slash and no domain. */
  path: string
  title?: string
  /**
   * Bypasses the `%s | Navolt` template in app/layout.tsx. For a title that
   * already names the company itself — "Kontakta Navolt | …" — where the
   * template would append it a second time.
   */
  titleAbsolute?: string
  description?: string
  /** Absolute URL or a path under /public. Falls back to the landing hero. */
  image?: string | null
  /**
   * Keeps the page out of the index while still letting the crawler follow
   * its links. Note this only works on a page the crawler is allowed to fetch
   * — see the note in app/robots.ts.
   */
  noindex?: boolean
}

export function pageMetadata(seo: PageSeo): Metadata {
  return {
    ...(seo.titleAbsolute
      ? { title: { absolute: seo.titleAbsolute } }
      : seo.title
        ? { title: seo.title }
        : {}),
    ...(seo.description ? { description: seo.description } : {}),
    alternates: { canonical: seo.path },
    openGraph: {
      url: seo.path,
      images: [
        {
          url: seo.image || DEFAULT_OG_IMAGE,
          width: OG_WIDTH,
          height: OG_HEIGHT,
        },
      ],
    },
    ...(seo.noindex ? { robots: { index: false, follow: true } } : {}),
  }
}

/**
 * The company itself, as structured data on every page of the site.
 *
 * `ProfessionalService` rather than `LocalBusiness`: Navolt works aboard the
 * customer's boat rather than serving people who turn up at a counter, and the
 * narrower type is the one that says so.
 *
 * Opening hours are deliberately absent. `siteConfig.contact.openingHours` is
 * still marked TODO — unconfirmed hours published as structured data are the
 * kind of thing Google shows in a knowledge panel and nobody notices is wrong.
 * Add `openingHoursSpecification` here once the customer has confirmed them.
 */
export function organizationJsonLd() {
  // "Tjolmenvägen\n475 50 Hälsö" — a Swedish postcode carries a space of its
  // own, so the line splits on the gap *after* the five digits rather than on
  // the first one it finds.
  const [street, postal = ''] = siteConfig.contact.address.split('\n')
  const postalMatch = postal.match(/^(\d{3}\s?\d{2})\s+(.+)$/)

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    image: `${siteConfig.url}${DEFAULT_OG_IMAGE}`,
    identifier: siteConfig.company.orgNumber,
    address: {
      '@type': 'PostalAddress',
      streetAddress: street,
      postalCode: postalMatch?.[1],
      addressLocality: postalMatch?.[2] ?? postal,
      addressCountry: 'SE',
    },
    areaServed: ['Göteborg', 'Öckerö', 'Hälsö', 'Västkusten'].map((name) => ({
      '@type': 'Place',
      name,
    })),
    sameAs: [siteConfig.social.facebook, siteConfig.social.instagram].filter(Boolean),
  }
}

/**
 * One product, as structured data on its own page.
 *
 * `offers` is left off entirely for a product with no price — "Pris på
 * förfrågan" is a real state in this catalogue, and an Offer with no price is
 * an invalid one. A product that is sold but not stocked is `BackOrder`, which
 * is exactly what the site calls a beställningsvara.
 */
export function productJsonLd(product: {
  name: string
  slug: string
  description?: string
  images: string[]
  price?: number
  inStock: boolean
  category?: string
}) {
  const url = `${siteConfig.url}/produkter/${product.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.images.length > 0 ? { image: product.images } : {}),
    ...(product.category ? { category: product.category } : {}),
    url,
    ...(product.price != null
      ? {
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'SEK',
            availability: product.inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/BackOrder',
            itemCondition: 'https://schema.org/NewCondition',
            url,
            seller: { '@id': `${siteConfig.url}/#organization` },
          },
        }
      : {}),
  }
}
