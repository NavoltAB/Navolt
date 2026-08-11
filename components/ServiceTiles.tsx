'use client'
import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, useReducedMotion } from 'framer-motion'

export type ServiceTile = {
  _id: string
  title: string
  href: string
  imageUrl?: string
  shortDescription?: string
}

const ease = [0.16, 1, 0.3, 1] as const

/**
 * Landing-page services. Deliberately *not* cards: full-bleed photography with
 * the title set on the image, so services read as editorial and the product
 * cards below keep the light, priced, card-shaped look to themselves. The two
 * sections should be distinguishable at a glance without reading a word.
 *
 * Nothing is hidden behind hover — title, description and link text are all
 * visible at rest. Hover only deepens what's already there, which keeps the
 * section usable on touch and for anyone not hunting for interactions.
 */
export default function ServiceTiles({ segments }: { segments: ServiceTile[] }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })
  const reduceMotion = useReducedMotion()

  // The photo settles out of a slight push-in as the tile rises — the two
  // moving at different rates is what stops it reading as a flat fade.
  const tile = reduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }
    : {
        hidden: { opacity: 0, y: 36 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
      }

  const media = reduceMotion
    ? { hidden: {}, visible: {} }
    : {
        hidden: { scale: 1.14 },
        visible: { scale: 1, transition: { duration: 1.3, ease } },
      }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } } }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
    >
      {segments.map((seg, index) => (
        <motion.article key={seg._id} variants={tile}>
          <Link
            href={seg.href}
            className="group relative block aspect-[4/3] sm:aspect-[3/4] overflow-hidden transition-shadow duration-500 ease-out hover:shadow-[0_28px_56px_-28px_rgba(7,20,33,0.6)]"
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            {/* Two nested layers so the entrance push-in and the hover zoom
                don't fight over the same transform — framer writes an inline
                style that a CSS transition can't override. */}
            <motion.div className="absolute inset-0" variants={media}>
              <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06]">
                {seg.imageUrl ? (
                  <Image
                    src={seg.imageUrl}
                    alt={seg.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      background:
                        'linear-gradient(150deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
                    }}
                  />
                )}
              </div>
            </motion.div>

            {/* Base scrim — always on, so the copy is legible over any photo
                rather than depending on how dark that particular image is. */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(7,20,33,0.94) 0%, rgba(7,20,33,0.62) 32%, rgba(7,20,33,0.16) 62%, rgba(7,20,33,0.04) 100%)',
              }}
            />
            {/* Hover deepens it and pulls a little brass up from the base. */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
              style={{
                background:
                  'linear-gradient(to top, rgba(7,20,33,0.96) 0%, rgba(11,34,55,0.7) 45%, rgba(192,138,62,0.10) 100%)',
              }}
            />
            {/* Hairline edge so the tile reads as an object, not a bleed. */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: 'var(--radius-md)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
              }}
            />

            <div className="absolute inset-x-0 bottom-0 p-6 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
              {/* Same 01–04 numbering as the /tjanster rail, so the landing
                  section and the detail page read as one system. */}
              <span
                className="font-heading text-[11px] tabular-nums tracking-[0.22em] block mb-2.5"
                style={{ color: 'var(--color-gold)' }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <h3
                className="font-heading font-semibold text-white leading-tight"
                style={{ fontSize: 'var(--text-2xl)', letterSpacing: '-0.01em' }}
              >
                {seg.title}
              </h3>

              <span
                aria-hidden
                className="block h-px w-10 my-3.5 origin-left scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
                style={{ background: 'var(--color-gold)' }}
              />

              {seg.shortDescription && (
                <p className="text-sm leading-relaxed line-clamp-3 text-white/70">
                  {seg.shortDescription}
                </p>
              )}

              <span
                className="inline-flex items-center gap-1.5 text-sm font-medium mt-4 text-white/85 transition-colors duration-300 group-hover:text-white"
              >
                Läs mer
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1"
                  style={{ color: 'var(--color-gold)' }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </div>
          </Link>
        </motion.article>
      ))}
    </motion.div>
  )
}
