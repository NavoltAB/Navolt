'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useReducedMotion } from 'framer-motion'
import type { ServicePhoto } from '@/types/sanity'

/**
 * A service page's photo carousel.
 *
 * Native scroll-snap rather than a transform-driven track: the browser's own
 * momentum, rubber-banding and touch handling are smoother than anything
 * re-implemented on top of pointer events, and a trackpad's horizontal swipe
 * works without a line of code. This component only adds what scroll-snap
 * doesn't give you — arrows, dots, a counter, and the dimming of the frames
 * either side of the one you're looking at.
 *
 * Below lg the neighbours are deliberately left peeking at the edge of the
 * frame. It is the one detail that tells a visitor there are more pictures
 * without a caption saying so, and it's why the slides are a percentage of the
 * viewport rather than the full width of it.
 *
 * From lg up the track shows three at once, snapped to their left edges, and
 * the arrows move a whole page — the customer wanted a visitor to get through
 * the pictures without clicking through them one by one. How many fit is read
 * back from the layout rather than hardcoded, so the CSS widths stay the only
 * place that decides it.
 *
 * Dragging is added for the mouse only. Touch and trackpads already pan a
 * scroller natively and far better than script can, so a pointer handler that
 * covered them would replace good physics with worse. What a mouse has no
 * gesture for is the flick — hence grab-and-pull, which is the one thing that
 * makes a carousel feel like an object rather than a slideshow.
 *
 * While a drag is running, snapping is switched off: assigning `scrollLeft`
 * against a mandatory snap fights the browser for the same pixels and the
 * track judders. It comes back once the release has settled on a slide.
 *
 * `first` is read back from the scroll position rather than driving it, so
 * dragging, clicking an arrow, tapping a dot and flicking on a phone all end
 * up in the same state — there is no second source of truth to fall out of
 * step with where the track actually is.
 */

/** Photos side by side at lg and up. Mirrored by the `lg:w-*` classes below. */
const DESKTOP_PER_VIEW = 3

/**
 * Where the track is: the first slide in view and how many are showing.
 *
 * One slide in view snaps to the centre, so the one nearest the middle is the
 * one being read. Several snap to the start, so it's the one nearest the left
 * edge — clamped, because at the end of the track the last page can't scroll
 * any further and the left edge would otherwise point past it.
 */
