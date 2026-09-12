import { defineField, defineType } from 'sanity'

/**
 * A campaign band on the landing page — "kampanjvecka", vinterrea, ett
 * erbjudande som gäller i tre veckor.
 *
 * One document is one band, rendered between "Varför Navolt" and "Om oss" by
 * `components/CampaignBands.tsx`. Nothing is active is the normal state: with
 * no campaign document, or none ticked as synlig, the whole section is left
 * out rather than rendered empty — the same rule the product row follows.
 *
 * Unlike the page singletons there is no hardcoded fallback copy behind these
 * fields. A campaign nobody has written isn't a campaign, so there is nothing
 * sensible to show in its place.
 *
 * Two toggles, on purpose:
 *
 * - **Synlig** is the switch the editor flips. Off means off, whatever the
 *   dates say.
 * - **Från/Till** is the calendar. Set them and the band appears and
 *   disappears on its own; leave them blank and it runs until Synlig is
 *   unticked. Both are inclusive — a campaign "till" den 30:e is live all day
 *   on the 30th.
 *
 * The site revalidates every 60 seconds, so a date change lands within the
 * minute rather than on the next deploy.
 */
export const campaignSchema = defineType({
  name: 'campaign',
  title: 'Kampanj',
  type: 'document',
  groups: [
    { name: 'publicering', title: 'Publicering', default: true },
    { name: 'innehall', title: 'Innehåll' },
    { name: 'knapp', title: 'Knapp' },
  ],
  fields: [
    // ── Publicering ─────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Rubrik',
      type: 'string',
      group: 'innehall',
      validation: (Rule) => Rule.required(),
      description: 'Stora rubriken i bandet. Används också som namn på kampanjen här i studion.',
    }),
    defineField({
      name: 'active',
      title: 'Synlig på startsidan',
      type: 'boolean',
      group: 'publicering',
      initialValue: false,
      description:
        'Huvudströmbrytaren. Är den av syns kampanjen inte, oavsett vad datumen nedan säger.',
    }),
    defineField({
      name: 'startDate',
      title: 'Visas från',
      type: 'date',
      group: 'publicering',
      options: { dateFormat: 'YYYY-MM-DD' },
      description: 'Valfritt. Lämna tomt för att starta direkt när Synlig slås på.',
    }),
    defineField({
      name: 'endDate',
      title: 'Visas till och med',
      type: 'date',
      group: 'publicering',
      options: { dateFormat: 'YYYY-MM-DD' },
      description:
        'Valfritt. Sista dagen kampanjen syns — dagen räknas med. Datumet visas också som ' +
        '"Gäller t.o.m. …" i bandet, så besökaren ser hur länge erbjudandet står sig.',
    }),
    defineField({
      name: 'order',
      title: 'Sorteringsordning',
      type: 'number',
      group: 'publicering',
      description:
        'Lägre siffra visas först. Spelar bara roll om flera kampanjer är igång samtidigt.',
    }),

    // ── Innehåll ────────────────────────────────────────────
    defineField({
      name: 'label',
      title: 'Etikett',
      type: 'string',
      group: 'innehall',
      description: 'Den lilla versaltexten ovanför rubriken. Lämna tom för "Kampanj".',
    }),
    defineField({
      name: 'titleAccent',
      title: 'Rubrik, guldkursiv del',
      type: 'string',
      group: 'innehall',
      description:
        'Valfritt. Fortsätter på samma rad som rubriken, i mässing och kursivt — samma grepp ' +
        'som hero och avslutande CTA.',
    }),
    defineField({
      name: 'text',
      title: 'Text',
      type: 'text',
      rows: 5,
      group: 'innehall',
      description: 'Vad erbjudandet är och vad som gäller. Separera stycken med en tom rad.',
    }),
    defineField({
      name: 'badge',
      title: 'Erbjudandeplatta',
      type: 'string',
      group: 'innehall',
      description:
        'Valfritt. Kort och slagkraftigt — "−20 %", "2 för 1", "Fri montering". Sitter som en ' +
        'mässingsplatta i bildens hörn. Lämna tom om erbjudandet inte går att säga i tre ord.',
      validation: (Rule) => Rule.max(24).warning('Längre än så får inte plats på plattan.'),
    }),
    defineField({
      name: 'image',
      title: 'Bild',
      type: 'image',
      options: { hotspot: true },
      group: 'innehall',
      description: 'Utan bild blir bandet en textspalt i full bredd — det fungerar, men syns mindre.',
    }),

    // ── Knapp ───────────────────────────────────────────────
    defineField({
      name: 'ctaLabel',
      title: 'Knapptext',
      type: 'string',
      group: 'knapp',
      description: 'Lämna tom för "Läs mer".',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Knappen leder till',
      type: 'string',
      group: 'knapp',
      initialValue: '/kontakt',
      description:
        'En sökväg på sajten, t.ex. /kontakt, /produkter eller /batrutor. Hela adresser ' +
        '(https://…) går också, för en extern anmälningssida.',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          if (value.startsWith('/') || value.startsWith('https://')) return true
          return 'Skriv en sökväg som börjar med / eller en adress som börjar med https://'
        }),
    }),
  ],
  orderings: [
    { title: 'Sortering', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', media: 'image', active: 'active', from: 'startDate', to: 'endDate' },
    prepare: ({ title, media, active, from, to }) => {
      const window = from && to ? `${from} – ${to}` : to ? `t.o.m. ${to}` : from ? `från ${from}` : ''
      return {
        title,
        // The list is where someone checks "is the rea still up?", so the
        // on/off state has to be readable without opening the document.
        subtitle: [active ? '● Synlig' : '○ Avstängd', window].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
