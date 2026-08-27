/**
 * Shared by the server page and the client shell, which is exactly why it lives
 * here and not in ProductsShell: every export of a `'use client'` module becomes
 * a client reference, so a server component that imported `isSortKey` from there
 * would get a proxy and throw the moment it called it.
 */

export const SORTS = [
  { key: 'nyast', label: 'Nyast' },
  { key: 'pris-lagst', label: 'Lägsta pris' },
  { key: 'pris-hogst', label: 'Högsta pris' },
] as const

export type SortKey = (typeof SORTS)[number]['key']

// Newest first is the useful default for a catalogue that is being filled in:
// whatever the customer just added in the studio is what he wants to see on the
// page. It is also the one sort that never has to be written into the URL.
export const DEFAULT_SORT: SortKey = 'nyast'

export function isSortKey(value: string | undefined): value is SortKey {
  return SORTS.some((s) => s.key === value)
}
