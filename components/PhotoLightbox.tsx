'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal, preload } from 'react-dom'
import Image, { getImageProps } from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ServicePhoto } from '@/types/sanity'

const ease = [0.16, 1, 0.3, 1] as const

/** The stage runs edge to edge, so the photo is asked for at screen width. */
const STAGE_SIZES = '100vw'

/** How far a swipe has to travel, velocity included, to count as a page turn. */
const SWIPE_PX = 80

/**
 * A gallery photo opened full-screen.
 *
 * Hand-rolled for the same reason `ServiceFormDialog` is — there's no dialog
 * primitive in the project and this needs little of one: escape, arrow keys,
 * the page locked behind it, and focus handed back to the photo it came from.
 * Portalled to <body> because the gallery sits inside an `AnimatedSection`, and
 * that transform would otherwise trap `position: fixed` inside the section.
 *
 * Clicking anywhere on the stage closes it, the photo included. The photo is
 * letterboxed with `object-contain` into whatever space the screen has, and
 * there's no telling from here where its edges fall — so rather than guess at
 * a "backdrop" around it, the whole stage is the backdrop. Click to open, click
 * to close.
 *
 * Swiping works with a finger and with a mouse. A swipe that ends in a click
 * is a swipe, not a close — `dragged` is cleared on every press and set once
 * the drag actually starts, so the click that follows it is recognisable.
 *
 * The neighbours are preloaded while the current photo is on screen, so a
 * page turn shows a picture instead of an empty stage.
 */
export default function PhotoLightbox({
  photos,
  index,
  onIndexChange,
  onClose,
  label,
}: {
  photos: readonly ServicePhoto[]
  /** The photo on show, or null while closed. */
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
  /** Announced to screen readers, e.g. "Bilder — Båtrutor". */
  label: string
}) {
  const [mounted, setMounted] = useState(false)
  // Which way the last page turn went, so the incoming photo enters from the
  // side the visitor was heading towards.
  const [direction, setDirection] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragged = useRef(false)
  const reduceMotion = useReducedMotion()
  const open = index !== null

  // Portals need a document, so nothing renders through until after hydration.
  useEffect(() => setMounted(true), [])

  const go = useCallback(
    (step: number) => {
      if (index === null) return
      const next = index + step
      if (next < 0 || next >= photos.length) return
      setDirection(step)
      onIndexChange(next)
    },
    [index, photos.length, onIndexChange]
  )

  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Whatever opened it — the photo that was clicked — gets focus back after.
    const trigger = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    return () => {
      document.body.style.overflow = previous
      // No scroll: the carousel may be gliding to another photo at the same
      // moment, and focusing would yank it back to this one.
      trigger?.focus({ preventScroll: true })
    }
  }, [open])

  // The photos either side, fetched ahead with the same srcset the stage will
  // ask for, so the browser picks the same file and the page turn hits cache.
  useEffect(() => {
    if (index === null) return
    for (const neighbour of [photos[index - 1], photos[index + 1]]) {
      if (!neighbour) continue
      const { props } = getImageProps({ src: neighbour.url, alt: '', fill: true, sizes: STAGE_SIZES })
      preload(props.src, { as: 'image', imageSrcSet: props.srcSet, imageSizes: props.sizes })
    }
  }, [index, photos])

  useEffect(() => {
    if (!open) return
    const onKey =(e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, go, onClose])

  if (!mounted) return null

  const photo = index === null ? null : photos[index]
  const shift = reduceMotion ? 0 : 60

  return createPortal(
    <AnimatePresence>
      {photo && index !== null && (
        <motion.div
          key="lightbox"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          className="fixed inset-0 z-[60] flex flex-col outline-none"
          style={{ background: 'rgba(7, 20, 33, 0.94)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <p className="font-heading text-xs tabular-nums tracking-[0.18em] text-white">
              {String(index + 1).padStart(2, '0')}
              <span className="text-white/50">
                {' / '}
                {String(photos.length).padStart(2, '0')}
              </span>
            </p>
            <LightboxButton label="Stäng" onClick={onClose}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </LightboxButton>
          </div>

          <div
            className="relative min-h-0 flex-1 cursor-zoom-out overflow-hidden"
            onPointerDown={() => {
              dragged.current = false
            }}
            onClick={() => {
              if (!dragged.current) onClose()
            }}
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                className="absolute inset-0 px-4 sm:px-20"
                variants={{
                  enter: (d: number) => ({ x: d * shift, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d * -shift, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease }}
                drag={photos.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragStart={() => {
                  dragged.current = true
                }}
                onDragEnd={(_, info) => {
                  const swipe = info.offset.x + info.velocity.x * 0.2
                  if (swipe < -SWIPE_PX) go(1)
                  else if (swipe > SWIPE_PX) go(-1)
                }}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={photo.url}
                    alt={photo.alt ?? ''}
                    fill
                    sizes={STAGE_SIZES}
                    draggable={false}
                    loading="eager"
                    className="select-none object-contain"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {photos.length > 1 && (
              <>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-5">
                  <LightboxButton
                    label="Föregående bild"
                    disabled={index === 0}
                    onClick={() => go(-1)}
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </LightboxButton>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-5">
                  <LightboxButton
                    label="Nästa bild"
                    disabled={index === photos.length - 1}
                    onClick={() => go(1)}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </LightboxButton>
                </div>
              </>
            )}

          </div>

          {/* Caption from the alt text — the one description every photo is
              already meant to have. The bar keeps its height without one, so
              the photo doesn't jump between pictures that do and don't. */}
          <p className="min-h-[3.5rem] shrink-0 px-6 py-4 text-center text-sm text-white/80">
            {photo.alt}
          </p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function LightboxButton({
  label,
  disabled = false,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  /** The icon's SVG shapes. */
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        // The stage closes on click; a button on it mustn't.
        event.stopPropagation()
        onClick()
      }}
      className={`flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] ${
        disabled ? 'cursor-default opacity-30' : 'hover:bg-white/20'
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  )
}
