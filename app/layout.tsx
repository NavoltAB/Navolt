import type { Metadata } from 'next'
import { Open_Sans, Inter } from 'next/font/google'
import './globals.css'
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
 * Document shell only — no navigation, footer or chat bubble.
 *
 * Those live in app/(site)/layout.tsx so the embedded Sanity Studio at
 * /studio renders on its own, without the site chrome on top of it.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.lang} className={`${heading.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
