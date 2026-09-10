import { defineField, defineType } from 'sanity'

export const categorySchema = defineType({
  name: 'category',
  title: 'Kategori',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Namn',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Roll',
      type: 'string',
      description:
        '"Kräver monteringspaket" = produkterna i kategorin påminns om att peka ut ett monteringspaket, här i studion. "Är monteringspaket" = kategorin innehåller själva paketen, och begränsar listan när ett ska väljas. Ingen av dem visar något på sajten av sig själv — det gör först ett valt paket. Sätts en gång, inte per produkt.',
      options: {
        list: [
          { title: 'Vanlig', value: 'standard' },
          { title: 'Kräver monteringspaket', value: 'requiresKit' },
          { title: 'Är monteringspaket', value: 'kit' },
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
    }),
    defineField({
      name: 'slug',
      title: 'URL-slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', role: 'role' },
    prepare({ title, role }) {
      const roles: Record<string, string> = {
        requiresKit: 'Kräver monteringspaket',
        kit: 'Är monteringspaket',
      }
      return { title, subtitle: role ? roles[role] : undefined }
    },
  },
})
