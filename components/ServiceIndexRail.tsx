'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'

/**
 * Sticky index for the services page. A brass line runs down the rail and grows
 * as you read, its tip resting on the entry you're currently in.
 *
 * The line is mapped panel-by-panel rather than as a straight fraction of the
 * page: each service owns an equal slice of the rail, so the tip lands on the
 * right entry even though the panels differ a lot in height. A plain
 * scroll-percentage line would drift away from the labels on the taller ones.
 *
 * Desktop only — the page stacks on mobile, where a pinned rail would eat most
 * of the screen.
 */

// How much of its own row the tip travels while you read a panel, as a fraction
// of that row's height. This is the dial between the two things that pull
// against each other here: tracking the scroll continuously, and sitting on the
// row's centre.
//   0   — pinned to the centre, dead still until the panel changes.
//   0.4 — drifts about ±11px either side of centre over a full panel, which
//         reads as centred while never being completely still.
//   1   — the full row, so it rests on a boundary at each end and looks like
//         it's pointing between two entries.
// Does not apply to the last entry, which always runs out to the full track.
const SWEEP = 0.4

export default function ServiceIndexRail({
  items,
}: {
  items: { id: string; title: string }[]
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  const reduceMotion = useReducedMotion()

  // Written from a scroll listener, so it never re-renders the component —
  // only `activeId` does, and only when the panel actually changes.
  const progress = useMotionValue(0)
  // Same spring ALLOU uses. With SWEEP at 0 the target moves in steps, so the
  // spring is what turns the jump between entries into a glide.
  const smoothed = useSpring(progress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  // Scroll-linked motion is usually fine under reduced-motion, but the spring's
  // overshoot is not — drop straight to the raw value instead of disabling it.
  const fill = reduceMotion ? progress : smoothed
  // Height, not scaleY: a vertical transform squashes border-radius with it, so
  // a scaled line's rounded caps flatten out to stubs at low fill.
  const height = useTransform(fill, (value) => `${value * 100}%`)

  // `items` is rebuilt on every render by the parent, so depending on it
  // directly would re-run this effect endlessly. The ids are what matter.
  const ids = items.map((item) => item.id).join(',')
  const idsRef = useRef(ids)
  idsRef.current = ids

  useEffect(() => {
    const sections = idsRef.current
      .split(',')
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    // A panel counts as current once its top passes the upper third of the
    // viewport, so the rail reflects what's being read rather than what's
    // merely visible. `local` reuses that same marker, which keeps the line and
    // the highlight in agreement instead of drifting apart by a few pixels.
    const onScroll = () => {
      const marker = window.innerHeight * 0.35
      let current = sections[0].id
      let index = 0
      let local = 0

      sections.forEach((section, i) => {
        const rect = section.getBoundingClientRect()
        if (rect.top > marker) return
        current = section.id
        index = i
        // Clamps to 1 in the gaps between panels, parking the line on the
        // boundary rather than letting it run ahead into the next entry.
        local = rect.height > 0 ? Math.min(1, (marker - rect.top) / rect.height) : 0
      })

      setActiveId(current)

      if (index === sections.length - 1) {
        // The last panel is the exception: instead of hovering near its row's
        // centre it runs the line out to the full track, so scrolling through
        // the final service visibly completes the bar rather than leaving it
        // stopped short with grey underneath.
        const start = (index + 0.5 - SWEEP / 2) / sections.length
        progress.set(start + (1 - start) * local)
      } else {
        // Centred on the row, then swept by SWEEP — see the constant above.
        progress.set((index + 0.5 + (local - 0.5) * SWEEP) / sections.length)
      }
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids, progress])

  return (
    <nav aria-label="Tjänster">
      <p className="section-label mb-6">Innehåll</p>

      <div className="relative">
        {/* Track and fill share a box so the line can't fall out of step with
            the list height as titles wrap. */}
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
          style={{ background: 'var(--color-border)' }}
        />
        <motion.span
          aria-hidden
          className="absolute left-0 top-0 w-1 rounded-full"
          style={{ background: 'var(--color-gold)', height }}
        />

        <ol>
          {items.map((item, index) => {
            const active = item.id === activeId
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active ? 'true' : undefined}
                  className="group flex items-baseline gap-4 py-4 pl-6"
                >
                  <span
                    className="font-heading text-sm tabular-nums tracking-[0.18em] transition-colors duration-300"
                    style={{
                      color: active ? 'var(--color-gold-ink)' : 'var(--color-text-muted)',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-base transition-colors duration-300 ${
                      active ? 'font-semibold text-primary' : 'text-text-muted group-hover:text-primary'
                    }`}
                  >
                    {item.title}
                  </span>
                </a>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
