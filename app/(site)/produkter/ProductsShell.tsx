'use client'
import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types/sanity'

const ease = [0.16, 1, 0.3, 1] as const

// Matches the rail's brass line to the spring the services rail already uses,
// so the two pages' indicators move with the same weight.
const indicatorSpring = { type: 'spring' as const, stiffness: 320, damping: 34, mass: 0.9 }

type Entry = { key: string; label: string; count: number }

/**
 * Owns category state for the whole index, because the rail and the grid have
 * to move together.
 *
 * Filtering is client-side and the URL is written with `history.replaceState`
 * rather than `router.push`. The old bar pushed a new server render for every
 * click, which meant the grid was torn down and rebuilt — there was no shared
 * DOM left for a transition to animate between, so cards could only ever pop.
 * Holding every product on the client lets the survivors keep their identity
 * and glide to their new positions while the rest fade out. `?kategori=` still
 * deep-links, since the server reads it once and hands it in as the initial
 * value.
 */
export default function ProductsShell({
  products,
  categories,
  initialCategory,
}: {
  products: Product[]
  categories: { slug: string; title: string }[]
  initialCategory: string
}) {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(initialCategory)

  const entries = useMemo<Entry[]>(() => {
    const counts = new Map<string, number>()
    products.forEach((product) => {
      const slug = product.category?.slug
      if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1)
    })
    // Every category in Sanity is listed, including empty ones — the count is
    // the honest signal, and a category that silently vanished from the rail
    // would look like a bug to whoever just created it in the studio.
    return [
      { key: 'alla', label: 'Alla', count: products.length },
      ...categories.map((c) => ({
        key: c.slug,
        label: c.title,
        count: counts.get(c.slug) ?? 0,
      })),
    ]
  }, [products, categories])

  const filtered = useMemo(
    () =>
      active === 'alla'
        ? products
        : products.filter((product) => product.category?.slug === active),
    [products, active]
  )

  const select = useCallback((key: string) => {
    setActive(key)
    // Native history rather than the router: this is a view filter, not a
    // navigation, and going through the router would re-render the server
    // component and undo the animation this whole component exists for.
    const url = key === 'alla' ? '/produkter' : `/produkter?kategori=${encodeURIComponent(key)}`
    window.history.replaceState(null, '', url)
  }, [])

  const card: Variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.35 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : {
        hidden: { opacity: 0, y: 28, scale: 0.985 },
        // Capped so a long catalogue still finishes arriving promptly instead
        // of trickling in for several seconds.
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.75, ease, delay: Math.min(i, 7) * 0.07 },
        }),
        exit: { opacity: 0, scale: 0.96, transition: { duration: 0.3, ease: 'easeOut' as const } },
      }

  return (
    <>
      {/* ── Mobile category bar ──────────────────────────────── */}
      <div
        className="sticky top-[72px] z-30 border-b backdrop-blur-md lg:hidden"
        style={{
          background: 'rgba(241,243,242,0.88)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="container mx-auto max-w-container px-6">
          <div className="-mx-1 flex gap-1.5 overflow-x-auto py-3.5">
            {entries.map((entry) => {
              const on = entry.key === active
              const empty = entry.count === 0
              return (
                <button
                  key={entry.key}
                  onClick={() => select(entry.key)}
                  disabled={empty}
                  aria-pressed={on}
                  className="relative shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-300 disabled:opacity-35"
                  style={{ color: on ? '#fff' : 'var(--color-text-muted)' }}
                >
                  {on && (
                    <motion.span
                      layoutId="cat-pill"
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'var(--color-primary)' }}
                      transition={reduceMotion ? { duration: 0 } : indicatorSpring}
                    />
                  )}
                  <span className="relative">
                    {entry.label}
                    <span className="ml-1.5 tabular-nums opacity-55">{entry.count}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container mx-auto max-w-container px-6">
          <div className="grid lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-x-20">
            {/* ── Desktop rail ─────────────────────────────────── */}
            <aside className="hidden lg:block">
              <nav aria-label="Kategorier" className="sticky top-32">
                <p className="section-label mb-6">Kategori</p>

                <ol className="relative">
                  {/* Full-height track, so the brass mark reads as a position
                      along a list rather than a lone floating dash. */}
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-0 top-0 w-px"
                    style={{ background: 'var(--color-border)' }}
                  />

                  {entries.map((entry, index) => {
                    const on = entry.key === active
                    const empty = entry.count === 0
                    return (
                      <li key={entry.key} className="relative">
                        <button
                          onClick={() => select(entry.key)}
                          disabled={empty}
                          aria-current={on ? 'true' : undefined}
                          className="group flex w-full items-baseline gap-3.5 py-3.5 pl-6 text-left transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          {/* The one moving part in the rail. `layoutId` is what
                              makes it travel between rows instead of blinking
                              out here and in again there. Pulled 1px left so the
                              3px mark is centred on the 1px track rather than
                              hanging off its right edge. */}
                          {on && (
                            <motion.span
                              layoutId="cat-rail"
                              aria-hidden
                              className="absolute bottom-1.5 -left-px top-1.5 w-[3px] rounded-full"
                              style={{ background: 'var(--color-gold)' }}
                              transition={reduceMotion ? { duration: 0 } : indicatorSpring}
                            />
                          )}

                          <span
                            className="font-heading text-xs tabular-nums tracking-[0.18em] transition-colors duration-300"
                            style={{
                              color: on ? 'var(--color-gold-ink)' : 'var(--color-text-muted)',
                            }}
                          >
                            {String(index).padStart(2, '0')}
                          </span>

                          <span
                            className={`flex-1 text-base transition-colors duration-300 ${
                              on
                                ? 'font-semibold text-primary'
                                : 'text-text-muted group-hover:text-primary'
                            }`}
                          >
                            {entry.label}
                          </span>

                          <span
                            className="text-xs tabular-nums transition-colors duration-300"
                            style={{
                              color: on ? 'var(--color-gold-ink)' : 'var(--color-text-muted)',
                            }}
                          >
                            {entry.count}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </nav>
            </aside>

            {/* ── Grid ─────────────────────────────────────────── */}
            <div>
              <AnimatePresence mode="wait" initial={false}>
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45, ease }}
                    className="flex flex-col items-start rounded-lg border border-dashed px-8 py-16"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <span
                      aria-hidden
                      className="mb-5 block h-px w-12"
                      style={{ background: 'var(--color-gold)' }}
                    />
                    <p className="font-heading text-2xl font-semibold">
                      Inget här ännu
                    </p>
                    <p className="mt-3 max-w-md" style={{ color: 'var(--color-text-muted)' }}>
                      {products.length === 0
                        ? 'Sortimentet fylls på löpande. Vet du redan vad du behöver är det bara att höra av sig.'
                        : 'Den här kategorin är tom just nu. Prova en annan, eller hör av dig så letar vi.'}
                    </p>
                    <Link href="/kontakt" className="btn-outline mt-8">
                      Kontakta oss
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="grid"
                    layout={!reduceMotion}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                  >
                    {/* `popLayout` pulls leaving cards out of flow the moment
                        they start to go, so the ones that stay begin closing
                        the gap immediately rather than waiting for the exit
                        to finish and then jumping. */}
                    <AnimatePresence mode="popLayout">
                      {filtered.map((product, i) => (
                        <motion.div
                          key={product._id}
                          layout={!reduceMotion}
                          custom={i}
                          variants={card}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
