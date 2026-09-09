import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Every piece of copy and every image on /om-oss.
 *
 * Grouped and ordered to match the page top to bottom. Anything left blank
 * falls back to the copy hardcoded in `app/(site)/om-oss/page.tsx`, so the page
 * never renders half-empty. Link targets are fixed (/kontakt, /tjanster) —
 * labels are editable, paths aren't.
 *
 * The brand logos further down the page are separate documents, under
 * Varumärken in the menu.
 */
export const aboutPageSchema = defineType({
  name: 'aboutPage',
  title: 'Om oss',
  type: 'document',
  groups: [
    { name: 'huvud', title: 'Sidhuvud', default: true },
    { name: 'bakgrund', title: 'Bakgrund' },
    { name: 'stats', title: 'Sifferrad' },
    { name: 'varderingar', title: 'Så jobbar vi' },
    { name: 'film', title: 'Film' },
    { name: 'omdomen', title: 'Omdömen' },
    { name: 'instagram', title: 'Instagram' },
    { name: 'cta', title: 'Avslutande CTA' },
  ],
  fields: [
    // ── Sidhuvud ────────────────────────────────────────────
    defineField({
      name: 'pageLabel',
      title: 'Sidhuvud — Etikett',
      type: 'string',
      group: 'huvud',
      description: 'Liten text ovanför rubriken, t.ex. "Vilka vi är".',
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
      rows: 2,
      group: 'huvud',
    }),

    // ── Bakgrund ────────────────────────────────────────────
    defineField({
      name: 'mainImage',
      title: 'Bakgrund — Bild',
      type: 'image',
      options: { hotspot: true },
      group: 'bakgrund',
      description: 'Den breda bilden överst. Beskärs till 21:9.',
    }),
    defineField({
      name: 'storyLabel',
      title: 'Bakgrund — Etikett',
      type: 'string',
      group: 'bakgrund',
      description: 'Texten i vänsterspalten bredvid brödtexten.',
    }),
    defineField({
      name: 'storyText',
      title: 'Bakgrund — Text',
      type: 'text',
      rows: 12,
      group: 'bakgrund',
      description: 'Separera stycken med en tom rad.',
    }),
    defineField({
      name: 'storyCtaLabel',
      title: 'Bakgrund — Knapptext',
      type: 'string',
      group: 'bakgrund',
      description: 'Knappen leder till /kontakt.',
    }),

    // ── Sifferrad ───────────────────────────────────────────
    defineField({
      name: 'stats',
      title: 'Sifferrad',
      type: 'array',
      group: 'stats',
      description: 'Den mörkblå raden. Fyra poster ligger snyggast — fler radbryts.',
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

    // ── Så jobbar vi ────────────────────────────────────────
    defineField({
      name: 'valuesLabel',
      title: 'Så jobbar vi — Etikett',
      type: 'string',
      group: 'varderingar',
    }),
    defineField({
      name: 'valuesTitle',
      title: 'Så jobbar vi — Rubrik',
      type: 'string',
      group: 'varderingar',
    }),
    defineField({
      name: 'values',
      title: 'Så jobbar vi — Punkter',
      type: 'array',
      group: 'varderingar',
      description:
        'Lägg till, ta bort och dra för att ändra ordning. Numreringen (01, 02 …) sätts automatiskt. Visas i två spalter, så jämnt antal ser bäst ut.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Rubrik',
              type: 'string',
              description:
                'Valfri. Lämnas den tom visas varken rubrik eller nummer — ' +
                'använd det när avsnittet bara innehåller ett stycke löptext ' +
                'och inte en numrerad lista.',
            }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 4 }),
          ],
          // Without a heading the row would show as "Untitled" in the studio,
          // so the paragraph stands in as its name.
          preview: {
            select: { title: 'title', subtitle: 'text' },
            prepare: ({ title, subtitle }: { title?: string; subtitle?: string }) => ({
              title: title || subtitle || 'Utan rubrik',
              subtitle: title ? subtitle : undefined,
            }),
          },
        }),
      ],
    }),

    // ── Film ────────────────────────────────────────────────
    defineField({
      name: 'videoUrl',
      title: 'Film — YouTube-länk',
      type: 'url',
      group: 'film',
      description:
        'Hela länken till filmen på YouTube. Lämnas den tom visas avsnittet inte alls. ' +
        'Inget hämtas från YouTube förrän besökaren trycker på play.',
    }),
    defineField({
      name: 'videoLabel',
      title: 'Film — Etikett',
      type: 'string',
      group: 'film',
      description: 'Liten text ovanför, t.ex. "Från verkstaden".',
    }),
    defineField({
      name: 'videoText',
      title: 'Film — Text',
      type: 'text',
      rows: 3,
      group: 'film',
      description: 'En mening om vad filmen visar.',
    }),
    defineField({
      name: 'videoPoster',
      title: 'Film — Omslagsbild',
      type: 'image',
      options: { hotspot: true },
      group: 'film',
      description:
        'Stillbilden som visas innan man trycker play. Lämnas den tom används ' +
        "YouTubes egen miniatyr, som oftast är suddigare. Beskärs till 16:9.",
    }),

    // ── Omdömen ─────────────────────────────────────────────
    defineField({
      name: 'reviewsLabel',
      title: 'Omdömen — Etikett',
      type: 'string',
      group: 'omdomen',
      description:
        'Enda texten vi styr här — omdömena själva kommer från Google via Elfsight, och widgeten har en egen rubrik.',
    }),

    // ── Instagram ───────────────────────────────────────────
    defineField({
      name: 'instagramLabel',
      title: 'Instagram — Etikett',
      type: 'string',
      group: 'instagram',
    }),
    defineField({
      name: 'instagramTitle',
      title: 'Instagram — Rubrik',
      type: 'string',
      group: 'instagram',
      description: 'Själva flödet hämtas från Instagram — bara rubrikerna styrs här.',
    }),

    // ── Avslutande CTA ──────────────────────────────────────
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
      name: 'ctaPrimaryLabel',
      title: 'CTA — Knapptext (fylld)',
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
  ],
  preview: {
    prepare: () => ({ title: 'Om oss' }),
  },
})
