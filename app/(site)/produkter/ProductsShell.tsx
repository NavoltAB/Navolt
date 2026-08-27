'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import FilterMenu from './FilterMenu'
import { DEFAULT_SORT, SORTS, type SortKey } from './sort'
import type { BoatModel, Product } from '@/types/sanity'

const ease = [0.16, 1, 0.3, 1] as const

// Matches the rail's brass line to the spring the services rail already uses,
// so the two pages' indicators move with the same weight.
const indicatorSpring = { type: 'spring' as const, stiffness: 320, damping: 34, mass: 0.9 }

type Entry = { key: string; label: string; count: number }

/**
 * Owns category, båtmodell and sort state for the whole index, because the
 * rail, the filter bar and the grid all have to move together.
 *
 * Filtering is client-side and the URL is written with `history.replaceState`
 * rather than `router.push`. The old bar pushed a new server render for every
 * click, which meant the grid was torn down and rebuilt — there was no shared
 * DOM left for a transition to animate between, so cards could only ever pop.
 * Holding every product on the client lets the survivors keep their identity
 * and glide to their new positions while the rest fade out. `?kategori=`,
 * `?modell=` and `?sortera=` still deep-link, since the server reads them once
 * and hands them in as initial values.
 */
export default function ProductsShell({
  products,
  categories,
  boatModels,
  initialCategory,
  initialModels,
  initialSort,
}: {
  products: Product[]
  categories: { slug: string; title: string }[]
  boatModels: BoatModel[]
  initialCategory: string
  initialModels: string[]
  initialSort: SortKey
}) {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(initialCategory)
  const [models, setModels] = useState<string[]>(initialModels)
  const [sort, setSort] = useState<SortKey>(initialSort)
  const [modelQuery, setModelQuery] = useState('')

  const entries = useMemo<Entry[]>(() => {
    const counts = new Map<string, number>()
    products.forEach((product) => {
      const slug = product.category?.slug
      if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1)
    })
    // Every category in Sanity is listed, including empty ones — the count is
    // the honest signal, and a category that silently vanished from the rail
    // would look like a bug to whoever just created it in the studio. Counted
    // against the whole catalogue rather than the model selection, so picking a
    // båtmodell can never disable the category you are standing in.
    return [
      { key: 'alla', label: 'Alla', count: products.length },
      ...categories.map((c) => ({
        key: c.slug,
        label: c.title,
        count: counts.get(c.slug) ?? 0,
      })),
    ]
  }, [products, categories])

  const inCategory = useMemo(
    () =>
      active === 'alla'
        ? products
        : products.filter((product) => product.category?.slug === active),
    [products, active]
  )

  // Model counts, unlike the category counts, *do* narrow to the active
  // category: standing in "Båtrutor" you want to see which boats have rutor,
  // not which boats appear anywhere in the catalogue.
  const modelOptions = useMemo(() => {
    const counts = new Map<string, number>()
    inCategory.forEach((product) => {
      const slug = product.boatModel?.slug
      if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1)
    })
    return boatModels.map((model) => ({
      slug: model.slug,
      name: model.name,
      count: counts.get(model.slug) ?? 0,
    }))
  }, [boatModels, inCategory])

  const visibleModelOptions = useMemo(() => {
    const q = modelQuery.trim().toLowerCase()
    if (!q) return modelOptions
    return modelOptions.filter((model) => model.name.toLowerCase().includes(q))
  }, [modelOptions, modelQuery])

  const filtered = useMemo(
    () =>
      models.length === 0
        ? inCategory
        : inCategory.filter(
            (product) => product.boatModel && models.includes(product.boatModel.slug)
          ),
    [inCategory, models]
  )

  const sorted = useMemo(() => {
    const list = [...filtered]
    if (sort === 'nyast') {
      list.sort(
        (a, b) =>
          (b._createdAt ?? '').localeCompare(a._createdAt ?? '') ||
          a.name.localeCompare(b.name, 'sv')
      )
      return list
    }
    const direction = sort === 'pris-lagst' ? 1 : -1
    list.sort((a, b) => {
      // "Pris på förfrågan" has no number to compare with. Those products sort
      // last in *both* directions rather than pretending to be free under
      // "lägsta pris" and infinitely expensive under "högsta".
      if (a.price == null && b.price == null) return a.name.localeCompare(b.name, 'sv')
      if (a.price == null) return 1
      if (b.price == null) return -1
      return (a.price - b.price) * direction
    })
    return list
  }, [filtered, sort])

  const activeLabel = entries.find((entry) => entry.key === active)?.label ?? 'Alla'
  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? 'Nyast'
  const filtersOn = active !== 'alla' || models.length > 0

  const modelSummary =
    models.length === 0
      ? null
      : models.length === 1
        ? (boatModels.find((m) => m.slug === models[0])?.name ?? '1 vald')
        : `${models.length} valda`

  // One writer for the URL rather than one per control — three handlers each
  // rebuilding the query string is how they drift out of sync. Native history
  // rather than the router: these are view filters, not navigation, and going
  // through the router would re-render the server component and undo the
  // animation this whole component exists for.
  useEffect(() => {
    const params = new URLSearchParams()
    if (active !== 'alla') params.set('kategori', active)
    if (models.length > 0) params.set('modell', models.join(','))
    if (sort !== DEFAULT_SORT) params.set('sortera', sort)
    const query = params.toString()
    window.history.replaceState(null, '', query ? `/produkter?${query}` : '/produkter')
  }, [active, models, sort])

  const toggleModel = useCallback((slug: string) => {
    setModels((current) =>
      current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setActive('alla')
    setModels([])
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
                  onClick={() => setActive(entry.key)}
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
                          onClick={() => setActive(entry.key)}
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
              {/* ── Filter bar ─────────────────────────────────── */}
              <div className="mb-8 flex flex-wrap items-center gap-2.5">
                <FilterMenu label="Sortera" summary={sort === DEFAULT_SORT ? null : sortLabel} active={sort !== DEFAULT_SORT}>
                  {(close) => (
                    <ul className="py-1.5" role="listbox" aria-label="Sortera">
                      {SORTS.map((option) => {
                        const on = option.key === sort
                        return (
                          <li key={option.key}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={on}
                              onClick={() => {
                                setSort(option.key)
                                close()
                              }}
                              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-bg)]"
                              style={{
                                color: on ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                fontWeight: on ? 600 : 400,
                              }}
                            >
                              {option.label}
                              {on && (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="var(--color-gold)"
                                  strokeWidth="3"
                                  aria-hidden
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </FilterMenu>

                {/* Renders only once there is at least one båtmodell in Sanity.
                    An empty dropdown is worse than no dropdown, and this way the
                    control appears by itself the moment the first model is
                    created rather than needing a code change. */}
                {boatModels.length > 0 && (
                  <FilterMenu label="Båtmodell" summary={modelSummary} active={models.length > 0}>
                    {() => (
                      <div>
                        <div className="p-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <input
                            type="search"
                            value={modelQuery}
                            onChange={(event) => setModelQuery(event.target.value)}
                            placeholder="Sök efter en modell"
                            aria-label="Sök efter en båtmodell"
                            className="w-full rounded-full border px-3.5 py-2 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
                            style={{
                              borderColor: 'var(--color-border)',
                              background: 'var(--color-bg)',
                            }}
                          />
                        </div>

                        <ul className="max-h-64 overflow-y-auto py-1">
                          {visibleModelOptions.length === 0 ? (
                            <li
                              className="px-4 py-6 text-center text-sm"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              Ingen modell matchar
                            </li>
                          ) : (
                            visibleModelOptions.map((model) => {
                              const on = models.includes(model.slug)
                              // A model with nothing in this category is dead
                              // weight — unless it is already ticked, in which
                              // case disabling it would trap the selection.
                              const unavailable = model.count === 0 && !on
                              return (
                                <li key={model.slug}>
                                  <label
                                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                                      unavailable
                                        ? 'cursor-not-allowed opacity-40'
                                        : 'cursor-pointer hover:bg-[var(--color-bg)]'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={on}
                                      disabled={unavailable}
                                      onChange={() => toggleModel(model.slug)}
                                      className="h-4 w-4 shrink-0 accent-[var(--color-primary)]"
                                    />
                                    <span className="flex-1" style={{ color: 'var(--color-text)' }}>
                                      {model.name}
                                    </span>
                                    <span
                                      className="text-xs tabular-nums"
                                      style={{ color: 'var(--color-text-muted)' }}
                                    >
                                      {model.count}
                                    </span>
                                  </label>
                                </li>
                              )
                            })
                          )}
                        </ul>

                        {models.length > 0 && (
                          <div className="p-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                            <button
                              type="button"
                              onClick={() => setModels([])}
                              className="w-full rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-bg)]"
                              style={{
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-muted)',
                              }}
                            >
                              Ta bort alla
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </FilterMenu>
                )}

                {filtersOn && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-2 text-sm underline underline-offset-4 transition-colors hover:text-primary"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Rensa filter
                  </button>
                )}

                <p
                  className="ml-auto text-sm tabular-nums"
                  style={{ color: 'var(--color-text-muted)' }}
                  aria-live="polite"
                >
                  {sorted.length} {sorted.length === 1 ? 'produkt' : 'produkter'}
                </p>
              </div>

              {/* The grid's own heading, out of view. ProductsHero already
                  names the page and the rail already marks the category, so
                  there is nothing left to show — but without an h2 here the
                  ProductCard h3s hang straight off the page h1, and both
                  screen readers and crawlers read that as a broken outline.
                  Naming the active category also means the heading still says
                  something useful when the page is deep-linked with
                  ?kategori=. */}
              <h2 className="sr-only">
                {active === 'alla' ? 'Alla produkter' : `Produkter i kategorin ${activeLabel}`}
              </h2>

              <AnimatePresence mode="wait" initial={false}>
                {sorted.length === 0 ? (
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
                        : models.length > 0
                          ? 'Vi har inget uppe för den båtmodellen just nu. Prova en annan modell, eller hör av dig så letar vi.'
                          : 'Den här kategorin är tom just nu. Prova en annan, eller hör av dig så letar vi.'}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      {filtersOn && (
                        <button type="button" onClick={clearFilters} className="btn-outline">
                          Rensa filter
                        </button>
                      )}
                      <Link href="/kontakt" className="btn-primary">
                        Kontakta oss
                      </Link>
                    </div>
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
                      {sorted.map((product, i) => (
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
