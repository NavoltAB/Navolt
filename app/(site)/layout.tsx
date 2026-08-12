import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ChatBubble from '@/components/ChatBubble'
import { CartProvider } from '@/context/CartContext'
import { getHomePage, getSiteSettings } from '@/sanity/queries'

/**
 * Chrome for the public site. The (site) group keeps this off /studio and
 * /api — route groups don't appear in the URL, so every path is unchanged.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // The footer's blurb is the landing page's hero subtitle — one sentence, one
  // field, edited under "Startsida" and shown at the bottom of every page.
  const [settings, homePage] = await Promise.all([getSiteSettings(), getHomePage()])

  // The basket lives above the header and the pages, since both read it: the
  // header shows the count, /offert renders the contents.
  return (
    <CartProvider>
      <Navigation />
      <main>{children}</main>
      <Footer settings={settings} blurb={homePage?.heroSubtitle} />
      <ChatBubble />
    </CartProvider>
  )
}
