/**
 * Shared by the server page and the client shell, which is exactly why it lives
 * here and not in ProductsShell: every export of a `'use client'` module becomes
 * a client reference, so a server component that imported `isSortKey` from there
 * would get a proxy and throw the moment it called it.
 */

export const SORTS = [
  { key: 'utvalda', label: 'Utvalda först' },
  { key: 'nyast', label: 'Nyast' },
  { key: 'pris-lagst', label: 'Lägsta pris' },
  { key: 'pris-hogst', label: 'Högsta pris' },
] as const

export type SortKey = (typeof SORTS)[number]['key']

// Utvalda first is the default: it is the one order the customer controls from
// the studio, so the top of the grid is a shelf he has arranged rather than a
// side effect of whatever was typed in last. Newest stays available as an
// option — it is just no longer what a first-time visitor lands on. The default
// is also the one sort that never has to be written into the URL.
export const DEFAULT_SORT: SortKey = 'utvalda'

export function isSortKey(value: string | undefined): value is SortKey {
  return SORTS.some((s) => s.key === value)
}
