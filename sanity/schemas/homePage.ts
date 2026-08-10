import { defineField, defineType } from 'sanity'

export const homePageSchema = defineType({
  name: 'homePage',
  title: 'Startsida',
  type: 'document',
  fields: [
    defineField({
      name: 'heroTitle',
      title: 'Hero — Rubrik',
      type: 'string',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero — Underrubrik',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero — Bakgrundsbild',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'featuredProducts',
      title: 'Utvalda produkter',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'product' }] }],
      validation: (Rule) => Rule.max(4),
      description: 'Max 4 produkter visas på startsidan',
    }),
    defineField({
      name: 'aboutTitle',
      title: 'Om oss — Rubrik',
      type: 'string',
    }),
    defineField({
      name: 'aboutText',
      title: 'Om oss — Text',
      type: 'text',
      rows: 5,
    }),
    defineField({
      name: 'aboutImage',
      title: 'Om oss — Bild',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Startsida' }),
  },
})
