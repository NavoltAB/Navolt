import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
  getSiteSettings,
} from '@/sanity/queries'
import { text } from '@/sanity/fallback'
import { urlFor } from '@/sanity/imageUrl'
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/AnimatedSection'
import PageTransition from '@/components/PageTransition'
import ProductCard from '@/components/ProductCard'
import { siteConfig } from '@/config/site'
import AddToCart from './AddToCart'
import PortableText from './PortableText'
import ProductGallery from './ProductGallery'

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs.filter((s) => s.slug).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}

  const image = product.images?.[0]
  return {
    title: product.name,
    description:
      product.shortDescription ||
      `${product.name} — ${siteConfig.legalName}, marinelektronik i Göteborg och Öckerö.`,
    openGraph: image
      ? { images: [urlFor(image).width(1200).height(630).fit('crop').url()] }
      : undefined,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [related, settings] = await Promise.all([
    getRelatedProducts(slug, product.category?.slug ?? null),
    getSiteSettings(),
  ])

  const phone = text(settings?.phone, siteConfig.contact.phone)
  const phoneHref = `tel:${phone.replace(/[^0-9+]/g, '')}`

  const images = product.images ?? []
  // Contained rather than cropped, so the source aspect is preserved and the
  // gallery box does the framing. See ProductGallery for why.
  const full = images.map((img) => urlFor(img).width(1100).quality(88).url())
  const thumbs = images.map((img) => urlFor(img).width(180).quality(75).url())
  const cartImage = images[0]
    ? urlFor(images[0]).width(160).height(160).fit('crop').url()
    : undefined

  const details = product.productDetails ?? []

  return (
    <PageTransition>
      <div className="pt-32 pb-20" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto max-w-container px-6">
          <nav
            aria-label="Brödsmulor"
            className="mb-10 flex min-w-0 items-center gap-2 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Link href="/produkter" className="shrink-0 transition-colors hover:text-primary">
              Produkter
            </Link>
            {product.category && (
              <>
                <span aria-hidden className="shrink-0 opacity-50">/</span>
                <Link
                  href={`/produkter?kategori=${product.category.slug}`}
                  className="hidden shrink-0 transition-colors hover:text-primary sm:inline"
                >
                  {product.category.title}
                </Link>
              </>
            )}
            <span aria-hidden className="shrink-0 opacity-50">/</span>
            <span className="truncate" style={{ color: 'var(--color-text)' }}>
              {product.name}
            </span>
          </nav>

          {/* No `items-start` here on purpose. Grid items stretch by default,
              which is what gives the left column the full height of the row —
              and a sticky child can only travel inside its parent's box. Pin the
              column to its content and the gallery has nowhere to stick to.
              Same reason /tjanster wraps its rail in a stretched <aside>. */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
            <AnimatedSection direction="left">
              {full.length > 0 ? (
                <ProductGallery
                  images={full}
                  thumbs={thumbs}
                  productName={product.name}
                  inStock={product.inStock}
                />
              ) : (
                <div
                  className="flex aspect-square items-center justify-center lg:sticky lg:top-32"
                  style={{
                    background:
                      'linear-gradient(150deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span
                    className="select-none font-heading font-semibold"
                    style={{
                      fontSize: 'clamp(4rem, 12vw, 8rem)',
                      color: 'rgba(255,255,255,0.08)',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {product.name.charAt(0)}
                  </span>
                </div>
              )}
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.08}>
              {product.category && (
                <Link
                  href={`/produkter?kategori=${product.category.slug}`}
                  className="section-label transition-opacity hover:opacity-70"
                >
                  {product.category.title}
                </Link>
              )}

              <h1
                className="mt-3 font-heading font-semibold"
                style={{
                  fontSize: 'clamp(1.9rem, 3.4vw, 2.75rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  color: 'var(--color-primary)',
                }}
              >
                {product.name}
              </h1>

              <span
                aria-hidden
                className="my-6 block h-px w-16"
                style={{ background: 'var(--color-gold)' }}
              />

              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-3">
                {product.price != null ? (
                  <p
                    className="font-heading font-semibold tabular-nums"
                    style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-primary)' }}
                  >
                    {product.price.toLocaleString('sv-SE')} kr
                    {product.unit && (
                      <span
                        className="ml-1.5 text-base font-normal"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        / {product.unit}
                      </span>
                    )}
                  </p>
                ) : (
                  <p
                    className="font-heading font-semibold"
                    style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-primary)' }}
                  >
                    Pris på förfrågan
                  </p>
                )}

                <span
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em]"
                  style={{
                    color: product.inStock
                      ? 'var(--color-success)'
                      : 'var(--color-text-muted)',
                  }}
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: product.inStock
                        ? 'var(--color-success)'
                        : 'var(--color-text-muted)',
                    }}
                  />
                  {product.inStock ? 'I lager' : 'Slut i lager'}
                </span>
              </div>

              {product.description && product.description.length > 0 ? (
                <div className="prose-sanity mt-7">
                  <PortableText value={product.description} />
                </div>
              ) : product.shortDescription ? (
                <p
                  className="mt-7 leading-relaxed"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {product.shortDescription}
                </p>
              ) : null}

              <div className="mt-8">
                <AddToCart
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  unit={product.unit}
                  image={cartImage}
                  inStock={product.inStock}
                />
              </div>

              {/* The parts Navolt sells are the ones they install, so "will this
                  fit my boat" is the real question behind most enquiries. The
                  phone sits directly under the basket rather than at the foot of
                  the page. */}
              <a
                href={phoneHref}
                className="group mt-6 flex items-center gap-3.5 pt-6"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 group-hover:bg-[var(--color-gold)] group-hover:text-white"
                  style={{ background: 'rgba(192,138,62,0.12)', color: 'var(--color-gold-ink)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span
                    className="block text-xs uppercase tracking-[0.14em]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Osäker på om den passar?
                  </span>
                  <span
                    className="block font-heading font-semibold"
                    style={{ fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}
                  >
                    Ring {phone}
                  </span>
                </span>
              </a>

              {details.length > 0 && (
                <div className="mt-10">
                  <p className="section-label mb-4">Specifikation</p>
                  <StaggerContainer>
                    <dl>
                      {details.map((detail, i) => (
                        <StaggerItem key={`${detail.label}-${i}`}>
                          <div
                            className="flex items-baseline justify-between gap-6 py-3.5"
                            style={{ borderTop: '1px solid var(--color-border)' }}
                          >
                            <dt className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                              {detail.label}
                            </dt>
                            <dd className="text-right text-sm font-medium">{detail.value}</dd>
                          </div>
                        </StaggerItem>
                      ))}
                    </dl>
                  </StaggerContainer>
                </div>
              )}
            </AnimatedSection>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <div className="container mx-auto max-w-container px-6">
            <AnimatedSection className="mb-10">
              <p className="section-label mb-3">Mer i sortimentet</p>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <h2 className="section-title">Andra delar</h2>
                <Link href="/produkter" className="btn-outline shrink-0">
                  Alla produkter
                </Link>
              </div>
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <StaggerItem key={item._id} className="h-full">
                  <ProductCard product={item} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}
    </PageTransition>
  )
}
