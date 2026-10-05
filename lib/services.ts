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
  {
    appId: string
    label: string
    /**
     * The same dialog where it appears again under "Så går det till".
     * By then the steps have named the first one — campervan's opens on
     * "Berätta om din van" — so the button can say that rather than repeat
     * the header's wording a screen and a half further down. Falls back to
     * `label` where a service has nothing better to call it.
     */
    stepsLabel?: string
    padded?: boolean
    variant?: 'primary' | 'outline'
  }
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
    // "Fråga oss" reads as a line to a person; the button opens a form. Dropping
    // "oss" is what makes the label and what happens next agree.
    label: 'Fråga om elsystem för campervan',
    stepsLabel: 'Berätta om din van',
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
}

/** Replaces the panel's own second button on /tjanster — including the booking
 *  dialog, where a service has both. */
export const servicePanelCta: Record<string, ServiceCta> = {
  batrutor: { label: 'Se rutpaket', href: '/produkter' },
  campervan: {
    label: 'Fråga oss om elsystem för campervan',
    href: '/kontakt?amne=campervan',
  },
}

/** Replaces "Alla tjänster" in the header of a service's own page. */
export const servicePageCta: Record<string, ServiceCta> = {
  batrutor: { label: 'Se alla rutpaket', href: '/produkter' },
  // The first button already opens the form, so the second is only worth
  // having if it offers something else — here, the phone.
  campervan: {
    label: 'Ring oss',
    href: `tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`,
  },
  // The first button books the job. This one is for the visitor who isn't
  // ready to book yet, so it says what it's for rather than "Kontakta oss".
  motorservice: { label: 'Fråga om motorservice', href: '/kontakt?amne=motorservice' },
  marinelektronik: {
    label: 'Ring oss',
    href: `tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`,
  },
}
