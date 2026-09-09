import { FolderOpen, ListChecks } from 'lucide-react'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { DEFAULT_FEATURE_ICON, featureIcon, featureIconOptions } from '@/lib/featureIcons'

/**
 * A service — and its own page.
 *
 * Each service has a top-level URL built from its slug (/batrutor,
 * /motorservice, …), matching the flat URLs the old site used. One document
 * therefore feeds three places:
 *
 *   · the tile on the landing page      — title, kort beskrivning, bild
 *   · the panel on /tjanster            — the same three, as a teaser
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
    { name: 'steg', title: 'Så går det till' },
    { name: 'text', title: 'Brödtext' },
    { name: 'utvalt', title: 'Utvald sektion' },
    { name: 'film', title: 'Film' },
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
      description:
        'Tjänstens bild i listorna — startsidan, översikten och menyn. Visas i stående format, ' +
        'så motivet bör sitta i mitten. Används även överst på tjänstens egen sida om ingen ' +
        'bredbild är vald nedan.',
    }),
    defineField({
      name: 'pageImage',
      title: 'Bredbild — överst på tjänstens sida',
      type: 'image',
      options: { hotspot: true },
      group: 'grund',
      description:
        'Valfri. Sidans toppbild visas liggande (16:9), och en bild som fungerar stående blir ' +
        'ofta hårt beskuren där. Lämna tom för att använda bilden ovan.',
    }),
    defineField({
      name: 'features',
      title: 'Vad ingår',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'feature',
          title: 'Punkt',
          type: 'object',
          icon: ListChecks,
          fields: [
            defineField({
              name: 'text',
              title: 'Text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'icon',
              title: 'Ikon',
              type: 'string',
              options: { list: featureIconOptions },
              initialValue: DEFAULT_FEATURE_ICON,
              description: 'Visas framför texten. Lämna som bock om ingen passar.',
            }),
          ],
          preview: {
            select: { title: 'text', icon: 'icon' },
            prepare: ({ title, icon }: { title?: string; icon?: string }) => ({
              title,
              media: featureIcon(icon),
            }),
          },
        }),
        defineArrayMember({
          name: 'featureGroup',
          title: 'Kategori',
          type: 'object',
          icon: FolderOpen,
          fields: [
            defineField({
              name: 'title',
              title: 'Rubrik',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: 'title' },
            prepare: ({ title }: { title?: string }) => ({
              title,
              subtitle: 'Kategori',
              media: FolderOpen,
            }),
          },
        }),
      ],
      group: 'grund',
      description:
        'Punktlista med ikon, visas som kort på tjänstens egen sida. Skriv "Etikett - beskrivning" ' +
        'så sätts etiketten i fetstil överst i kortet. Lägg in en "Kategori" för att dela upp ' +
        'korten i grupper — varje punkt hamnar under närmast föregående kategori, och en kategori ' +
        'utan punkter under sig visas inte. Utan kategorier visas alla kort i ett svep som förut.',
      // Bullets written before the icon field existed are bare strings, which
      // the studio shows as an unknown item type — Sanity won't allow a string
      // and an object in the same array, so they can't be kept as a second
      // member type. `npm run migrate:features` converts them; the site
      // renders them either way (lib/featureIcons.ts).
    }),
    defineField({
      name: 'featuresLabel',
      title: 'Vad ingår — Etikett',
      type: 'string',
      group: 'grund',
      description: 'Liten text ovanför korten. Lämna tom för "Vad ingår".',
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
      name: 'highlights',
      title: 'Utvalda sektioner',
      type: 'array',
      group: 'utvalt',
      description:
        'Breda sektioner med bild till vänster och text till höger — t.ex. monteringspaketen och rutpaketen under Båtrutor. Lägg till en per sektion och dra för att ändra ordning. En sektion utan rubrik visas inte.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'highlightSection',
          fields: [
            defineField({
              name: 'image',
              title: 'Bild',
              type: 'image',
              options: { hotspot: true },
              description: 'Beskärs till 4:3.',
            }),
            defineField({
              name: 'label',
              title: 'Etikett',
              type: 'string',
              description: 'Liten versal rad ovanför rubriken, t.ex. "Monteringspaket".',
            }),
            defineField({
              name: 'title',
              title: 'Rubrik',
              type: 'string',
              description: 'Utan den här visas sektionen inte alls.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 4,
              description:
                'Löpande text. Ska sektionen räkna upp saker — det som ingår i ett paket, till exempel — skriv dem i punktlistan nedan i stället, så blir de en riktig lista.',
            }),
            defineField({
              name: 'items',
              title: 'Punktlista',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
              description:
                'En sak per rad. Visas i två spalter med bock framför, under texten.',
            }),
            defineField({
              name: 'ctaLabel',
              title: 'Knapptext',
              type: 'string',
              description: 'Knappen visas bara om både text och länk är ifyllda.',
            }),
            defineField({
              name: 'ctaHref',
              title: 'Knappens länk',
              type: 'string',
              description:
                'En adress på sajten, t.ex. /produkter?kategori=batrutor. Måste börja med / — externa länkar hör inte hemma i en knapp mitt på sidan.',
              validation: (Rule) =>
                Rule.custom((value) =>
                  !value || (value as string).startsWith('/')
                    ? true
                    : 'Länken måste börja med /'
                ),
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'label', media: 'image' },
          },
        }),
      ],
    }),

    // ── Film ────────────────────────────────────────────────
    // Nothing loads from YouTube until a visitor presses play — the section is
    // a poster image and a button until then. See components/YouTubeEmbed.tsx.
    defineField({
      name: 'videoUrl',
      title: 'YouTube-länk',
      type: 'url',
      group: 'film',
      description:
        'Klistra in adressen till filmen på YouTube, precis som den ser ut i webbläsaren. Tomt fält, ingen filmsektion.',
    }),
    defineField({
      name: 'videoLabel',
      title: 'Etikett',
      type: 'string',
      group: 'film',
      description: 'Den lilla texten ovanför rubriken, t.ex. "Film".',
    }),
    defineField({
      name: 'videoTitle',
      title: 'Rubrik',
      type: 'string',
      group: 'film',
      description:
        'Rubrik över filmen. Används också som filmens namn för skärmläsare, så beskriv vad den visar.',
    }),
    defineField({
      name: 'videoPoster',
      title: 'Omslagsbild',
      type: 'image',
      group: 'film',
      options: { hotspot: true },
      description:
        'Bilden som visas innan man trycker på play. Utan den används YouTubes egen — en egen bild från jobbet är nästan alltid skarpare.',
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
      name: 'documentsLabel',
      title: 'Etikett',
      type: 'string',
      group: 'dokument',
      description: 'Liten text ovanför rubriken. Lämna tom för "Dokument".',
    }),
    defineField({
      name: 'documentsTitle',
      title: 'Rubrik',
      type: 'string',
      group: 'dokument',
      description: 'Lämna tom för "Ladda ner".',
    }),
    defineField({
      name: 'documentsText',
      title: 'Text',
      type: 'text',
      rows: 4,
      group: 'dokument',
      description:
        'Berätta vad filen innehåller och varför den är värd att ladda ner — står det hela ' +
        'arbetsgången i den behöver sidan inte upprepa den. Lämna tom för att bara visa listan.',
    }),
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
