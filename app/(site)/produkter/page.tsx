import type { Metadata } from 'next'
import Link from 'next/link'
import {
  getAllProducts,
  getAllCategories,
  getAllBoatModels,
  getProductsPage,
} from '@/sanity/queries'
import { text } from '@/sanity/fallback'
import AnimatedSection from '@/components/AnimatedSection'
import PageTransition from '@/components/PageTransition'
import ProductsHero from './ProductsHero'
import ProductsShell from './ProductsShell'
import { pageMetadata } from '@/lib/seo'
import { DEFAULT_SORT, isSortKey } from './sort'

export const revalidate = 60

// Editable in Sanity under "Produktsida". These render until someone fills the
// fields in — the page has to stand up with no Sanity project configured.
// PLACEHOLDER COPY, awaiting the customer's own description of the catalogue.
const defaults = {
  pageLabel: 'Sortiment',
  pageTitle: 'Produkter',
  pageSubtitle:
    'Delar och komponenter vi arbetar med ombord — i båt, husbil och campervan. Söker du något som inte ligger uppe här, hör av dig så tittar vi på det.',
  ctaLabel: 'Hittar du inte rätt?',
  ctaTitle: 'Vi tar fram delen åt dig',
  ctaText:
    'Sortimentet här är ett urval. Beskriv vad du har ombord och vad du vill få gjort, så återkommer vi med förslag och pris.',
  ctaButtonLabel: 'Kontakta oss',
} as const

export const metadata: Metadata = pageMetadata({
  path: '/produkter',
  title: 'Rutpaket & monteringspaket för båt',
  description:
    'Köp rutpaket, monteringspaket och tillbehör för utvalda båtmodeller. Hitta båtrutor och delar för utanpåliggande montage hos Navolt.',
})

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    kategori?: string
    modell?: string
    sortera?: string
    sok?: string
  }>
}) {
  const { kategori, modell, sortera, sok } = await searchParams
  const [products, categories, boatModels, page] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getAllBoatModels(),
    getProductsPage(),
  ])

  // Read once here and handed to the client as starting values — from then on
  // the filters live on the client so they can animate. Unknown or stale values
  // are dropped rather than deep-linking into an empty grid: a model that was
  // deleted in the studio should leave a working page behind, not a dead link.
  const initialCategory =
    kategori && categories.some((c) => c.slug === kategori) ? kategori : 'alla'

  const initialModels = (modell ?? '')
    .split(',')
    .map((slug) => slug.trim())
    .filter((slug) => boatModels.some((m) => m.slug === slug))

  const initialSort = isSortKey(sortera) ? sortera : DEFAULT_SORT

  // Capped rather than trusted: ?sok= is whatever someone puts in the address
  // bar, and it goes straight into the field and the empty state.
  const initialQuery = (sok ?? '').slice(0, 80)

  return (
    <PageTransition>
      <ProductsHero
        label={text(page?.pageLabel, defaults.pageLabel)}
        title={text(page?.pageTitle, defaults.pageTitle)}
        subtitle={text(page?.pageSubtitle, defaults.pageSubtitle)}
        count={products.length}
        categoryCount={categories.length}
      />
      <ProductsShell
        products={products}
        categories={categories.map((c) => ({ slug: c.slug, title: c.title }))}
        boatModels={boatModels}
        initialCategory={initialCategory}
        initialModels={initialModels}
        initialSort={initialSort}
        initialQuery={initialQuery}
      />

      {/* Closing band — /tjanster and the landing page both end on one, so the
          index stopping dead after the last card was the odd one out. On
          `surface`, the same ground the header above uses. */}
      <section className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto max-w-container px-6 text-center">
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
