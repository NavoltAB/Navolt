import { defineField, defineType } from 'sanity'

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Webbplatsinställningar',
  type: 'document',
  fields: [
    defineField({
      name: 'phone',
      title: 'Telefon',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'E-postadress',
      type: 'string',
    }),
    defineField({
      name: 'address',
      title: 'Adress',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'openingHours',
      title: 'Öppettider',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'mapsUrl',
      title: 'Google Maps-länk',
      type: 'url',
      description: 'Länk till verkstaden på Google Maps — används på kontaktsidan.',
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'facebook',
      title: 'Facebook URL',
      type: 'url',
    }),
    defineField({
      name: 'orgNumber',
      title: 'Organisationsnummer',
      type: 'string',
      description: 'Visas i sidfoten.',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Webbplatsinställningar' }),
  },
})
