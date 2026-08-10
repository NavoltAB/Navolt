import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ChatBubble from '@/components/ChatBubble'
import { getSiteSettings } from '@/sanity/queries'

/**
 * Chrome for the public site. The (site) group keeps this off /studio and
 * /api — route groups don't appear in the URL, so every path is unchanged.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer settings={settings} />
      <ChatBubble />
    </>
  )
}
