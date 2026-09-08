// ============================================================
//  SITE CONFIG — Navolt AB
//  Fallback values for the whole site. Anything the customer
//  edits in Sanity (siteSettings) overrides these at runtime.
// ============================================================

export const siteConfig = {
  name: 'Navolt',
  legalName: 'Navolt AB',
  tagline: 'Vi löser elen ombord',
  description:
    'Navolt är marinelektriker i Göteborg och Öckerö. Vi hjälper dig med felsökning, uppgradering och nyinstallation av el och elektronik i fritidsbåt, husbil och campervan.',

  // Canonical origin — metadataBase, the sitemap and every canonical URL
  // hang off this. Overridable so a preview deploy doesn't advertise the
  // production domain as its own.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://navolt.se',

  lang: 'sv',
  locale: 'sv_SE',

  contact: {
    phone: '073 025 45 55',
    email: 'info@navolt.se',
    address: 'Tjolmenvägen\n475 50 Hälsö',
    // Where post reaches the company — deliberately not the same as `address`,
    // which is where you turn up in person. /kopvillkor names both and says so:
    // a köpvillkor has to state an address the buyer can write to.
    postalAddress: 'Kapellevägen 15B\n451 44 Uddevalla',
    // TODO: confirm opening hours with the customer — placeholder for now.
    openingHours: 'Måndag–Fredag: 07:00–16:00',
    mapsUrl: 'https://www.google.se/maps/place/Navolt+AB/@57.732011,11.6530219,17z',
  },

  company: {
    orgNumber: '559475-1876',
    fSkatt: true,
  },

  social: {
    facebook: 'https://www.facebook.com/NavoltAB',
    instagram: 'https://www.instagram.com/navolt.ab',
  },

  // Third-party widgets from Elfsight (elfsight.com). The ids come from the
  // customer's Elfsight dashboard — the same account as the old site.
  // Set to null to remove a widget and its script entirely.
  elfsight: {
    // Facebook chat bubble, fixed bottom-right on every page.
    chat: '3ead7891-b445-4a8a-ac2e-bdd1f4cb0216',
    // Reviews, homepage above the brands strip.
    // UNVERIFIED — inferred from the old site's homepage. Confirm in the
    // Elfsight dashboard that this is the reviews widget and not a lead form.
    reviews: 'cb71a3bb-2e76-475b-9681-437157e214be',
    // Instagram feed, bottom of /om-oss.
    instagram: 'b54f4b7e-c04b-41d3-8ee7-1c421abce0ec',
    // Lead forms, opened from the matching service panel on /tjanster. Same two
    // widgets the old site opened in a modal from its /motorservice and
    // /campervan pages, so the submissions keep landing in the same place.
    motorserviceForm: 'f91c748e-389f-400c-ae6f-33659247c49b',
    campervanForm: '4daba287-9bb2-4f97-8c90-9b215ae72512',
  },
} as const
