import { defineField } from 'sanity'

/**
 * The two fields that decide how a page looks in a search result.
 *
 * The `service` schema spells its own pair out, because a service's title
 * falls back to the document's own rubrik and the help text has to say so.
 * Every other page is a singleton whose fallback lives in the route file, so
 * they all want the same two fields with the same wording — hence one helper
 * rather than five copies drifting apart.
 *
 * Unlike the service pages, what is typed here is the **whole** title: nothing
 * is appended. These pages name the company in their own titles ("Om Navolt |
 * …"), and a template would put it there twice.
 *
 * Add them under a group named 'seo'; the caller declares the group, since it
 * decides where in its own tab order it belongs.
 */
export function seoFields(what: string) {
  return [
    defineField({
      name: 'seoTitle',
      title: 'Sidtitel i Google',
      type: 'string',
      group: 'seo',
      description:
        `Rubriken i sökresultatet för ${what}. Skriv hela titeln som den ska stå — ` +
        'inget läggs till efteråt. Lämna tom för att behålla den sidan har idag. ' +
        'Håll den under ca 60 tecken.',
      validation: (Rule) => Rule.max(70).warning('Längre än 70 tecken klipps av i Google.'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Beskrivning i Google',
      type: 'text',
      rows: 3,
      group: 'seo',
      description:
        'Texten under rubriken i sökresultatet. Lämna tom för att behålla den sidan har ' +
        'idag. Ca 150–160 tecken är lagom.',
      validation: (Rule) => Rule.max(200).warning('Längre än 200 tecken klipps av i Google.'),
    }),
  ]
}
