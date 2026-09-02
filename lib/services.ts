import { siteConfig } from '@/config/site'

/**
 * Where a service links to.
 *
 * Every service has a page of its own at the top level — `/batrutor`,
 * `/motorservice`, `/campervan`, `/marinelektronik` — matching the flat URLs
 * the old site used. Those URLs carry the rankings and the traffic, so they
 * stay exactly where they were rather than moving under `/tjanster/`.
 *
 * `/tjanster` is the index above them: a panel per service, each linking here.
 *
 * Both consumers read from this file — the landing tiles, the `/tjanster`
 * panels and the header dropdown — so the URL shape is decided in one place.
 */

/**
 * Top-level paths that are already taken.
 *
 * Service slugs are editor-controlled and land at the root, so a service
 * slugged `produkter` would sit under a route that already exists. Next
 * resolves the static route first, which would leave that service's page
 * quietly unreachable — so it keeps its panel on /tjanster instead and never
 * advertises a link that goes somewhere else.
 *
 * `batrutor` is deliberately absent: it *is* a service, and /batrutor is its
 * page like any other — one template renders all four.
 */
export const RESERVED_SLUGS: readonly string[] = [
  'tjanster',
  'produkter',
  'om-oss',
  'kontakt',
  'offert',
  'integritetspolicy',
  'cookies',
  'studio',
  'api',
]

/** Does this service have a page of its own? */
export function hasServicePage(slug: string | undefined | null): boolean {
  return Boolean(slug) && !RESERVED_SLUGS.includes(slug as string)
}

/** The href for a service — its own page, or the index if it can't have one. */
export function serviceHref(slug: string | undefined | null): string {
  return hasServicePage(slug) ? `/${slug}` : '/tjanster'
}

/**
 * Services with a lead form of their own.
 *
 * These two carried a booking form on the old site and keep it here, opened
 * from a dialog on both the /tjanster panel and the service's own page rather
 * than from a separate page. Keyed by slug, so a Sanity `service` document
 * picks its form up by matching slug without any change here.
 *
 * The ids come from the customer's Elfsight dashboard via config/site.ts.
 */
export const serviceForms: Record<
  string,
  { appId: string; label: string; padded?: boolean }
> = {
  // Both widgets run flush to their own edges, so the dialog is what gives
  // them their air — keep the two in step, or one form sits tighter in its
  // panel than the other. Drop `padded` for a widget that pads itself in the
  // Elfsight dashboard, or it ends up double-padded.
  motorservice: {
    appId: siteConfig.elfsight.motorserviceForm,
    label: 'Boka motorservice',
    padded: true,
  },
  campervan: {
    appId: siteConfig.elfsight.campervanForm,
    label: 'Berätta om din van',
    padded: true,
  },
}
