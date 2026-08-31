import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllServices, getServiceBySlug } from '@/sanity/queries'
import { text, list } from '@/sanity/fallback'
import AnimatedSection from '@/components/AnimatedSection'
import PageTransition from '@/components/PageTransition'
import ServiceFormDialog from '@/components/ServiceFormDialog'
import PortableText from '@/app/(site)/produkter/[slug]/PortableText'
import DocumentList from '@/components/DocumentList'
import { hasServicePage, serviceForms, serviceHref } from '@/lib/services'
import {
  defaultServicePages,
  defaultServices,
  genericPageDefaults,
} from '@/lib/serviceContent'
import { siteConfig } from '@/config/site'

/**
 * A service's own page, at the top level — /batrutor, /motorservice,
 * /campervan, /marinelektronik. The old site used these exact URLs and they
 * carry its rankings, so they stay flat rather than moving under /tjanster/.
 *
 * One template for every service: the `service` document carries the whole
 * page, section by section, and a section with nothing in it is left out
 * rather than rendered empty. Placeholder copy lives in lib/serviceContent.ts,
 * keyed by slug — which is also what keeps these pages standing with no Sanity
 * project configured at all.
 *
 * Being the top-level dynamic segment, this route catches every unknown path
 * on the site — hence notFound() rather than an empty page.
 */

export const revalidate = 60

export async function generateStaticParams() {
  const services = await getAllServices()
  const slugs = services.length > 0 ? services.map((s) => s.slug) : defaultServices.map((s) => s.slug)
  return slugs.filter(hasServicePage).map((slug) => ({ slug: slug as string }))
}

/**
 * The document reconciled against the placeholders, in one place.
 *
 * `generateMetadata` and the component both read this, and Next dedupes the
 * fetches within a render — so the merge rules are written once and can't
 * drift between the markup and the `<head>`.
 */
