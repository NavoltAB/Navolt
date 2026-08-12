/**
 * Reconciling a CMS value with the in-file default.
 *
 * Every page has to render correctly with no Sanity project configured at all
 * (see `isSanityConfigured` in ./client), so each editable string and list has
 * a hardcoded default sitting behind it. These two helpers are the seam.
 *
 * A field the editor has cleared comes back as `''`, and a list they have
 * emptied comes back as `[]` rather than `undefined` — so `??` is wrong here
 * and `||` alone doesn't cover the empty-array case.
 */

export const text = (value: string | undefined | null, fallback: string) =>
  value?.trim() || fallback

export const list = <T,>(value: T[] | undefined | null, fallback: readonly T[]) =>
  value && value.length > 0 ? value : fallback

/**
 * Splits a `text` field into paragraphs on blank lines.
 *
 * The long prose fields are plain textareas rather than portable text: the copy
 * is a handful of paragraphs with no links, headings or emphasis in it, and a
 * rich-text editor would invite formatting the page has no styles for.
 */
export const paragraphs = (value: string | undefined | null, fallback: readonly string[]) => {
  const parts = value?.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return parts && parts.length > 0 ? parts : [...fallback]
}
