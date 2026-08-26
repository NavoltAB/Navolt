import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ChatBubble from '@/components/ChatBubble'
import CookieBanner from '@/components/CookieBanner'
import { CartProvider } from '@/context/CartContext'
import { CookieConsentProvider } from '@/context/CookieConsentContext'
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
    // Consent wraps everything, because the chat bubble and the widgets inside
    // the pages all read it before they load a single third-party byte.
    <CookieConsentProvider>
      <CartProvider>
        <Navigation />
        <main>{children}</main>
        <Footer settings={settings} blurb={homePage?.heroSubtitle} />
        <ChatBubble />
        <CookieBanner />
      </CartProvider>
    </CookieConsentProvider>
  )
}
