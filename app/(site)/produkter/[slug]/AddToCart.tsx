'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MAX_QTY, missingKits, useCart, type CartLine } from '@/context/CartContext'

const ease = [0.16, 1, 0.3, 1] as const

/**
 * Quantity stepper and the one action on the page.
 *
 * The panel swaps between two faces — pick a quantity, then confirmation —
 * inside a container that animates its own height, so the column below doesn't
 * jump when the taller confirmation replaces the shorter stepper. That height
 * tween is the whole reason this isn't two sibling divs behind a boolean.
 *
 * Beställningsvaror stay addable on purpose — that is the whole point of the
 * state: the part is sold, it is just ordered in rather than picked off a shelf.
 */
export default function AddToCart({
  slug,
  name,
  price,
  unit,
  image,
  inStock,
  kit,
}: {
  slug: string
  name: string
  price?: number
  unit?: string
  image?: string
  inStock: boolean
  /** The monteringspaket this ruta requires, when it has one. */
  kit?: CartLine
}) {
  const reduceMotion = useReducedMotion()
  const { addItem, count, items } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const unitLabel = unit || 'st'

  function handleAdd() {
    addItem({ slug, name, quantity: qty, price, unit, image, kit })
    setAdded(true)
  }

  // Recomputed from the basket rather than from `qty`, so it stays right when
  // the customer adds twice, or already had the kit from another ruta.
  const outstanding = useMemo(
    () => (kit ? missingKits(items).find((row) => row.kit.slug === kit.slug) : undefined),
    [items, kit]
  )

  function handleAddKit() {
    if (!outstanding) return
    addItem({
      slug: outstanding.kit.slug,
      name: outstanding.kit.name,
      quantity: outstanding.needed - outstanding.inCart,
      price: outstanding.kit.price,
      unit: outstanding.kit.unit,
      image: outstanding.kit.image,
    })
  }

  const face = {
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 },
    transition: { duration: reduceMotion ? 0.2 : 0.45, ease },
  }

  return (
    <motion.div
      layout={!reduceMotion}
      transition={{ duration: 0.5, ease }}
      className="card p-6 md:p-7"
    >
      <AnimatePresence mode="wait" initial={false}>
        {added ? (
          <motion.div key="added" {...face}>
            <div className="flex items-start gap-3.5">
              <motion.span
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'rgba(192,138,62,0.14)', color: 'var(--color-gold-ink)' }}
                initial={reduceMotion ? false : { scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 480, damping: 22, mass: 0.7 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <motion.polyline
                    points="20 6 9 17 4 12"
                    initial={reduceMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.45, ease, delay: 0.12 }}
                  />
                </svg>
              </motion.span>
              <div className="min-w-0">
                <p className="font-heading text-lg font-semibold leading-snug">
                  Tillagd i varukorgen
                </p>
                <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {qty} {unitLabel} · {count} {count === 1 ? 'artikel' : 'artiklar'} totalt
                </p>
              </div>
            </div>

            {outstanding && (
              <div
                className="mt-5 rounded-[var(--radius-md)] p-4"
                style={{
                  background: 'rgba(192,138,62,0.08)',
                  border: '1px solid rgba(192,138,62,0.32)',
                }}
              >
                <p className="font-heading text-sm font-semibold">Glöm inte monteringspaketet</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {outstanding.kit.name} krävs för att montera rutan.
                </p>
                <button type="button" onClick={handleAddKit} className="btn-gold mt-3.5 w-full">
                  Lägg till {outstanding.needed - outstanding.inCart} st
                  {outstanding.kit.price != null &&
                    ` · ${(
                      outstanding.kit.price *
                      (outstanding.needed - outstanding.inCart)
                    ).toLocaleString('sv-SE')} kr`}
                </button>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <Link href="/offert" className="btn-primary w-full">
                Visa varukorgen
              </Link>
              <button
                type="button"
                onClick={() => { setAdded(false); setQty(1) }}
                className="btn-outline w-full"
              >
                Lägg till fler
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="pick" {...face}>
            <div className="flex items-center justify-between gap-4">
              <span className="label !mb-0">Antal{unit ? ` (${unit})` : ''}</span>

              <div
                className="flex items-center gap-1"
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '100px',
                  padding: '3px',
                }}
              >
                {([-1, 1] as const).map((delta) => (
                  <motion.button
                    key={delta}
                    type="button"
                    onClick={() => setQty((q) => Math.min(MAX_QTY, Math.max(1, q + delta)))}
                    disabled={delta === -1 ? qty <= 1 : qty >= MAX_QTY}
                    aria-label={delta === -1 ? 'Minska antal' : 'Öka antal'}
                    whileTap={reduceMotion ? undefined : { scale: 0.88 }}
                    transition={{ duration: 0.15 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none transition-colors duration-200 disabled:opacity-30 enabled:hover:bg-[rgba(18,48,74,0.06)]"
                    style={{ color: 'var(--color-primary)', order: delta === -1 ? 0 : 2 }}
                  >
                    {delta === -1 ? '−' : '+'}
                  </motion.button>
                ))}

                {/* Re-keyed so the number itself changes with a small rise —
                    without it the stepper feels like a plain form control. */}
                <span className="relative block h-6 w-8 overflow-hidden" style={{ order: 1 }}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={qty}
                      initial={reduceMotion ? { opacity: 0 } : { y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={reduceMotion ? { opacity: 0 } : { y: -14, opacity: 0 }}
                      transition={{ duration: 0.28, ease }}
                      className="absolute inset-0 flex items-center justify-center font-heading text-lg font-semibold tabular-nums"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {qty}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
            </div>

            {price != null && (
              <div
                className="mt-5 flex items-baseline justify-between gap-3 pt-4"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Pris {qty} {unitLabel}
                </span>
                <span
                  className="font-heading text-xl font-semibold tabular-nums"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {(price * qty).toLocaleString('sv-SE')} kr
                </span>
              </div>
            )}

            <button type="button" onClick={handleAdd} className="btn-gold mt-5 w-full">
              Lägg i varukorg
            </button>

            <p className="mt-3.5 text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {inStock
                ? 'Ingen bindande beställning — vi bekräftar pris, frakt och leveranstid innan något skickas.'
                : 'Beställningsvara — vi tar hem den åt dig. Lägg den i korgen, så återkommer vi med leveranstid.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
