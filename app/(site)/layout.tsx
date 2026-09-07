import '../globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ChatBubble from '@/components/ChatBubble'
import CookieBanner from '@/components/CookieBanner'
import { CartProvider } from '@/context/CartContext'
import { CookieConsentProvider } from '@/context/CookieConsentContext'
import { getAllServices, getHomePage, getSiteSettings } from '@/sanity/queries'
import { hasServicePage, serviceHref } from '@/lib/services'

/**
 * Chrome for the public site — including its stylesheet. The (site) group keeps
 * all of it off /studio and /api; route groups don't appear in the URL, so
 * every path is unchanged.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // The footer's blurb is the landing page's hero subtitle — one sentence, one
  // field, edited under "Startsida" and shown at the bottom of every page.
  const [settings, homePage, services] = await Promise.all([
    getSiteSettings(),
    getHomePage(),
    getAllServices(),
  ])

  // The header's Tjänster dropdown. Built here rather than in the header so
  // the nav stays a client component that knows nothing about Sanity, and a
  // service whose slug can't be a URL keeps its panel on /tjanster instead of
  // advertising a link that goes somewhere else.
  const navServices = services
    .filter((service) => hasServicePage(service.slug))
    .map((service) => ({
      title: service.title,
      href: serviceHref(service.slug),
      description: service.shortDescription,
    }))

  // The basket lives above the header and the pages, since both read it: the
  // header shows the count, /varukorg renders the contents.
  return (
    // Consent wraps everything, because the chat bubble and the widgets inside
    // the pages all read it before they load a single third-party byte.
    <CookieConsentProvider>
      <CartProvider>
        <Navigation services={navServices} />
        <main>{children}</main>
        <Footer settings={settings} blurb={homePage?.heroSubtitle} />
        <ChatBubble />
        <CookieBanner />
      </CartProvider>
    </CookieConsentProvider>
  )
}
