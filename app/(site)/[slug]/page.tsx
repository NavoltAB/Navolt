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
import ServiceGallery from '@/components/ServiceGallery'
import ServiceHighlights from '@/components/ServiceHighlights'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import FeatureList from '@/components/FeatureList'
import { normalizeFeatures } from '@/lib/featureIcons'
import { hasServicePage, serviceForms, serviceHref, servicePageCta } from '@/lib/services'
import { normalizeHighlights } from '@/lib/highlights'
import { parseYouTubeId } from '@/lib/youtube'
import {
  defaultServicePages,
  defaultServices,
  genericPageDefaults,
} from '@/lib/serviceContent'
import { siteConfig } from '@/config/site'
import { shareImage } from '@/lib/seo'

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
    pageLabel: text(service.pageLabel, fallback.pageLabel ?? 'Tjänst'),
    featuresLabel: text(service.featuresLabel, fallback.featuresLabel ?? 'Vad vi gör'),
    // The tile image is framed for a tall crop; in the page's 16:9 band the
    // subject often ends up half out of frame. A wide upload wins where the
    // editor has made one, and the tile image stands in where they haven't.
    leadImageUrl: text(service.pageImageUrl, service.imageUrl ?? ''),
    introLabel: text(service.introLabel, fallback.introLabel ?? 'Vad vi gör'),
    introTitle: text(service.introTitle, fallback.introTitle ?? service.title),
    // The document's rich text wins; without it the placeholder paragraphs
    // stand in, and without those the section is just the punch list.
    body: service.description?.length ? service.description : null,
    introParagraphs: service.description?.length ? [] : (fallback.introParagraphs ?? []),

    stepsLabel: text(service.stepsLabel, fallback.stepsLabel ?? 'Så går det till'),
    stepsTitle: text(service.stepsTitle, fallback.stepsTitle ?? 'Så går det till'),
    steps: list(service.steps, fallback.steps ?? []),

    // Several bands are allowed — båtrutor runs one for monteringspaketen and
    // one for rutpaketen. Normalising here means a punktlista typed into the
    // text field still comes out as a list; see lib/highlights.ts.
    highlights: normalizeHighlights(list(service.highlights, fallback.highlights ?? [])),

    // The id is parsed here rather than in the markup, so an unusable link
    // reads as "no video" in one place and the section simply doesn't render.
    video: {
      id: parseYouTubeId(service.videoUrl ?? fallback.video?.url),
      label: text(service.videoLabel, fallback.video?.label ?? ''),
      title: text(service.videoTitle, fallback.video?.title ?? ''),
      posterUrl: text(service.videoPosterUrl, fallback.video?.posterUrl ?? ''),
    },

    gallery: list(service.gallery, fallback.gallery ?? []),

    documentsLabel: text(service.documentsLabel, fallback.documentsLabel ?? 'Dokument'),
    documentsTitle: text(service.documentsTitle, fallback.documentsTitle ?? 'Ladda ner'),
    documentsText: text(service.documentsText, fallback.documentsText ?? ''),

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

  const { seoTitle: title, seoDescription: description, leadImageUrl } = content

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
      // The same picture the page leads with, cropped to the share aspect
      // rather than shipped at its upload size — some of these originals are
      // 6000×4000. See shareImage() in lib/seo.ts.
      ...(leadImageUrl
        ? { images: [{ url: shareImage(leadImageUrl)!, width: 1200, height: 630 }] }
        : {}),
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

  const { service, leadImageUrl } = content
  const hasIntro = Boolean(content.body) || content.introParagraphs.length > 0
  const hasFeatures = normalizeFeatures(service.features).length > 0
  const form = serviceForms[slug]
  const subject = encodeURIComponent(service.title)
  // The header's second button. "Alla tjänster" sends a visitor who has just
  // arrived on the page they were looking for back to the index, so a service
  // that has a better next step — the contact form, the phone — names it in
  // lib/services.ts and that wins here.
  const headerCta = servicePageCta[slug] ?? { label: 'Alla tjänster', href: '/tjanster' }

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
            <p className="section-label mb-3">{content.pageLabel}</p>
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
                  variant={form.variant}
                />
              ) : (
                <Link href={`/kontakt?amne=${subject}`} className="btn-primary">
                  Fråga om {service.title.toLowerCase()}
                </Link>
              )}
              {headerCta.href.startsWith('tel:') ? (
                <a href={headerCta.href} className="btn-outline">
                  {headerCta.label}
                </a>
              ) : (
                <Link href={headerCta.href} className="btn-outline">
                  {headerCta.label}
                </Link>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Lead image */}
      {leadImageUrl && (
        <section className="pt-12">
          <div className="container mx-auto px-6 max-w-container">
            <AnimatedSection>
              <div className="aspect-[16/9] rounded-lg overflow-hidden relative">
                <Image
                  src={leadImageUrl}
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

      {/* How it works */}
      {content.steps.length > 0 && (
        <section className="section">
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

            {/* The steps end on "so here's how it works" — the form is the
                next thing to do, so it's offered here rather than only in the
                header, where the visitor met it before reading any of this.
                Only for a service that has a form of its own; the rest already
                close on the CTA band at the foot of the page. */}
            {form && (
              <AnimatedSection delay={0.15} className="mt-14">
                <ServiceFormDialog
                  appId={form.appId}
                  label={form.label}
                  padded={form.padded}
                  variant={form.variant}
                />
              </AnimatedSection>
            )}
          </div>
        </section>
      )}

      {/* Body, then the spec list under it */}
      {/* Both sections carry the same background now, so their paddings stack
          into one 12rem gap. The steps' own bottom padding is enough air
          between the two — but only when the steps are there to provide it. */}
      <section className={`section ${content.steps.length > 0 ? 'pt-0' : ''}`}>
        <div className="container mx-auto px-6 max-w-container">
          {/* No copy written yet means no intro at all: the rubrik only
              repeated the H1 above it and the filler line under it said
              nothing the header hadn't already said. The punch list — now
              labelled "Vad vi gör" — carries the section on its own. */}
          {hasIntro && (
            <AnimatedSection>
              <p className="section-label mb-3">{content.introLabel}</p>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-6">
                {content.introTitle}
              </h2>
              {content.body ? (
                <div className="prose-sanity max-w-2xl">
                  <PortableText value={content.body} baseLevel={3} />
                </div>
              ) : (
                <div
                  className="space-y-5 text-base leading-relaxed max-w-2xl"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {content.introParagraphs.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              )}
            </AnimatedSection>
          )}

          {/* Under the copy rather than beside it: the list is as long as the
              service is broad, and in a side column it ran far past the text
              it was supposed to sit next to. */}
          {hasFeatures && (
            <AnimatedSection delay={0.1}>
              <div className={hasIntro ? 'mt-14 md:mt-16' : ''}>
                <h2 className="section-label mb-6">{content.featuresLabel}</h2>
                <FeatureList features={service.features} />
              </div>
            </AnimatedSection>
          )}

          {/* The list is the longest thing on the page — motorservice runs to
              four categories of it — and it ends exactly where the visitor has
              finished reading what the job includes. Rather than send them past
              "Andra tjänster" to find the band at the foot, the booking form is
              offered here, in the service's own words. Services without a form
              of their own get the contact form with the subject prefilled. */}
          {hasFeatures && (
            <AnimatedSection delay={0.15}>
              <div
                className="mt-14 md:mt-16 pt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <p
                  className="text-base leading-relaxed max-w-xl"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {form
                    ? 'Vill du boka in båten? Berätta vad som ska göras, så återkommer vi med en tid.'
                    : `Har du frågor om ${service.title.toLowerCase()}? Berätta vad du behöver hjälp med, så hör vi av oss.`}
                </p>
                <div className="shrink-0">
                  {form ? (
                    <ServiceFormDialog
                      appId={form.appId}
                      label={form.label}
                      padded={form.padded}
                      variant={form.variant}
                    />
                  ) : (
                    <Link href={`/kontakt?amne=${subject}`} className="btn-primary">
                      Fråga om {service.title.toLowerCase()}
                    </Link>
                  )}
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* Film. Directly under the body copy: it answers the same question in
          a different medium, and a visitor who wants to watch rather than read
          shouldn't have to reach the foot of the page to find out there was a
          film. Nothing is fetched from YouTube until play is pressed — see
          components/YouTubeEmbed.tsx. */}
      {content.video.id && (
        <section className="section pt-0">
          <div className="container mx-auto px-6 max-w-container">
            {(content.video.label || content.video.title) && (
              <AnimatedSection className="mb-8">
                {content.video.label && (
                  <p className="section-label mb-3">{content.video.label}</p>
                )}
                {content.video.title && (
                  <h2 className="font-heading text-3xl md:text-4xl font-semibold">
                    {content.video.title}
                  </h2>
                )}
              </AnimatedSection>
            )}
            <AnimatedSection delay={0.1}>
              <YouTubeEmbed
                id={content.video.id}
                title={content.video.title || `${service.title} — film`}
                poster={content.video.posterUrl || undefined}
              />
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Downloads — monteringsanvisningar, datablad, prislistor. Sits right
          under the body copy because it answers the same question the copy
          does, and nothing renders at all when the service has no files. */}
      {(service.documents?.length ?? 0) > 0 && (
        <section className="pb-4">
          <div className="container mx-auto px-6 max-w-container">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-x-20">
              <AnimatedSection>
                <p className="section-label mb-3">{content.documentsLabel}</p>
                <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-4">
                  {content.documentsTitle}
                </h2>
                {/* What the file is worth downloading for. Where it carries
                    the whole procedure, this is what saves the page from
                    retelling it in numbered steps above. */}
                {content.documentsText && (
                  <p
                    className="text-base leading-relaxed max-w-2xl mb-6"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {content.documentsText}
                  </p>
                )}
                <DocumentList documents={service.documents ?? []} />
              </AnimatedSection>
            </div>
          </div>
        </section>
      )}

      {/* Utvalda sektioner — monteringspaketen and rutpaketen under Båtrutor,
          and whatever the equivalent turns out to be for the others. A rubrik
          is what turns a band on; without one there's nothing to say. */}
      <ServiceHighlights highlights={content.highlights} />

      {/* Gallery — a carousel rather than a three-up grid. The grid capped the
          page at three photos; a service with eight pictures of its work
          should be able to show them. On desktop the carousel still shows
          three at a time and pages through the rest. */}
      {content.gallery.length > 0 && (
        <section className="section pt-0">
          <div className="container mx-auto px-6 max-w-container">
            <AnimatedSection>
              <ServiceGallery
                photos={content.gallery}
                label={`Bilder — ${service.title}`}
              />
            </AnimatedSection>
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
