import type { ServiceHighlight } from '@/types/sanity'

/**
 * The "utvald sektion" band, tidied up before it is rendered.
 *
 * The list of what a monteringspaket contains is a list, and belongs in
 * `items` — but the field it was first written into was a plain textarea, and
 * an editor faced with one types the list into it with a dash or a middot in
 * front of every line. Rendered as a paragraph that collapses into one long
 * run of names separated by dots, which is how the båtrutor page read.
 *
 * So a text block whose lines *all* start with a bullet marker is taken at its
 * word and becomes the punktlista. Anything else is left alone as prose — a
 * paragraph that happens to open with a dash isn't a list, and one line isn't
 * either.
 */

/** A leading -, –, —, •, · or * plus the space after it. */
const BULLET = /^[-–—•·*]\s+/

const clean = (values: readonly string[] | undefined) =>
  (values ?? []).map((v) => v.trim()).filter(Boolean)

export function normalizeHighlight(highlight: ServiceHighlight): ServiceHighlight {
  const items = clean(highlight.items)
  if (items.length > 0) return { ...highlight, items }

  const lines = clean(highlight.text?.split('\n'))
  if (lines.length > 1 && lines.every((line) => BULLET.test(line))) {
    return { ...highlight, text: '', items: lines.map((line) => line.replace(BULLET, '')) }
  }

  return { ...highlight, items: [] }
}

/** Every band worth rendering, in order. A band with no rubrik has nothing to
 *  say, so it is dropped rather than rendered as a stray picture. */
export function normalizeHighlights(
  highlights: readonly ServiceHighlight[] | undefined
): ServiceHighlight[] {
  return (highlights ?? []).filter((h) => h.title?.trim()).map(normalizeHighlight)
}
