import { defineField, defineType } from 'sanity'

/**
 * The copy around the product index at /produkter — the header above the grid
 * and the band below it.
 *
 * Nothing about the catalogue itself lives here: the products, their categories
 * and the counts in the rail all come from the Produkter and Kategorier
 * documents. This is only the framing text.
 *
 * Anything left blank falls back to the copy hardcoded in
 * `app/(site)/produkter/page.tsx`.
 */
export const productsPageSchema = defineType({
  name: 'productsPage',
  title: 'Produktsida',
  type: 'document',
  groups: [
    { name: 'huvud', title: 'Sidhuvud', default: true },
    { name: 'cta', title: 'Avslutande CTA' },
  ],
  fields: [
    // ── Sidhuvud ────────────────────────────────────────────
    defineField({
      name: 'pageLabel',
      title: 'Sidhuvud — Etikett',
      type: 'string',
      group: 'huvud',
      description: 'Liten text ovanför rubriken, t.ex. "Sortiment".',
    }),
    defineField({
      name: 'pageTitle',
      title: 'Sidhuvud — Rubrik',
      type: 'string',
      group: 'huvud',
    }),
    defineField({
      name: 'pageSubtitle',
      title: 'Sidhuvud — Underrubrik',
      type: 'text',
      rows: 4,
      group: 'huvud',
      description: 'Antalet produkter och kategorier räknas fram automatiskt under texten.',
    }),

    // ── Avslutande CTA ──────────────────────────────────────
    defineField({
      name: 'ctaLabel',
      title: 'CTA — Etikett',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaTitle',
      title: 'CTA — Rubrik',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA — Text',
      type: 'text',
      rows: 3,
      group: 'cta',
    }),
    defineField({
      name: 'ctaButtonLabel',
      title: 'CTA — Knapptext',
      type: 'string',
      group: 'cta',
      description: 'Knappen leder till /kontakt.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Produktsida' }),
  },
})
