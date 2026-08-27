import { defineField, defineType } from 'sanity'

/**
 * A boat a product can be made for — the båtrutor range is sold per model, so
 * the model is what a customer actually shops by. Kept as its own document
 * rather than a string on the product, so renaming "Nimbus 26" once fixes it
 * everywhere and the filter list can't drift into near-duplicates.
 */
export const boatModelSchema = defineType({
  name: 'boatModel',
  title: 'Båtmodell',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Namn',
      type: 'string',
      description: 'Tillverkare och modell, som kunden känner igen den — t.ex. "Nimbus 26 Coupé".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      description: 'Fylls i automatiskt. Används i länken /produkter?modell=…',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Sorteringsordning',
      type: 'number',
      description: 'Lägre siffra visas först i filtret. Lämnas den tom sorteras modellen på namn.',
    }),
  ],
  orderings: [
    { title: 'Sortering', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Namn A-Ö', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'name' },
  },
})
