'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlFor } from '@/sanity/imageUrl'
import type { Product } from '@/types/sanity'

export default function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.mainImage
    ? urlFor(product.mainImage).width(600).height(480).fit('crop').url()
    : null

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group h-full flex flex-col"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      {/* Image */}
      <Link
        href={`/produkter/${product.slug}`}
        className="block relative overflow-hidden aspect-[4/3]"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #16302A 100%)',
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
              KR
            </span>
          </div>
        )}

        {/* Category chip — overlaid top-left */}
        {product.category && (
          <span
            className="absolute top-3 left-3 text-[10px] font-semibold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full backdrop-blur-sm"
            style={{ background: 'rgba(251,250,246,0.9)', color: 'var(--color-primary)' }}
          >
            {product.category.title}
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(12,28,24,0.5)' }}
          >
            <span className="text-white text-xs font-semibold tracking-[0.2em] uppercase">
              Slut i lager
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-2">
        <Link href={`/produkter/${product.slug}`}>
          <h3
            className="font-heading font-semibold leading-snug group-hover:underline"
            style={{
              fontSize: 'var(--text-lg)',
              textDecorationColor: 'var(--color-gold)',
              textUnderlineOffset: '4px',
            }}
          >
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {product.shortDescription}
          </p>
        )}

        {/* Footer — price + arrow link */}
        <div className="flex items-end justify-between gap-2 mt-auto pt-4">
          {product.price ? (
            <p
              className="font-heading font-semibold"
              style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary)' }}
            >
              {product.price.toLocaleString('sv-SE')} kr
              {product.unit && (
                <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                  / {product.unit}
                </span>
              )}
            </p>
          ) : (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Kontakta oss för pris
            </p>
          )}

          <Link
            href={`/produkter/${product.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium shrink-0"
            style={{ color: 'var(--color-secondary)' }}
          >
            Mer info
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="translate-x-0 group-hover:translate-x-1 transition-transform duration-200"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.article>
  )
}