function readTrack(track: HTMLElement) {
  const slides = Array.from(track.children) as HTMLElement[]
  if (slides.length === 0) return { first: 0, perView: 1 }

  // Slide width plus gap, measured off the layout so it follows the breakpoints.
  const pitch = slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth
  // Not laid out yet (hidden, or mid-mount) — there is nothing to measure.
  if (pitch <= 0) return { first: 0, perView: 1 }
  const gap = pitch - slides[0].offsetWidth
  const perView = Math.max(1, Math.round((track.clientWidth + gap) / pitch))

  const anchor = perView === 1 ? track.scrollLeft + track.clientWidth / 2 : track.scrollLeft
  let nearest = 0
  let smallest = Infinity
  slides.forEach((el, i) => {
    const edge = perView === 1 ? el.offsetLeft + el.offsetWidth / 2 : el.offsetLeft
    const distance = Math.abs(edge - anchor)
    if (distance < smallest) {
      smallest = distance
      nearest = i
    }
  })

  return { first: Math.min(nearest, Math.max(0, slides.length - perView)), perView }
}
export default function ServiceGallery({
  photos,
  label,
}: {
  photos: readonly ServicePhoto[]
  /** Announced to screen readers, e.g. "Bilder — Båtrutor". */
  label: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [{ first, perView }, setView] = useState({ first: 0, perView: 1 })
  const [dragging, setDragging] = useState(false)
  const drag = useRef({ startX: 0, startScroll: 0, moved: false })
  const resnap = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => () => {
    if (resnap.current) clearTimeout(resnap.current)
  }, [])

  // Scroll events fire far faster than paint; coalescing them into one frame
  // keeps the dimming from being the reason the scroll stutters.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let frame = 0
    const measure = () => {
      frame = 0
      const next = readTrack(track)
      setView((prev) =>
        prev.first === next.first && prev.perView === next.perView ? prev : next
      )
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      track.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [photos.length])

  /** Bring `index` to the front of the view: centred alone, leftmost in a row. */
  const scrollTo = useCallback(
    (index: number) => {
      const track = trackRef.current
      if (!track) return
      const { perView: fits } = readTrack(track)
      const target = track.children[
        Math.max(0, Math.min(index, photos.length - fits))
      ] as HTMLElement | undefined
      if (!target) return

      // Align the slide the same way scroll-snap would, so a click and a
      // swipe settle on identical positions.
      track.scrollTo({
        left:
          fits === 1
            ? target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2
            : target.offsetLeft,
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    },
    [photos.length, reduceMotion]
  )

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const track = trackRef.current
      // A press that never moved is a click, not a drag — hand snapping back
      // straight away, or the track stays unsnapped for the rest of the visit.
      if (!track || !drag.current.moved) {
        setDragging(false)
        if (track) track.style.scrollSnapType = ''
        return
      }
      drag.current.moved = false
      setDragging(false)
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId)

      // Settle on a slide first, then hand snapping back — re-enabling it
      // while the smooth scroll is still running makes the browser jump to
      // the snap point instead of gliding to it.
      scrollTo(readTrack(track).first)
      if (resnap.current) clearTimeout(resnap.current)
      resnap.current = setTimeout(() => {
        if (trackRef.current) trackRef.current.style.scrollSnapType = ''
      }, 500)
    },
    [scrollTo]
  )

  if (photos.length === 0) return null

  const single = photos.length === 1
  const last = Math.max(0, photos.length - perView)
  const inView = (i: number) => i >= first && i < first + perView

  // Two photos split the row rather than leaving a third of it empty. The
  // sizes follow the widths: the container tops out at 1280px less padding.
  const slide = single
    ? { width: 'w-full', sizes: '(max-width: 640px) 86vw, (max-width: 1024px) 70vw, 800px' }
    : photos.length === 2
      ? {
          width: 'w-[86%] sm:w-[70%] lg:w-[calc((100%_-_1.5rem)/2)]',
          sizes: '(max-width: 640px) 86vw, (max-width: 1024px) 70vw, 620px',
        }
      : {
          width: 'w-[86%] sm:w-[70%] lg:w-[calc((100%_-_3rem)/3)]',
          sizes: '(max-width: 640px) 86vw, (max-width: 1024px) 70vw, 420px',
        }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        role="group"
        aria-roledescription="karusell"
        aria-label={label}
        tabIndex={0}
        onPointerDown={(event) => {
          // Touch and pen pan the scroller themselves; taking the pointer here
          // would only make that worse.
          if (event.pointerType !== 'mouse' || single) return
          const track = trackRef.current
          if (!track) return
          drag.current = { startX: event.clientX, startScroll: track.scrollLeft, moved: false }
          setDragging(true)
          track.style.scrollSnapType = 'none'
        }}
        onPointerMove={(event) => {
          if (!dragging) return
          const track = trackRef.current
          if (!track) return
          const delta = event.clientX - drag.current.startX
          // A few pixels of slack, so a stray twitch on a click isn't a drag.
          if (!drag.current.moved && Math.abs(delta) < 3) return
          if (!drag.current.moved) {
            drag.current.moved = true
            track.setPointerCapture(event.pointerId)
          }
          track.scrollLeft = drag.current.startScroll - delta
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            scrollTo(first + perView)
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault()
            scrollTo(first - perView)
          }
        }}
        className={`no-scrollbar flex gap-4 md:gap-6 overflow-x-auto overscroll-x-contain rounded-lg select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-bg)] ${
          single ? '' : 'snap-x snap-mandatory cursor-grab'
        } ${dragging ? '!cursor-grabbing' : ''}`}
      >
        {photos.map((photo, i) => (
          <figure
            key={`${photo.url}-${i}`}
            className={`snap-center lg:snap-start shrink-0 grow-0 ${slide.width}`}
          >
            <div
              className="relative aspect-[3/2] rounded-lg overflow-hidden transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                background: 'var(--color-primary)',
                // The frames either side stay legible but recede — enough that
                // the eye knows which ones it is meant to be reading.
                opacity: inView(i) ? 1 : 0.45,
                transform: inView(i) ? 'scale(1)' : 'scale(0.97)',
              }}
            >
              <Image
                src={photo.url}
                alt={photo.alt ?? ''}
                fill
                sizes={slide.sizes}
                draggable={false}
                className="object-cover"
                // Lazy throughout: the carousel sits near the foot of the
                // page, and an eager fetch here would compete with the lead
                // image that is actually the LCP.
                loading="lazy"
              />
            </div>
          </figure>
        ))}
      </div>

      {/* Wraps rather than overflows. The dots are fixed-width and there can
          be any number of them, so on a narrow screen the row wanted more
          width than the container had and pushed the arrows out past the
          right edge — which is what put the sideways scroll on phones. The
          dots now take a row of their own under the counter and the arrows
          until sm, and min-w-0 lets that row actually give: a flex child
          refuses to go below its content width without it, so flex-1 alone
          was never going to save it.

          Hidden by CSS rather than by `perView` when everything fits on a
          desktop row: `perView` is only known after hydration, so gating on
          it would flash a set of dead controls on first paint. */}
      {!single && (
        <div
          className={`mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 ${
            photos.length <= DESKTOP_PER_VIEW ? 'lg:hidden' : ''
          }`}
        >
          {/* Counter — the same tabular, tracked-out numbering the steps and
              the /tjanster panels use. A range once several are in view. */}
          <p
            className="font-heading text-xs tabular-nums tracking-[0.18em] shrink-0 order-1"
            style={{ color: 'var(--color-gold-ink)' }}
          >
            {String(first + 1).padStart(2, '0')}
            {perView > 1 && `–${String(Math.min(first + perView, photos.length)).padStart(2, '0')}`}
            <span style={{ color: 'var(--color-text-muted)' }}>
              {' / '}
              {String(photos.length).padStart(2, '0')}
            </span>
          </p>

          {/* One dot per photo; every photo in view is lit, so on a desktop
              row the lit run reads like a scrollbar thumb. */}
          <div className="order-3 flex w-full min-w-0 flex-wrap items-center gap-2 sm:order-2 sm:w-auto sm:flex-1">
            {photos.map((photo, i) => (
              <button
                key={`dot-${photo.url}-${i}`}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Visa bild ${i + 1}`}
                aria-current={inView(i) ? 'true' : undefined}
                className="h-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  width: inView(i) ? '1.75rem' : '0.5rem',
                  background: inView(i) ? 'var(--color-gold)' : 'var(--color-border)',
                }}
              />
            ))}
          </div>

          <div className="order-2 ml-auto flex shrink-0 gap-2 sm:order-3 sm:ml-0">
            <CarouselButton
              direction="left"
              disabled={first === 0}
              onClick={() => scrollTo(first - perView)}
            />
            <CarouselButton
              direction="right"
              disabled={first >= last}
              onClick={() => scrollTo(first + perView)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function CarouselButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'left' | 'right'
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Föregående bild' : 'Nästa bild'}
      className={`flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-surface text-primary transition-all duration-300 ${
        disabled
          ? 'cursor-default opacity-40'
          : 'hover:border-primary hover:bg-primary hover:text-white'
      }`}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ transform: direction === 'left' ? 'rotate(180deg)' : undefined }}
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>
  )
}
