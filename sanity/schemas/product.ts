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
      name: 'boatModel',
      title: 'Båtmodell',
      type: 'reference',
      to: [{ type: 'boatModel' }],
      description:
        'Vilken båt produkten är gjord för. Fylls i för båtrutor och monteringspaket — lämna tom för produkter som inte hör till en viss båt. Styr filtret på /produkter.',
    }),
    defineField({
      name: 'mountingKit',
      title: 'Monteringspaket',
      type: 'reference',
      to: [{ type: 'product' }],
      /**
       * Kits only — a ruta pointed at another ruta would produce a nonsense
       * reminder on the product page and in varukorgen, and the picker is the
       * cheapest place to make that impossible.
       *
       * But only once a category has actually been marked "Är monteringspaket".
       * Filtering on a role nobody has set yet hands the editor an empty picker
       * with no clue why, so until then every other product is offered and the
       * filter tightens by itself the moment the roll is set.
       */
      options: {
        filter: async ({ document, getClient }) => {
          const self = (document?._id ?? '').replace(/^drafts\./, '')
          const kitCategoryExists = await getClient({ apiVersion: '2024-01-01' })
            .fetch<boolean>('count(*[_type == "category" && role == "kit"]) > 0')
          return {
            // A product can never be its own monteringspaket.
            filter: kitCategoryExists
              ? '_id != $self && category->role == "kit"'
              : '_id != $self',
            params: { self },
          }
        },
      },
      description:
        'Det monteringspaket just den här rutan kräver — varje ruta har sitt eget. Visas på produktsidan och påminns om i varukorgen. Listan begränsas till monteringspaket först när kategorin de ligger i har Roll = "Är monteringspaket".',
      validation: (Rule) =>
        Rule.custom(async (value, context) => {
          if (value) return true
          const categoryRef = (context.document as { category?: { _ref?: string } } | undefined)
            ?.category?._ref
          if (!categoryRef) return true
          // Only nag inside a category that has actually been marked as needing
          // a kit — every other product is meant to leave this empty.
          const role = await context
            .getClient({ apiVersion: '2024-01-01' })
            .fetch<string | null>('*[_id == $id][0].role', { id: categoryRef })
          return role === 'requiresKit'
            ? 'Den här produkten ligger i en kategori som kräver monteringspaket, men inget är valt.'
            : true
        }).warning(),
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
      name: 'documents',
      title: 'Dokument',
      type: 'array',
      description:
        'Monteringsanvisningar, datablad, mallar — laddas ned från produktsidan under "Specifikation".',
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
              return { title: title || filename || 'Dokument', subtitle: title ? filename : undefined }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'inStock',
      title: 'I lager',
      type: 'boolean',
      description:
        'På = "I lager" (grön) på produktsidan. Av = "Beställningsvara" (gul) — produkten säljs fortfarande och går att lägga i varukorgen, den tas bara hem på beställning.',
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
    select: { title: 'name', subtitle: 'category.title', boatModel: 'boatModel.name', media: 'images.0', price: 'price', inStock: 'inStock' },
    prepare({ title, subtitle, boatModel, media, price, inStock }) {
      const parts: string[] = []
      if (subtitle) parts.push(subtitle)
      if (boatModel) parts.push(boatModel)
      if (price) parts.push(`${price} kr`)
      if (inStock === false) parts.push('BESTÄLLNINGSVARA')
      return { title, subtitle: parts.join(' · '), media }
    },
  },
})
