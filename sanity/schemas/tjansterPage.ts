import { defineField, defineType } from 'sanity'

/**
 * The copy around the service list at /tjanster — the header above the panels
 * and the band below them.
 *
 * The services themselves are separate documents, under Tjänster in the menu:
 * their titles, descriptions, feature lists and images are edited there, one
 * document per service. This is only the framing text.
 *
 * Anything left blank falls back to the copy hardcoded in
 * `app/(site)/tjanster/page.tsx`.
 */
export const tjansterPageSchema = defineType({
  name: 'tjansterPage',
  title: 'Tjänstesida',
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
      description: 'Liten text ovanför rubriken, t.ex. "Vad vi gör".',
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
      rows: 3,
      group: 'huvud',
    }),
    defineField({
      name: 'serviceCtaPrefix',
      title: 'Knapptext före tjänstens namn',
      type: 'string',
      group: 'huvud',
      description:
        'Knappen under varje tjänst. Namnet läggs till automatiskt — "Fråga om" blir "Fråga om båt".',
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
    prepare: () => ({ title: 'Tjänstesida' }),
  },
})
