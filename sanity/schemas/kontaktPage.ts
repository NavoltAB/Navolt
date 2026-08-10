import { defineField, defineType } from 'sanity'

export const kontaktPageSchema = defineType({
  name: 'kontaktPage',
  title: 'Kontakt',
  type: 'document',
  fields: [
    defineField({
      name: 'pageLabel',
      title: 'Sidhuvud — Etikett',
      type: 'string',
      description: 'Liten text ovanför rubriken, t.ex. "Hör av dig"',
    }),
    defineField({
      name: 'pageTitle',
      title: 'Sidhuvud — Rubrik',
      type: 'string',
    }),
    defineField({
      name: 'pageSubtitle',
      title: 'Sidhuvud — Underrubrik',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'contactInfoTitle',
      title: 'Kontaktuppgifter — Rubrik',
      type: 'string',
      description: 'T.ex. "Uppgifter"',
    }),
    defineField({
      name: 'formTitle',
      title: 'Formulär — Rubrik',
      type: 'string',
      description: 'T.ex. "Skicka ett meddelande"',
    }),
    defineField({
      name: 'freeConsultationTitle',
      title: 'Konsultationsruta — Rubrik',
      type: 'string',
    }),
    defineField({
      name: 'freeConsultationText',
      title: 'Konsultationsruta — Text',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Kontakt' }),
  },
})