async function getContent(slug: string) {
  const service =
    (await getServiceBySlug(slug)) ?? defaultServices.find((s) => s.slug === slug) ?? null
  if (!service) return null

  const fallback = defaultServicePages[slug] ?? {}
  const cta = { ...genericPageDefaults, ...fallback }

  return {
    service,
    seoTitle: text(service.seoTitle, fallback.seoTitle ?? service.title),
    seoDescription: text(
      service.seoDescription,
      fallback.seoDescription ?? service.shortDescription ?? ''
    ),
    introLabel: text(service.introLabel, fallback.introLabel ?? 'Vad vi gör'),
    introTitle: text(service.introTitle, fallback.introTitle ?? service.title),
    // The document's rich text wins; without it the placeholder paragraphs
    // stand in, and without those the section is just the punch list.
    body: service.description?.length ? service.description : null,
    introParagraphs: service.description?.length ? [] : (fallback.introParagraphs ?? []),

    stepsLabel: text(service.stepsLabel, fallback.stepsLabel ?? 'Så går det till'),
    stepsTitle: text(service.stepsTitle, fallback.stepsTitle ?? 'Så går det till'),
    steps: list(service.steps, fallback.steps ?? []),

    highlight: {
      imageUrl: text(service.highlightImageUrl, fallback.highlight?.imageUrl ?? ''),
      label: text(service.highlightLabel, fallback.highlight?.label ?? ''),
      title: text(service.highlightTitle, fallback.highlight?.title ?? ''),
      body: text(service.highlightText, fallback.highlight?.text ?? ''),
      ctaLabel: text(service.highlightCtaLabel, fallback.highlight?.ctaLabel ?? ''),
      ctaHref: text(service.highlightCtaHref, fallback.highlight?.ctaHref ?? ''),
    },

    gallery: list(service.gallery, fallback.gallery ?? []),

    ctaLabel: text(service.ctaLabel, cta.ctaLabel ?? ''),
    ctaTitle: text(service.ctaTitle, cta.ctaTitle ?? ''),
    ctaText: text(service.ctaText, cta.ctaText ?? ''),
    ctaButtonLabel: text(service.ctaButtonLabel, cta.ctaButtonLabel ?? 'Kontakta oss'),
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (!hasServicePage(slug)) return {}
  const content = await getContent(slug)
  if (!content) return {}

  const { service, seoTitle: title, seoDescription: description } = content

  return {
    title,
    // An empty description is left off entirely rather than shipped blank —
    // Google writes a better one from the page than an empty tag allows.
    ...(description ? { description } : {}),
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      url: `/${slug}`,
      ...(service.imageUrl ? { images: [service.imageUrl] } : {}),
    },
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // A reserved slug can't be a service page even if a document claims it, so
  // it 404s here rather than shadowing the real route's content.
  if (!hasServicePage(slug)) notFound()

  const [content, allServices] = await Promise.all([getContent(slug), getAllServices()])
  if (!content) notFound()

  const { service, highlight } = content
  const form = serviceForms[slug]
  const subject = encodeURIComponent(service.title)

  // The row at the foot of the page — every other service that has a page,
  // which is what keeps these linked to each other without the header having
  // to carry them all.
  const others = (allServices.length > 0 ? allServices : defaultServices).filter(
    (s) => s.slug !== slug && hasServicePage(s.slug)
  )

  return (
    <PageTransition>
      {/* Header */}
      <div className="pt-32 pb-16" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container">
          <AnimatedSection>
            <p className="section-label mb-3">Tjänst</p>
            <h1 className="section-title mb-5">{service.title}</h1>
            {service.shortDescription && (
              <p className="section-subtitle mb-8">{service.shortDescription}</p>
            )}
            <div className="flex flex-wrap gap-3">
              {form ? (
                <ServiceFormDialog
                  appId={form.appId}
                  label={form.label}
                  padded={form.padded}
                />
              ) : (
                <Link href={`/kontakt?amne=${subject}`} className="btn-primary">
                  Fråga om {service.title.toLowerCase()}
                </Link>
              )}
              <Link href="/tjanster" className="btn-outline">
                Alla tjänster
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Lead image */}
      {service.imageUrl && (
        <section className="pt-12">
          <div className="container mx-auto px-6 max-w-container">
            <AnimatedSection>
              <div className="aspect-[16/9] rounded-lg overflow-hidden relative">
                <Image
                  src={service.imageUrl}
                  alt={`${service.title} — ${siteConfig.name}`}
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  className="object-cover"
                />
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Body beside the spec list */}
      <section className="section">
        <div className="container mx-auto px-6 max-w-container">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-x-20 gap-y-12">
            <AnimatedSection>
              <p className="section-label mb-3">{content.introLabel}</p>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-6">
                {content.introTitle}
              </h2>
              {content.body ? (
                <div className="prose-sanity max-w-2xl">
                  <PortableText value={content.body} />
                </div>
              ) : content.introParagraphs.length > 0 ? (
                <div
                  className="space-y-5 text-base leading-relaxed max-w-2xl"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {content.introParagraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                // Nothing written yet. Repeating the teaser would put the same
                // sentence on the page twice, so the header carries it alone.
                <p
                  className="text-base leading-relaxed max-w-2xl"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Berätta vad du vill få gjort, så återkommer vi med en bedömning.
                </p>
              )}
            </AnimatedSection>

            {service.features && service.features.length > 0 && (
              <AnimatedSection delay={0.1}>
                <ul>
                  {service.features.map((f, i) => (
                    <li
                      key={i}
                      className="py-3 text-sm border-t"
                      style={{
                        color: 'var(--color-text-muted)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* Downloads — monteringsanvisningar, datablad, prislistor. Sits right
          under the body copy because it answers the same question the copy
          does, and nothing renders at all when the service has no files. */}
      {(service.documents?.length ?? 0) > 0 && (
        <section className="pb-4">
          <div className="container mx-auto px-6 max-w-container">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-x-20">
              <AnimatedSection>
                <p className="section-label mb-3">Dokument</p>
                <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-4">
                  Ladda ner
                </h2>
                <DocumentList documents={service.documents ?? []} />
              </AnimatedSection>
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      {content.steps.length > 0 && (
        <section className="section" style={{ background: 'var(--color-surface)' }}>
          <div className="container mx-auto px-6 max-w-container">
            <AnimatedSection>
              <p className="section-label mb-3">{content.stepsLabel}</p>
              <h2 className="section-title mb-12">{content.stepsTitle}</h2>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
              {content.steps.map((step, index) => (
                <AnimatedSection key={`${step.title}-${index}`} delay={index * 0.08}>
                  <div className="flex items-center gap-4 mb-4">
                    <span
                      className="font-heading text-xs tabular-nums tracking-[0.18em]"
                      style={{ color: 'var(--color-gold-ink)' }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="h-px flex-1"
                      style={{ background: 'var(--color-border)' }}
                    />
                  </div>
                  <h3 className="font-heading text-lg font-semibold mb-2">{step.title}</h3>
                  {step.text && (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {step.text}
                    </p>
                  )}
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Highlight band — monteringspaketen under Båtrutor, and whatever the
          equivalent turns out to be for the others. A title is what turns it
          on; without one there's nothing to say here. */}
      {highlight.title && (
        <section className="section">
          <div className="container mx-auto px-6 max-w-container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {highlight.imageUrl && (
                <AnimatedSection>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                    <Image
                      src={highlight.imageUrl}
                      alt={highlight.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 600px"
                      className="object-cover"
                    />
                  </div>
                </AnimatedSection>
              )}

              <AnimatedSection delay={0.1}>
                {highlight.label && (
                  <p className="section-label mb-3">{highlight.label}</p>
                )}
                <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-5">
                  {highlight.title}
                </h2>
                {highlight.body && (
                  <p
                    className="text-base leading-relaxed mb-8"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {highlight.body}
                  </p>
                )}
                {highlight.ctaLabel && highlight.ctaHref && (
                  <Link href={highlight.ctaHref} className="btn-gold">
                    {highlight.ctaLabel}
                  </Link>
                )}
              </AnimatedSection>
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {content.gallery.length > 0 && (
        <section className="pb-4">
          <div className="container mx-auto px-6 max-w-container">
            <div className="grid sm:grid-cols-3 gap-5">
              {content.gallery.map((photo, index) => (
                <AnimatedSection key={photo.url} delay={index * 0.08}>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                    <Image
                      src={photo.url}
                      alt={photo.alt ?? ''}
                      fill
                      sizes="(max-width: 640px) 100vw, 400px"
                      className="object-cover"
                    />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* The other services */}
      {others.length > 0 && (
        <section className="section" style={{ background: 'var(--color-surface)' }}>
          <div className="container mx-auto px-6 max-w-container">
            <AnimatedSection>
              <p className="section-label mb-3">Mer från oss</p>
              <h2 className="section-title mb-10">Andra tjänster</h2>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {others.map((other, index) => (
                <AnimatedSection key={other._id} delay={index * 0.08}>
                  <Link
                    href={serviceHref(other.slug)}
                    className="card group flex h-full flex-col p-6"
                  >
                    <h3 className="font-heading text-xl font-semibold mb-3">
                      {other.title}
                    </h3>
                    {other.shortDescription && (
                      <p
                        className="text-sm leading-relaxed mb-5"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {other.shortDescription}
                      </p>
                    )}
                    <span
                      className="mt-auto text-sm font-medium transition-colors duration-200"
                      style={{ color: 'var(--color-gold-ink)' }}
                    >
                      Läs mer om {other.title.toLowerCase()} →
                    </span>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section">
        <div className="container mx-auto px-6 max-w-container text-center">
          <AnimatedSection>
            {content.ctaLabel && <p className="section-label mb-4">{content.ctaLabel}</p>}
            {content.ctaTitle && <h2 className="section-title mb-5">{content.ctaTitle}</h2>}
            {content.ctaText && (
              <p className="section-subtitle mx-auto mb-8">{content.ctaText}</p>
            )}
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href={`/kontakt?amne=${subject}`} className="btn-primary">
                {content.ctaButtonLabel}
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
