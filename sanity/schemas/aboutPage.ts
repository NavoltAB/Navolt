import { defineField, defineType } from 'sanity'

export const aboutPageSchema = defineType({
  name: 'aboutPage',
  title: 'Om oss',
  type: 'document',
  fields: [
    defineField({
      name: 'pageSubtitle',
      title: 'Sidhuvud — Underrubrik',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'mainImage',
      title: 'Bild',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'storyText',
      title: 'Historia — Text',
      type: 'text',
      rows: 8,
      description: 'Separera stycken med en tom rad',
    }),
    defineField({
      name: 'stats',
      title: 'Statistik',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'value', title: 'Värde', type: 'string' }),
            defineField({ name: 'label', title: 'Etikett', type: 'string' }),
          ],
          preview: {
            select: { title: 'value', subtitle: 'label' },
          },
        },
      ],
    }),
    defineField({
      name: 'values',
      title: 'Värderingar',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Rubrik', type: 'string' }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 3 }),
          ],
          preview: {
            select: { title: 'title' },
          },
        },
      ],
    }),
    defineField({
      name: 'ctaTitle',
      title: 'CTA — Rubrik',
      type: 'string',
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA — Text',
      type: 'string',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Om oss' }),
  },
})
