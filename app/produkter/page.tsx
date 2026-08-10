import type { Metadata } from 'next'
import { getAllProducts, getAllCategories } from '@/sanity/queries'
import ProductCard from '@/components/ProductCard'
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/AnimatedSection'
import PageTransition from '@/components/PageTransition'
import FilterBar from './FilterBar'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Produkter',
  description: 'Våra produkter — noggrant utvalda för dig.',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>
}) {
  const { kategori } = await searchParams
  const [allProducts, categories] = await Promise.all([getAllProducts(), getAllCategories()])

  const filtered =
    kategori && kategori !== 'alla'
      ? allProducts.filter((p) => p.category?.slug === kategori)
      : allProducts

  const categoryEntries: [string, string][] = [
    ['alla', 'Alla'],
    ...categories.map((c) => [c.slug, c.title] as [string, string]),
  ]

  return (
    <PageTransition>
      {/* Page header */}
      <div className="pt-32 pb-16" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container">
          <AnimatedSection>
            <p className="section-label mb-3">Sortiment</p>
            <h1 className="section-title mb-4">Produkter</h1>
            <p className="section-subtitle">
              Noggrant utvalda produkter för dig.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Filter bar */}
      <div className="sticky top-[72px] z-40 border-b" style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
        <div className="container mx-auto px-6 max-w-container">
          <FilterBar
            categories={categoryEntries}
            current={kategori || 'alla'}
            total={filtered.length}
          />
        </div>
      </div>

      {/* Product grid */}
      <section className="section">
        <div className="container mx-auto px-6 max-w-container">
          {filtered.length === 0 ? (
            <AnimatedSection className="text-center py-20">
              <p className="font-heading text-2xl mb-3">Inga produkter hittades</p>
              <p style={{ color: 'var(--color-text-muted)' }}>
                {allProducts.length === 0
                  ? 'Produkter läggs till via CMS-studion på /studio.'
                  : `Inga produkter i vald kategori.`}
              </p>
            </AnimatedSection>
          ) : (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <StaggerItem key={product._id}>
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>
    </PageTransition>
  )
}
