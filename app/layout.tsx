import type { Metadata } from 'next'
import { Open_Sans, Inter } from 'next/font/google'
import { siteConfig } from '@/config/site'

// Headings: Open Sans — the same face the wordmark is drawn in, so the logotype
// and every heading below it read as one voice. Body text stays Inter.
const heading = Open_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

// Body: Inter — clean, highly readable.
const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  // Resolves every relative URL below — and the canonical on /batrutor.
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
  },
}

/**
 * Document shell only — no navigation, footer, chat bubble or stylesheet.
 *
 * Those live in app/(site)/layout.tsx so the embedded Sanity Studio at /studio
 * renders on its own, without the site chrome on top of it. globals.css is
 * part of that chrome: it styles bare elements (body, h1–h6, a), and the
 * Studio renders in the same document, so loading it here painted the Studio's
 * own headings in the site's near-black navy — invisible against its dark
 * theme. It has its own typography and doesn't want ours.
 *
 * The fonts stay here: next/font defines the two CSS variables on <html>, and
 * they cost nothing on a route that never references them.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.lang} className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
