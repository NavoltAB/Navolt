'use client'
import { motion, useReducedMotion } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1] as const

/**
 * Header for the product index.
 *
 * Same shape and ground as the headers on /tjanster, /kontakt and /om-oss —
 * `pt-32 pb-16` on `--color-surface` — so the subpages all open the same way.
 * The only thing this one adds is the pair of counts under the subtitle, which
 * state the size of the catalogue instead of implying one.
 *
 * Copy arrives as props: the page is a server component and owns the Sanity
 * read, this is a client component only because of the entrance animation.
 */
export default function ProductsHero({
  label,
  title,
  subtitle,
  count,
  categoryCount,
}: {
  label: string
  title: string
  subtitle: string
  count: number
  categoryCount: number
}) {
  const reduceMotion = useReducedMotion()

  // One container drives the whole header so the label, title and subtitle
  // arrive as a sequence rather than three independent fades.
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
  }

  const rise = reduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.4 } } }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
      }

  return (
    <div className="pt-32 pb-16" style={{ background: 'var(--color-surface)' }}>
      <div className="container mx-auto px-6 max-w-container">
        <motion.div initial="hidden" animate="visible" variants={container}>
          <motion.p variants={rise} className="section-label mb-3">
            {label}
          </motion.p>

          <motion.h1 variants={rise} className="section-title mb-5">
            {title}
          </motion.h1>

          <motion.p variants={rise} className="section-subtitle">
            {subtitle}
          </motion.p>

          {/* Reads out the same two numbers the rail shows. */}
          <motion.div
            variants={rise}
            className="mt-8 flex items-center gap-5 text-xs uppercase tracking-[0.18em]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <span className="tabular-nums">
              {count} {count === 1 ? 'produkt' : 'produkter'}
            </span>
            <span
              aria-hidden
              className="h-3 w-px"
              style={{ background: 'var(--color-border)' }}
            />
            <span className="tabular-nums">
              {categoryCount} {categoryCount === 1 ? 'kategori' : 'kategorier'}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
