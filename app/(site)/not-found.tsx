import Link from 'next/link'
import AnimatedSection from '@/components/AnimatedSection'
import PageTransition from '@/components/PageTransition'
import { siteConfig } from '@/config/site'

/**
 * 404, inside the site's own chrome.
 *
 * Every unknown single-segment path reaches app/(site)/[slug] and calls
 * notFound(), which resolves to this boundary — so a mistyped URL or a dead
 * link from the old site lands on a branded page with the navigation still on
 * it, rather than on Next's bare default.
 *
 * It has to live inside the (site) group: that's where the stylesheet and the
 * chrome are loaded (see ./layout.tsx), and a not-found at the app root would
 * render without either.
 */
export default function NotFound() {
  return (
    <PageTransition>
      <section className="section pt-40">
        <div className="container mx-auto px-6 max-w-container text-center">
          <AnimatedSection>
            <p className="section-label mb-4">404</p>
            <h1 className="section-title mb-5">Sidan finns inte</h1>
            <p className="section-subtitle mx-auto mb-8">
              Länken kan vara gammal, eller så har sidan bytt adress. Prova våra tjänster
              eller sortimentet — hittar du ändå inte rätt, hör av dig så hjälper vi till.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/" className="btn-primary">
                Till startsidan
              </Link>
              <Link href="/tjanster" className="btn-outline">
                Våra tjänster
              </Link>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
                className="btn-outline"
              >
                {siteConfig.contact.phone}
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </PageTransition>
  )
}
