import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

/**
 * Metadata for /varukorg.
 *
 * The page itself is `'use client'` — the basket lives in localStorage, so
 * there is nothing for the server to render — and a client component cannot
 * export `metadata`. This layout is the seam: it adds nothing to the markup
 * and exists only to give the route a title and its robots directive.
 *
 * `noindex, follow`: a checkout step with an empty basket is a dead end in a
 * search result, but the links out of it — back to the catalogue, to
 * köpvillkoren — are worth following. Without this the page inherited the
 * site's default title and presented itself as the homepage.
 *
 * The matching half of this lives in app/robots.ts, which deliberately does
 * *not* disallow /varukorg: a crawler that may not fetch the page never reads
 * the tag below.
 */
export const metadata: Metadata = pageMetadata({
  path: '/varukorg',
  title: 'Varukorg',
  description:
    'Din varukorg hos Navolt. Kontrollera beställningen och fyll i dina uppgifter, så återkommer vi med en bekräftelse.',
  noindex: true,
})

export default function VarukorgLayout({ children }: { children: React.ReactNode }) {
  return children
}
