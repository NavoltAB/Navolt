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

  lang: 'sv',
  locale: 'sv_SE',

  contact: {
    phone: '073 025 45 55',
    email: 'info@navolt.se',
    address: 'Tjolmenvägen\n475 50 Hälsö',
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
  },
} as const
