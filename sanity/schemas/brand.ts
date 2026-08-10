import { defineField, defineType } from 'sanity'

export const brandSchema = defineType({
  name: 'brand',
  title: 'Varumärke',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Namn',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logotyp',
      type: 'image',
      description:
        'PNG med transparent bakgrund, minst 400 px bred. Undvik JPG — den får en vit ruta bakom logotypen.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'scale',
      title: 'Optisk skala',
      type: 'number',
      initialValue: 1,
      description:
        'Lämna som 1. Höj bara om logotypen ser för liten ut bredvid de andra, t.ex. 1.8 när bilden har mycket tom marginal.',
      validation: (Rule) => Rule.min(0.5).max(3),
    }),
    defineField({
      name: 'order',
      title: 'Sorteringsordning',
      type: 'number',
      description: 'Lägre siffra visas först',
    }),
  ],
  orderings: [{ title: 'Sortering', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', media: 'logo' },
  },
})
