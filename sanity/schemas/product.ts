import { defineField, defineType } from 'sanity'

export const productSchema = defineType({
  name: 'product',
  title: 'Produkt',
  type: 'document',
  orderings: [
    {
      title: 'Namn A-Ö',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }],
    },
    {
      title: 'Namn Ö-A',
      name: 'nameDesc',
      by: [{ field: 'name', direction: 'desc' }],
    },
    {
      title: 'Pris (lägst)',
      name: 'priceAsc',
      by: [{ field: 'price', direction: 'asc' }],
    },
    {
      title: 'Pris (högst)',
      name: 'priceDesc',
      by: [{ field: 'price', direction: 'desc' }],
    },
    {
      title: 'Utvalda först',
      name: 'featuredFirst',
      by: [{ field: 'featured', direction: 'desc' }, { field: 'name', direction: 'asc' }],
    },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Namn',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Bilder',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alternativtext', type: 'string' }),
          ],
        },
      ],
    }),
    defineField({
      name: 'shortDescription',
      title: 'Kort beskrivning',
      type: 'text',
      rows: 2,
      description: 'Visas på produktkortet',
    }),
    defineField({
      name: 'description',
      title: 'Fullständig beskrivning',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'price',
      title: 'Pris (kr)',
      type: 'number',
    }),
    defineField({
      name: 'unit',
      title: 'Enhet',
      type: 'string',
      description: 'T.ex. "st", "säck", "liter", "kg"',
    }),
    defineField({
      name: 'productDetails',
      title: 'Produktinformation',
      type: 'array',
      description: 'Specifikationer och fakta som visas i en tabell på produktsidan.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Etikett', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'value', title: 'Värde', type: 'string', validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'value' } },
        },
      ],
    }),
    defineField({
      name: 'inStock',
      title: 'I lager',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'featured',
      title: 'Visa på startsidan',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'category.title', media: 'images.0', price: 'price', inStock: 'inStock' },
    prepare({ title, subtitle, media, price, inStock }) {
      const parts: string[] = []
      if (subtitle) parts.push(subtitle)
      if (price) parts.push(`${price} kr`)
      if (inStock === false) parts.push('EJ I LAGER')
      return { title, subtitle: parts.join(' · '), media }
    },
  },
})
