import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAllServices, getTjansterPage } from '@/sanity/queries'
import { text } from '@/sanity/fallback'
import AnimatedSection from '@/components/AnimatedSection'
import PageTransition from '@/components/PageTransition'
import ServiceIndexRail from '@/components/ServiceIndexRail'
import ServiceFormDialog from '@/components/ServiceFormDialog'
import { hasServicePage, serviceForms, serviceHref, servicePanelCta } from '@/lib/services'
import { defaultServices } from '@/lib/serviceContent'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Tjänster',
  description:
    'Marinelektronik, elsystem i campervan, motorservice och båtrutor. Navolt hjälper dig med elen ombord i Göteborg och Öckerö.',
}

// The page's own framing text, editable in Sanity under "Tjänstesida". The
// services listed between these two blocks come from `service` documents —
// see `defaultServices` above for what stands in until any exist.
const defaults = {
  pageLabel: 'Vad vi gör',
  pageTitle: 'Tjänster',
  pageSubtitle:
    'El och elektronik ombord — i båt, husbil och campervan. Berätta vad som krånglar eller vad du vill bygga, så återkommer vi med en bedömning.',
  serviceCtaPrefix: 'Fråga om',
  ctaLabel: 'Osäker?',
  ctaTitle: 'Vet du inte vad felet är?',
  ctaText:
    'Det är helt okej — det är ofta därför man ringer en elektriker. Beskriv symptomen så gott du kan, så hör vi av oss och reder ut resten tillsammans.',
  ctaButtonLabel: 'Kontakta oss',
} as const

/**
 * The panel's 16:9 image band — a link to the service's page when there is
 * one, and the same box without a link when there isn't.
 *
 * `group` regardless, so the hover on the picture belongs to the frame and
 * doesn't have to be repeated on both branches.
 */
function ImageFrame({
  href,
  children,
}: {
  href: string | null
  children: React.ReactNode
}) {
  const className = 'group block aspect-[16/9] rounded-lg overflow-hidden relative mb-10'
  return href ? (
    <Link href={href} className={className} tabIndex={-1} aria-hidden="true">
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  )
}

