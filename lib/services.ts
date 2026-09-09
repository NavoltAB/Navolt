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
  'varukorg',
  'offert',
  'integritetspolicy',
  'cookies',
  'kopvillkor',
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
  { appId: string; label: string; padded?: boolean; variant?: 'primary' | 'outline' }
> = {
  // Both widgets run flush to their own edges, so the dialog is what gives
  // them their air — keep the two in step, or one form sits tighter in its
  // panel than the other. Drop `padded` for a widget that pads itself in the
  // Elfsight dashboard, or it ends up double-padded.
  motorservice: {
    appId: siteConfig.elfsight.motorserviceForm,
    label: 'Boka motorservice',
    padded: true,
    variant: 'primary',
  },
  campervan: {
    appId: siteConfig.elfsight.campervanForm,
    label: 'Berätta om din van',
    padded: true,
    variant: 'primary',
  },
}

/* --- The second button ------------------------------------------------- */

/**
 * A service's second call to action, where the generic one isn't the right
 * next step.
 *
 * By default a /tjanster panel offers "Fråga om <tjänst>" and a service page
 * offers "Alla tjänster". Some services have something better to send the
 * visitor to — a catalogue of ready-made rutpaket, the contact form with the
 * subject already chosen, or the phone — so those are named here and both
 * consumers read them from one place. Keyed by slug, like `serviceForms`.
 *
 * The `?amne=` values are slugs on purpose: `prefillFromParam` in
 * lib/contactForm.ts maps them onto a subject, so a service renamed in the
 * studio still arrives at the right one.
 */
export type ServiceCta = {
  label: string
  href: string
  /** Solid navy rather than the outline a second button normally wears. For a
   *  service whose whole page is the enquiry — say what you're building and
   *  we'll get back to you — that button is the point, not the afterthought. */
  variant?: 'primary' | 'outline'
}

/** Replaces the panel's own second button on /tjanster — including the booking
 *  dialog, where a service has both. */
export const servicePanelCta: Record<string, ServiceCta> = {
  batrutor: { label: 'Se rutpaket', href: '/produkter' },
  campervan: {
    label: 'Berätta om din van',
    href: '/kontakt?amne=campervan',
    variant: 'primary',
  },
}

/** Replaces "Alla tjänster" in the header of a service's own page. */
export const servicePageCta: Record<string, ServiceCta> = {
  campervan: { label: 'Kontakta oss', href: '/kontakt?amne=campervan' },
  motorservice: { label: 'Kontakta oss', href: '/kontakt?amne=motorservice' },
  marinelektronik: {
    label: 'Ring oss',
    href: `tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`,
  },
}
