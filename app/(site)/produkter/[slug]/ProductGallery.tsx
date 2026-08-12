'use client'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1] as const

/**
 * The sticky half of the product page.
 *
 * Images crossfade in place rather than sliding: the thumbnails below already
 * carry the sense of position, and a slide would fight the page scrolling past
 * on the right. The outgoing frame is held in flow by `mode="popLayout"` being
 * off — both frames are absolutely positioned inside a fixed-ratio box, so the
 * container never reflows mid-transition.
 *
 * `object-contain` on a light ground, not `cover`: a product shot cropped to
 * fill would cut the connectors off a charger. The card grid crops because it
 * needs an even rhythm; here the part has to be legible.
 */
export default function ProductGallery({
  images,
  thumbs,
  productName,
  inStock,
}: {
  images: string[]
  thumbs: string[]
  productName: string
  inStock: boolean
}) {
  const reduceMotion = useReducedMotion()
  const [active, setActive] = useState(0)
  // Which way the next crossfade drifts, so stepping forward and back don't
  // look identical. Purely decorative — 8px, not a slide.
  const [direction, setDirection] = useState(1)

  const go = useCallback(
    (next: number) => {
      setDirection(next > active ? 1 : -1)
      setActive(next)
    },
    [active]
  )

  const step = useCallback(
    (delta: number) => {
      if (images.length < 2) return
      const next = (active + delta + images.length) % images.length
      go(next)
    },
    [active, go, images.length]
  )

  // Arrow keys work once a thumbnail has focus, which is where a keyboard user
  // will be when they want to page through the shots.
  useEffect(() => {
    if (images.length < 2) return
    const onKey = (e: KeyboardEvent) => {
      if (!(e.target as HTMLElement)?.closest?.('[data-gallery]')) return
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, step])

  return (
    <div data-gallery className="flex flex-col gap-4 lg:sticky lg:top-32">
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={active}
            custom={direction}
            className="absolute inset-0"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 1.03, x: direction * 8 }
            }
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
            transition={{ duration: reduceMotion ? 0.25 : 0.7, ease }}
          >
            <Image
              src={images[active]}
              alt={
                images.length > 1
                  ? `${productName} — bild ${active + 1} av ${images.length}`
                  : productName
              }
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className={`object-contain p-8 ${inStock ? '' : 'grayscale'}`}
              priority={active === 0}
            />
          </motion.div>
        </AnimatePresence>

        {!inStock && (
          <span
            className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md"
            style={{ background: 'rgba(11,34,55,0.82)' }}
          >
            Slut i lager
          </span>
        )}

        {/* Paging arrows sit on the image but only surface on hover, so a
            single-shot product shows nothing at all. */}
        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 opacity-0 transition-opacity duration-300 focus-within:opacity-100 hover:opacity-100">
            {([-1, 1] as const).map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => step(delta)}
                aria-label={delta === -1 ? 'Föregående bild' : 'Nästa bild'}
                className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-transform duration-300 ease-out hover:scale-110"
                style={{
                  background: 'rgba(250,251,250,0.9)',
                  color: 'var(--color-primary)',
                  boxShadow: '0 0 0 1px rgba(18,48,74,0.08)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points={delta === -1 ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {thumbs.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {thumbs.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Visa bild ${i + 1}`}
              aria-current={active === i}
              className="group relative aspect-square overflow-hidden"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Image
                src={src}
                alt=""
                aria-hidden
                fill
                sizes="120px"
                className={`object-contain p-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 ${
                  active === i ? 'opacity-100' : 'opacity-55 group-hover:opacity-85'
                }`}
              />
              {/* One brass rule that travels between thumbnails — the same
                  layoutId trick the category rail uses, so selection reads the
                  same way everywhere on the site. */}
              {active === i && (
                <motion.span
                  layoutId="gallery-active"
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[3px]"
                  style={{ background: 'var(--color-gold)' }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 380, damping: 34, mass: 0.8 }
                  }
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
