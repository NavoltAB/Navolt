import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * A service — and its own page.
 *
 * Each service has a top-level URL built from its slug (/batrutor,
 * /motorservice, …), matching the flat URLs the old site used. One document
 * therefore feeds three places:
 *
 *   · the tile on the landing page      — title, kort beskrivning, bild
 *   · the panel on /tjanster            — the same three, plus "Vad ingår"
 *   · the service's own page            — all of it
 *
 * Grouped so the first tab is the short version every page needs, and the
 * rest follow the service page top to bottom. Anything left blank falls back
 * to lib/serviceContent.ts, and a whole section left empty is left out of the
 * page rather than rendered as an empty band.
 */
export const serviceSchema = defineType({
  name: 'service',
  title: 'Tjänst',
  type: 'document',
  groups: [
    { name: 'grund', title: 'Grunduppgifter', default: true },
    { name: 'text', title: 'Brödtext' },
    { name: 'steg', title: 'Så går det till' },
    { name: 'utvalt', title: 'Utvald sektion' },
    { name: 'galleri', title: 'Bildgalleri' },
    { name: 'dokument', title: 'Dokument' },
    { name: 'cta', title: 'Avslutande CTA' },
    { name: 'seo', title: 'Sök och delning' },
  ],
  fields: [
    // ── Grunduppgifter ──────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      group: 'grund',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      group: 'grund',
      options: { source: 'title', maxLength: 96 },
      description:
        'Tjänstens adress på sajten — slug "batrutor" ger navolt.se/batrutor. Ändra den inte på en tjänst som redan ligger ute: den gamla adressen slutar då fungera och tappar sin plats i Google.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Kort beskrivning',
      type: 'text',
      rows: 3,
      group: 'grund',
      description:
        'Visas på startsidan, i tjänsteöversikten, i menyn under Tjänster och överst på tjänstens egen sida. Håll den kort — den ska fungera på alla fyra ställena.',
    }),
    defineField({
      name: 'image',
      title: 'Bild',
      type: 'image',
      options: { hotspot: true },
      group: 'grund',
      description: 'Används både som tjänstens bild i listorna och överst på dess egen sida.',
    }),
    defineField({
      name: 'features',
      title: 'Vad ingår',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'grund',
      description: 'Punktlista. Visas både i tjänsteöversikten och på tjänstens egen sida.',
    }),
    defineField({
      name: 'order',
      title: 'Sorteringsordning',
      type: 'number',
      group: 'grund',
      description: 'Lägre siffra visas först — i menyn, på startsidan och i översikten.',
    }),

    // ── Brödtext ────────────────────────────────────────────
    defineField({
      name: 'introLabel',
      title: 'Etikett',
      type: 'string',
      group: 'text',
      description: 'Liten text ovanför rubriken, t.ex. "Vad vi gör".',
    }),
    defineField({
      name: 'introTitle',
      title: 'Rubrik',
      type: 'string',
      group: 'text',
      description: 'Lämna tom för att använda tjänstens titel.',
    }),
    defineField({
      name: 'description',
      title: 'Brödtext',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'text',
      description:
        'Den långa texten på tjänstens egen sida. Skriv gärna mer här än i den korta beskrivningen — det är den här texten Google läser för att förstå vad sidan handlar om.',
    }),

    // ── Så går det till ─────────────────────────────────────
    defineField({
      name: 'stepsLabel',
      title: 'Etikett',
      type: 'string',
      group: 'steg',
    }),
    defineField({
      name: 'stepsTitle',
      title: 'Rubrik',
      type: 'string',
      group: 'steg',
    }),
    defineField({
      name: 'steps',
      title: 'Steg',
      type: 'array',
      group: 'steg',
      description:
        'Lägg till, ta bort och dra för att ändra ordning. Numreringen (01, 02 …) sätts automatiskt. Visas i fyra spalter, så fyra steg ligger snyggast. Lämnas listan tom visas hela avsnittet inte alls.',
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

    // ── Utvald sektion ──────────────────────────────────────
    defineField({
      name: 'highlightImage',
      title: 'Bild',
      type: 'image',
      options: { hotspot: true },
      group: 'utvalt',
      description:
        'Bred sektion med bild till vänster och text till höger — t.ex. monteringspaketen under Båtrutor. Beskärs till 4:3. Utan rubrik visas sektionen inte.',
    }),
    defineField({
      name: 'highlightLabel',
      title: 'Etikett',
      type: 'string',
      group: 'utvalt',
    }),
    defineField({
      name: 'highlightTitle',
      title: 'Rubrik',
      type: 'string',
      group: 'utvalt',
      description: 'Utan den här visas sektionen inte alls.',
    }),
    defineField({
      name: 'highlightText',
      title: 'Text',
      type: 'text',
      rows: 4,
      group: 'utvalt',
    }),
    defineField({
      name: 'highlightCtaLabel',
      title: 'Knapptext',
      type: 'string',
      group: 'utvalt',
      description: 'Knappen visas bara om både text och länk är ifyllda.',
    }),
    defineField({
      name: 'highlightCtaHref',
      title: 'Knappens länk',
      type: 'string',
      group: 'utvalt',
      description:
        'En adress på sajten, t.ex. /produkter?kategori=batrutor. Måste börja med / — externa länkar hör inte hemma i en knapp mitt på sidan.',
      validation: (Rule) =>
        Rule.custom((value) =>
          !value || value.startsWith('/') ? true : 'Länken måste börja med /'
        ),
    }),

    // ── Bildgalleri ─────────────────────────────────────────
    defineField({
      name: 'gallery',
      title: 'Bildgalleri',
      type: 'array',
      group: 'galleri',
      description:
        'Raden längst ned på sidan. Tre bilder ligger snyggast — fler radbryts. Tom lista, inget galleri.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt-text',
              type: 'string',
              description: 'Kort beskrivning av bilden, för skärmläsare och sökmotorer.',
            }),
          ],
        }),
      ],
    }),

    // ── Dokument ────────────────────────────────────────────
    defineField({
      name: 'documents',
      title: 'Dokument',
      type: 'array',
      group: 'dokument',
      description:
        'Monteringsanvisningar, datablad, prislistor, kopplingsscheman — visas som nedladdningsbara länkar på tjänstens egen sida. PDF fungerar bäst; filen öppnas i en ny flik.',
      of: [
        {
          type: 'file',
          fields: [
            defineField({
              name: 'title',
              title: 'Namn',
              type: 'string',
              description:
                'Vad länken ska heta, t.ex. "Monteringsanvisning". Lämnas det tomt används filnamnet.',
            }),
          ],
          preview: {
            select: { title: 'title', filename: 'asset.originalFilename' },
            prepare({ title, filename }) {
              return {
                title: title || filename || 'Dokument',
                subtitle: title ? filename : undefined,
              }
            },
          },
        },
      ],
    }),

    // ── Avslutande CTA ──────────────────────────────────────
    defineField({
      name: 'ctaLabel',
      title: 'Etikett',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaTitle',
      title: 'Rubrik',
      type: 'string',
      group: 'cta',
    }),
    defineField({
      name: 'ctaText',
      title: 'Text',
      type: 'text',
      rows: 3,
      group: 'cta',
    }),
    defineField({
      name: 'ctaButtonLabel',
      title: 'Knapptext',
      type: 'string',
      group: 'cta',
      description:
        'Knappen leder till kontaktformuläret med tjänsten ifylld. Telefonknappen bredvid hämtar numret från Webbplatsinställningar.',
    }),

    // ── Sök och delning ─────────────────────────────────────
    defineField({
      name: 'seoTitle',
      title: 'Sidtitel i Google',
      type: 'string',
      group: 'seo',
      description:
        'Rubriken i sökresultatet. "| Navolt" läggs till automatiskt. Lämna tom för att använda tjänstens titel. Håll den under ca 60 tecken.',
      validation: (Rule) => Rule.max(70).warning('Längre än 70 tecken klipps av i Google.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Beskrivning i Google',
      type: 'text',
      rows: 3,
      group: 'seo',
      description:
        'Texten under rubriken i sökresultatet. Lämna tom för att använda den korta beskrivningen. Ca 150–160 tecken är lagom.',
      validation: (Rule) => Rule.max(200).warning('Längre än 200 tecken klipps av i Google.'),
    }),
  ],
  orderings: [{ title: 'Sortering', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'slug.current', media: 'image' },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? `/${subtitle}` : 'Ingen slug — syns inte som egen sida',
      media,
    }),
  },
})
