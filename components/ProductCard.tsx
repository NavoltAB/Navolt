'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { urlFor } from '@/sanity/imageUrl'
import type { Product } from '@/types/sanity'

const ease = [0.16, 1, 0.3, 1] as const

/**
 * The counterpart to ServiceTiles. Services are dark, full-bleed photography
 * with the copy set on the image; products stay light, bordered and card-shaped
 * because they carry price and stock. The two should be tellable apart at a
 * glance without reading a word — that split is deliberate, so keep the card
 * chrome here and off the services.
 *
 * Shared with the tiles: the 0.16/1/0.3/1 curve, the brass rule that sweeps out
 * under the title, and the entrance push-in on the photo.
 */
export default function ProductCard({ product }: { product: Product }) {
  const reduceMotion = useReducedMotion()
  const href = `/produkter/${product.slug}`

  // Square. Product shots are usually square to begin with, so this crops
  // nothing, and it keeps the card short enough to sit four-up without towering
  // over the service tiles beside it.
  const main = product.mainImage
    ? urlFor(product.mainImage).width(900).height(900).fit('crop').url()
    : null
  const hover = product.hoverImage
    ? urlFor(product.hoverImage).width(900).height(900).fit('crop').url()
    : null

  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  const sweep = 'transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]'

  return (
    <motion.article
      className="h-full"
      whileHover={reduceMotion ? undefined : { y: -6 }}
      transition={{ duration: 0.5, ease }}
    >
      <Link
        href={href}
        className="group flex h-full flex-col overflow-hidden transition-shadow duration-500 ease-out hover:shadow-[0_28px_56px_-28px_rgba(7,20,33,0.45)]"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div
          className="relative aspect-square overflow-hidden"
          style={{ background: 'var(--color-bg)' }}
        >
          {/* Inherits hidden/visible from whichever StaggerContainer wraps the
              grid, so the photo settles out of a push-in as the card rises. No
              stagger ancestor and it simply renders untransformed. */}
          <motion.div
            className="absolute inset-0"
            variants={
              reduceMotion
                ? undefined
                : {
                    hidden: { scale: 1.1 },
                    visible: { scale: 1, transition: { duration: 1.2, ease } },
                  }
            }
          >
            {main ? (
              <>
                <Image
                  src={main}
                  alt={product.name}
                  fill
                  sizes={sizes}
                  className={`object-cover ${sweep} group-hover:scale-[1.05] ${
                    hover ? 'group-hover:opacity-0' : ''
                  } ${product.inStock ? '' : 'grayscale'}`}
                />
                {/* Second shot from the images array, when there is one. */}
                {hover && (
                  <Image
                    src={hover}
                    alt=""
                    aria-hidden
                    fill
                    sizes={sizes}
                    className={`object-cover opacity-0 ${sweep} group-hover:scale-[1.05] group-hover:opacity-100 ${
                      product.inStock ? '' : 'grayscale'
                    }`}
                  />
                )}
              </>
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  background:
                    'linear-gradient(150deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
                }}
              >
                <span
                  className="font-heading font-semibold select-none"
                  style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                    color: 'rgba(255,255,255,0.08)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  {product.name.charAt(0)}
                </span>
              </div>
            )}
          </motion.div>

          {product.category && (
            <span
              className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] backdrop-blur-md"
              style={{
                background: 'rgba(250,251,250,0.88)',
                color: 'var(--color-primary)',
                boxShadow: '0 0 0 1px rgba(18,48,74,0.08)',
              }}
            >
              {product.category.title}
            </span>
          )}

          {/* A chip plus the grayscale above, rather than a slab across the
              photo — it still reads instantly but doesn't wreck the card. */}
          {!product.inStock && (
            <span
              className="absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md"
              style={{ background: 'rgba(11,34,55,0.82)' }}
            >
              Slut i lager
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3
            className="font-heading font-semibold leading-snug"
            style={{ fontSize: 'var(--text-lg)', color: 'var(--color-primary)' }}
          >
            {product.name}
          </h3>

          <span
            aria-hidden
            className="my-2.5 block h-px w-9 origin-left scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
            style={{ background: 'var(--color-gold)' }}
          />

          {product.shortDescription && (
            <p
              className="line-clamp-2 text-sm leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {product.shortDescription}
            </p>
          )}

          <div
            className="mt-auto flex items-end justify-between gap-3 pt-4"
            style={{ borderTop: '1px solid var(--color-border)', marginTop: '1rem' }}
          >
            {product.price ? (
              <p
                className="font-heading font-semibold tabular-nums"
                style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary)' }}
              >
                {product.price.toLocaleString('sv-SE')} kr
                {product.unit && (
                  <span
                    className="ml-1 text-sm font-normal"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    / {product.unit}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Kontakta oss för pris
              </p>
            )}

            {/* Same glyph treatment as the header phone button — fills brass on
                hover rather than just tinting, which is what makes the card feel
                like it responds as one object. */}
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(192,138,62,0.12)] text-[var(--color-gold-ink)] transition-colors duration-300 ease-out group-hover:bg-[var(--color-gold)] group-hover:text-white"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
