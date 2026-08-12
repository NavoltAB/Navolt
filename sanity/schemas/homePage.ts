import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Every piece of copy and every image on the landing page.
 *
 * Fields are grouped and ordered to match the page top to bottom, so the tab
 * strip in the studio reads as a map of the page rather than an alphabet soup.
 *
 * Two conventions worth knowing before editing:
 *
 * - Several headings are split into a plain part and an "accent" part. The
 *   accent renders in brass italic — that's the only way to get the two-tone
 *   headline without giving the editor a rich-text field that could produce
 *   anything.
 * - Link targets are deliberately *not* editable. Labels are. The buttons point
 *   at /tjanster, /produkter and /kontakt, and a mistyped path here would ship
 *   a dead button with no warning.
 *
 * Anything left blank falls back to the copy hardcoded in `app/(site)/page.tsx`,
 * so the page never renders half-empty.
 */
export const homePageSchema = defineType({
  name: 'homePage',
  title: 'Startsida',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'trust', title: 'Sifferrad' },
    { name: 'produkter', title: 'Produkter' },
    { name: 'manifest', title: 'Manifest' },
    { name: 'tjanster', title: 'Tjänster' },
    { name: 'varfor', title: 'Varför Navolt' },
    { name: 'om', title: 'Om oss' },
    { name: 'omdomen', title: 'Omdömen' },
    { name: 'cta', title: 'Avslutande CTA' },
  ],
  fields: [
    // ── Hero ────────────────────────────────────────────────
    defineField({
      name: 'heroBadge',
      title: 'Hero — Etikett',
      type: 'string',
      group: 'hero',
      description: 'Den lilla rundade texten ovanför rubriken, t.ex. orterna ni arbetar i.',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero — Rubrik',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'heroTitleAccent',
      title: 'Hero — Rubrik, guldkursiv del',
      type: 'string',
      group: 'hero',
      description: 'Hamnar på egen rad under rubriken, i mässing och kursivt.',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero — Underrubrik',
      type: 'text',
      rows: 3,
      group: 'hero',
      description: 'Visas även under logotypen i sidfoten, på alla sidor.',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero — Bakgrundsbild',
      type: 'image',
      options: { hotspot: true },
      group: 'hero',
    }),
    defineField({
      name: 'heroCtaLabel',
      title: 'Hero — Knapptext',
      type: 'string',
      group: 'hero',
      description: 'Knappen leder till /tjanster.',
    }),
    defineField({
      name: 'heroPhoneLabel',
      title: 'Hero — Text före telefonnumret',
      type: 'string',
      group: 'hero',
      description:
        'Numret självt hämtas från Webbplatsinställningar. Skriv bara ordet före, t.ex. "Ring".',
    }),

    // ── Sifferrad ───────────────────────────────────────────
    defineField({
      name: 'trustStats',
      title: 'Sifferrad',
      type: 'array',
      group: 'trust',
      description:
        'Den mörkblå raden direkt under hero. Fyra poster ligger snyggast — fler radbryts.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'value', title: 'Värde', type: 'string' }),
            defineField({ name: 'label', title: 'Etikett', type: 'string' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
    }),

    // ── Produkter ───────────────────────────────────────────
    defineField({
      name: 'productsLabel',
      title: 'Produkter — Etikett',
      type: 'string',
      group: 'produkter',
    }),
    defineField({
      name: 'productsTitle',
      title: 'Produkter — Rubrik',
      type: 'string',
      group: 'produkter',
    }),
    defineField({
      name: 'productsCtaLabel',
      title: 'Produkter — Knapptext',
      type: 'string',
      group: 'produkter',
      description: 'Knappen leder till /produkter.',
    }),

    // ── Manifest ────────────────────────────────────────────
    defineField({
      name: 'manifestoBefore',
      title: 'Manifest — Text före',
      type: 'text',
      rows: 2,
      group: 'manifest',
    }),
    defineField({
      name: 'manifestoAccent',
      title: 'Manifest — Guldkursivt ord',
      type: 'string',
      group: 'manifest',
    }),
    defineField({
      name: 'manifestoAfter',
      title: 'Manifest — Text efter',
      type: 'text',
      rows: 2,
      group: 'manifest',
    }),

    // ── Tjänster ────────────────────────────────────────────
    defineField({
      name: 'servicesLabel',
      title: 'Tjänster — Etikett',
      type: 'string',
      group: 'tjanster',
    }),
    defineField({
      name: 'servicesTitle',
      title: 'Tjänster — Rubrik',
      type: 'string',
      group: 'tjanster',
    }),
    defineField({
      name: 'servicesCtaLabel',
      title: 'Tjänster — Knapptext',
      type: 'string',
      group: 'tjanster',
      description: 'Knappen leder till /tjanster. Själva rutorna redigeras under Tjänster i menyn.',
    }),

    // ── Varför Navolt ───────────────────────────────────────
    defineField({
      name: 'whyLabel',
      title: 'Varför — Etikett',
      type: 'string',
      group: 'varfor',
    }),
    defineField({
      name: 'whyTitle',
      title: 'Varför — Rubrik',
      type: 'string',
      group: 'varfor',
    }),
    defineField({
      name: 'whyItems',
      title: 'Varför — Punkter',
      type: 'array',
      group: 'varfor',
      description:
        'Lägg till, ta bort och dra för att ändra ordning. Numreringen (01, 02, 03 …) sätts automatiskt.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Rubrik',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 4 }),
          ],
          preview: { select: { title: 'title', subtitle: 'text' } },
        }),
      ],
    }),

    // ── Om oss ──────────────────────────────────────────────
    defineField({
      name: 'aboutLabel',
      title: 'Om oss — Etikett',
      type: 'string',
      group: 'om',
    }),
    defineField({
      name: 'aboutTitle',
      title: 'Om oss — Rubrik',
      type: 'string',
      group: 'om',
    }),
    defineField({
      name: 'aboutText',
      title: 'Om oss — Text',
      type: 'text',
      rows: 5,
      group: 'om',
    }),
    defineField({
      name: 'aboutImage',
      title: 'Om oss — Bild',
      type: 'image',
      options: { hotspot: true },
      group: 'om',
    }),
    defineField({
      name: 'aboutStats',
      title: 'Om oss — Nyckeltal',
      type: 'array',
      group: 'om',
      description: 'Den lilla raden mellan texten och knappen.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'value', title: 'Värde', type: 'string' }),
            defineField({ name: 'label', title: 'Etikett', type: 'string' }),
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        }),
      ],
    }),
    defineField({
      name: 'aboutCtaLabel',
      title: 'Om oss — Knapptext',
      type: 'string',
      group: 'om',
      description: 'Knappen leder till /om-oss.',
    }),

    // ── Omdömen ─────────────────────────────────────────────
    defineField({
      name: 'reviewsLabel',
      title: 'Omdömen — Etikett',
      type: 'string',
      group: 'omdomen',
      description:
        'Enda texten vi styr här — omdömena själva kommer från Google via Elfsight.',
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
      name: 'ctaTitleAccent',
      title: 'CTA — Rubrik, guldkursiv del',
      type: 'string',
      group: 'cta',
      description: 'Fortsätter på samma rad som rubriken, i mässing och kursivt.',
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA — Text',
      type: 'text',
      rows: 3,
      group: 'cta',
    }),
    defineField({
      name: 'ctaPrimaryLabel',
      title: 'CTA — Knapptext (guld)',
      type: 'string',
      group: 'cta',
      description: 'Knappen leder till /kontakt.',
    }),
    defineField({
      name: 'ctaSecondaryLabel',
      title: 'CTA — Knapptext (kontur)',
      type: 'string',
      group: 'cta',
      description: 'Knappen leder till /tjanster.',
    }),
    defineField({
      name: 'ctaPhoneLabel',
      title: 'CTA — Etikett över telefonnumret',
      type: 'string',
      group: 'cta',
      description: 'Numret självt hämtas från Webbplatsinställningar.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Startsida' }),
  },
})
