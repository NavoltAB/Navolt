'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import ElfsightWidget from '@/components/ElfsightWidget'

const ease = [0.16, 1, 0.3, 1] as const

// How long the close animation runs. The overlay stays in the stacking order
// this long after `open` flips, so it fades out in front of the page rather
// than dropping behind it on the first frame.
const CLOSE_MS = 300

/**
 * A service CTA that opens its Elfsight lead form in a modal.
 *
 * The old site put these behind a Radix dialog on dedicated /motorservice and
 * /campervan pages. There's no dialog primitive here and no reason to pull one
 * in for two buttons, so this is the small hand-rolled equivalent: escape to
 * close, click the backdrop to close, focus moves in and comes back out, and
 * the page behind is locked while it's open.
 *
 * Portalled to <body> deliberately. Every service panel sits inside an
 * `AnimatedSection`, and a motion transform on an ancestor makes it the
 * containing block for `position: fixed` — the overlay would be trapped inside
 * one article instead of covering the viewport.
 *
 * ── Why it prewarms ──────────────────────────────────────────────────────
 * Mounting the widget on click cost ~1.5s of staring at an empty panel. Almost
 * none of that is platform.js — the chat bubble already loads that on every
 * page — it's the widget's own boot call and its app bundle, and neither starts
 * until the div exists.
 *
 * So the div is mounted *before* the click, as soon as the visitor looks like
 * they might use it: the button scrolls into view, or they hover or focus it.
 * The dialog is then always mounted and merely hidden, so opening is a fade
 * rather than a fetch. Someone who never scrolls to the button pays nothing.
 */
export default function ServiceFormDialog({
  appId,
  label,
  title,
  padded = false,
}: {
  appId: string
  /** Button text, e.g. "Boka motorservice". */
  label: string
  /** Heading inside the dialog. Defaults to the button text. */
  title?: string
  /**
   * Insets the widget from the panel's edges.
   *
   * Off by default, because how much air a form has around it is set per widget
   * in the Elfsight dashboard, and one that already pads itself would end up
   * double-padded. Turn it on for a form that runs flush to its own edges — see
   * `serviceForms` in lib/services.ts, which decides this per service.
   */
  padded?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  // Once true, the widget is in the DOM and rendering. Never goes back.
  const [warm, setWarm] = useState(false)
  // Lags `open` on the way out so the overlay can fade in front of the page.
  const [inLayer, setInLayer] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const headingId = useId()

  // Portals need a document, so nothing renders through until after hydration.
  useEffect(() => setMounted(true), [])

  // Warm on intent. The observer is what covers touch, where there's no hover
  // to read — by the time the button is on screen the visitor has scrolled
  // through the whole service panel to get to it.
  useEffect(() => {
    const trigger = triggerRef.current
    if (!trigger || warm) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setWarm(true)
      },
      { rootMargin: '200px' }
    )
    io.observe(trigger)
    return () => io.disconnect()
  }, [warm])

  useEffect(() => {
    if (open) {
      setInLayer(true)
      return
    }
    const t = setTimeout(() => setInLayer(false), CLOSE_MS)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    // Captured now rather than read in the cleanup: by then the ref may already
    // point somewhere else.
    const trigger = triggerRef.current

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
      // Put the caret back where the visitor left it, not at the top of the page.
      trigger?.focus()
    }
  }, [open])

  const heading = title ?? label
  const warmNow = () => setWarm(true)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        onPointerEnter={warmNow}
        onFocus={warmNow}
        className="btn-outline"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {label}
      </button>

      {mounted &&
        warm &&
        createPortal(
          <motion.div
            className="fixed inset-0 flex items-start justify-center p-4 sm:p-6"
            style={{
              // Behind everything and untouchable while closed. It still has
              // full layout, which is what lets the widget render itself out of
              // sight instead of waiting for the click.
              zIndex: inLayer ? 60 : -1,
              overflowY: open ? 'auto' : 'hidden',
              pointerEvents: open ? 'auto' : 'none',
            }}
            // `inert` keeps the hidden form out of the tab order and away from
            // screen readers without unmounting it.
            inert={!open}
            aria-hidden={!open}
            initial={false}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: open ? 0.25 : CLOSE_MS / 1000, ease: 'easeOut' }}
          >
            {/* Backdrop. Its own element rather than a background on the
                scroll container, so clicking the padding around a short
                form closes the dialog too. */}
            <div
              aria-hidden
              className="fixed inset-0"
              style={{ background: 'rgba(7, 20, 33, 0.72)' }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={headingId}
              tabIndex={-1}
              className="relative my-auto w-full max-w-lg overflow-hidden rounded-lg outline-none"
              style={{
                // Matches the widget's own ground, which is set in the Elfsight
                // dashboard rather than here — a mismatch shows as a seam around
                // the form's edges and as a flash of the wrong colour in the
                // moment before it renders. If the form is ever restyled dark
                // again, this has to follow it.
                background: 'var(--color-surface)',
                boxShadow: '0 30px 70px -30px rgba(4, 16, 28, 0.65)',
              }}
              initial={false}
              animate={{
                opacity: open ? 1 : 0,
                y: open ? 0 : 16,
                scale: open ? 1 : 0.98,
              }}
              transition={{ duration: open ? 0.35 : CLOSE_MS / 1000, ease }}
            >
              {/* The widget prints its own heading, so this one is for
                  screen readers only — rendering both would say it twice. */}
              <h2 id={headingId} className="sr-only">
                {heading}
              </h2>

              {/* Floated over the widget's photo header rather than sitting
                  in a bar of its own, which would be a second title strip
                  above the one the form already draws. */}
              <div className={`absolute z-10 ${padded ? 'right-2 top-2' : 'right-3 top-3'}`}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Stäng"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors duration-200 hover:bg-black/70"
                  style={{ background: 'rgba(0, 0, 0, 0.45)' }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Edge to edge — the form's own look lives in the Elfsight
                  dashboard. `min-h` keeps the panel from collapsing to a
                  sliver in the moment before the widget renders.

                  `lazy={false}`: Elfsight's own lazy mode waits for the div to
                  reach the viewport, and this one deliberately renders while
                  it's hidden behind the page. Leaving it lazy would defeat the
                  whole prewarm. */}
              <div className={`min-h-[240px] ${padded ? 'p-6 sm:p-8' : ''}`}>
                <ElfsightWidget
                  appId={appId}
                  lazy={false}
                  fallbackLabel="Formuläret levereras av en extern tjänst (Elfsight)."
                />
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
    </>
  )
}