export default async function ServicesPage() {
  const [sanityServices, page] = await Promise.all([getAllServices(), getTjansterPage()])
  const services = sanityServices.length > 0 ? sanityServices : defaultServices
  const serviceCtaPrefix = text(page?.serviceCtaPrefix, defaults.serviceCtaPrefix)

  return (
    <PageTransition>
      {/* Header */}
      <div className="pt-32 pb-16" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container">
          <AnimatedSection>
            <p className="section-label mb-3">{text(page?.pageLabel, defaults.pageLabel)}</p>
            <h1 className="section-title mb-5">{text(page?.pageTitle, defaults.pageTitle)}</h1>
            <p className="section-subtitle">
              {text(page?.pageSubtitle, defaults.pageSubtitle)}
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Services — sticky index rail beside stacked detail panels */}
      <section className="section">
        <div className="container mx-auto px-6 max-w-container">
          <div className="grid lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-x-20">
            <aside className="hidden lg:block">
              <div className="sticky top-32">
                <ServiceIndexRail
                  items={services.map((service) => ({
                    id: service.slug ?? service._id,
                    title: service.title,
                  }))}
                />
              </div>
            </aside>

            <div className="space-y-24 lg:space-y-32">
              {services.map((service, index) => {
                const key = service.slug ?? service._id
                const form = serviceForms[key]
                // A second button named for this service in particular —
                // "Se rutpaket" for båtrutor, the contact form for campervan —
                // in place of whatever the panel would have offered by itself.
                const cta = servicePanelCta[key]
                // Wide band, so the wide upload wins here as it does at the
                // top of the service's own page.
                const panelImageUrl = service.pageImageUrl || service.imageUrl
                // A panel reads as a card, and a card's picture and title are
                // clicked by reflex. Null for a service whose slug is reserved:
                // it has no page of its own, so there is nothing to link to.
                const href = hasServicePage(service.slug) ? serviceHref(service.slug) : null
                return (
                <AnimatedSection key={service._id}>
                  <article id={service.slug ?? service._id} className="scroll-mt-32">
                    {/* The picture repeats the heading's link, so it's taken
                        out of the tab order and hidden from screen readers —
                        one stop and one announcement per destination. */}
                    <ImageFrame href={href}>
                      {panelImageUrl ? (
                        <Image
                          src={panelImageUrl}
                          alt={service.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 800px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%)`,
                            opacity: 0.5 + index * 0.1,
                          }}
                        >
                          <span className="font-heading text-xl text-white font-semibold opacity-40">
                            {service.title}
                          </span>
                        </div>
                      )}
                    </ImageFrame>

                    {/* Number and rule — the panel's masthead */}
                    <div className="flex items-center gap-4 mb-4">
                      <span
                        className="font-heading text-xs tabular-nums tracking-[0.18em]"
                        style={{ color: 'var(--color-gold-ink)' }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
                    </div>

                    <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-5">
                      {href ? (
                        <Link href={href} className="group/title relative inline-block">
                          {service.title}
                          {/* Brass rule, drawn from the left on hover — the
                              same gesture, easing and duration as the tiles on
                              the landing page and the product cards. */}
                          <span
                            aria-hidden
                            className="absolute left-0 -bottom-1 block h-[2px] w-full origin-left scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/title:scale-x-100 group-focus-visible/title:scale-x-100"
                            style={{ background: 'var(--color-gold)' }}
                          />
                        </Link>
                      ) : (
                        service.title
                      )}
                    </h2>
                    {/* Kort beskrivning only. "Vad ingår" used to be listed
                        here too, which made every panel as long as a page of
                        its own and left the visitor nothing to click through
                        for — the full list lives on the service's page. */}
                    {service.shortDescription && (
                      <p className="section-subtitle mb-10 max-w-2xl">{service.shortDescription}</p>
                    )}

                    {/* With a form of its own, the panel opens it in place.
                        Without one, the link carries the service through so the
                        contact form's "Ämne" arrives filled in. */}
                    {/* Two buttons on every panel: read on, or get in touch.
                        The panel is a teaser and hands the visitor over — the
                        long copy lives on the service's own page, so the two
                        don't say the same thing in two places Google indexes —
                        but it never costs a click that used to convert, so the
                        second button is the service's booking form where there
                        is one and the contact form where there isn't. */}
                    <div className="flex flex-wrap gap-3">
                      {hasServicePage(service.slug) && (
                        <Link href={serviceHref(service.slug)} className="btn-primary">
                          Läs mer om {service.title.toLowerCase()}
                        </Link>
                      )}
                      {cta ? (
                        <Link
                          href={cta.href}
                          className={cta.variant === 'primary' ? 'btn-primary' : 'btn-outline'}
                        >
                          {cta.label}
                        </Link>
                      ) : form ? (
                        <ServiceFormDialog
                          appId={form.appId}
                          label={form.label}
                          padded={form.padded}
                          variant={form.variant}
                        />
                      ) : (
                        <Link
                          href={`/kontakt?amne=${encodeURIComponent(service.title)}`}
                          className="btn-outline"
                        >
                          {serviceCtaPrefix} {service.title.toLowerCase()}
                        </Link>
                      )}
                    </div>
                  </article>
                </AnimatedSection>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container text-center">
          <AnimatedSection>
            <p className="section-label mb-4">{text(page?.ctaLabel, defaults.ctaLabel)}</p>
            <h2 className="section-title mb-5">{text(page?.ctaTitle, defaults.ctaTitle)}</h2>
            <p className="section-subtitle mx-auto mb-8">
              {text(page?.ctaText, defaults.ctaText)}
            </p>
            <Link href="/kontakt" className="btn-primary">
              {text(page?.ctaButtonLabel, defaults.ctaButtonLabel)}
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </PageTransition>
  )
}
