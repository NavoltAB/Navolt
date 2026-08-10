import type { Metadata } from 'next'
import { Source_Serif_4, Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ChatBubble from '@/components/ChatBubble'
import { getSiteSettings } from '@/sanity/queries'
import { siteConfig } from '@/config/site'

// Headings: Source Serif 4 — sturdy modern serif with low, even stroke contrast.
// Calm and trustworthy at display sizes (no fashion-serif thick/thin drama).
const heading = Source_Serif_4({
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()

  return (
    <html lang={siteConfig.lang} className={`${heading.variable} ${body.variable}`}>
      <body>
        <Navigation />
        <main>{children}</main>
        <Footer settings={settings} />
        <ChatBubble />
      </body>
    </html>
  )
}
