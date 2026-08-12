import { defineField, defineType } from 'sanity'

/**
 * The copy on /kontakt.
 *
 * Only the headings and the notice box live here. Telefon, e-post, adress och
 * öppettider are shared with the footer and the rest of the site, so they are
 * edited once under Webbplatsinställningar rather than duplicated per page.
 *
 * Anything left blank falls back to the copy hardcoded in
 * `app/(site)/kontakt/page.tsx`.
 */
export const kontaktPageSchema = defineType({
  name: 'kontaktPage',
  title: 'Kontakt',
  type: 'document',
  groups: [
    { name: 'huvud', title: 'Sidhuvud', default: true },
    { name: 'uppgifter', title: 'Uppgifter' },
    { name: 'formular', title: 'Formulär' },
  ],
  fields: [
    // ── Sidhuvud ────────────────────────────────────────────
    defineField({
      name: 'pageLabel',
      title: 'Sidhuvud — Etikett',
      type: 'string',
      group: 'huvud',
      description: 'Liten text ovanför rubriken, t.ex. "Hör av dig".',
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

    // ── Uppgifter ───────────────────────────────────────────
    defineField({
      name: 'contactInfoTitle',
      title: 'Kontaktuppgifter — Rubrik',
      type: 'string',
      group: 'uppgifter',
      description:
        'T.ex. "Uppgifter". Själva numret, adressen och e-posten redigeras under Webbplatsinställningar.',
    }),
    defineField({
      name: 'openingHoursTitle',
      title: 'Öppettider — Rubrik',
      type: 'string',
      group: 'uppgifter',
      description: 'Visas bara när öppettider är ifyllda under Webbplatsinställningar.',
    }),
    defineField({
      name: 'freeConsultationTitle',
      title: 'Notisruta — Rubrik',
      type: 'string',
      group: 'uppgifter',
      description: 'Den inramade rutan under öppettiderna, t.ex. "Pris innan vi börjar".',
    }),
    defineField({
      name: 'freeConsultationText',
      title: 'Notisruta — Text',
      type: 'text',
      rows: 3,
      group: 'uppgifter',
    }),

    // ── Formulär ────────────────────────────────────────────
    defineField({
      name: 'formTitle',
      title: 'Formulär — Rubrik',
      type: 'string',
      group: 'formular',
      description: 'T.ex. "Skicka ett meddelande". Fälten i formuläret är fasta.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Kontakt' }),
  },
})
