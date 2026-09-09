import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'
import AnimatedSection from '@/components/AnimatedSection'
import type { ServiceHighlight } from '@/types/sanity'

/**
 * The "utvalda sektioner" on a service page — a wide band per section, image
 * on the left and the text on the right.
 *
 * Båtrutor runs two of them, one for monteringspaketen and one for
 * rutpaketen, which is why this takes a list rather than a single band. They
 * share one `section` wrapper so the gap between two bands is the stack's own
 * spacing, not two section paddings back to back.
 *
 * A band that lists things — what a paket contains — renders them as a
 * punktlista in two columns rather than as a paragraph. That list arrives
 * either from the studio's own list field or from a text block typed as one;
 * `normalizeHighlight()` in lib/highlights.ts is what tells the two apart, so
 * everything here can just render what it's given.
 */
export default function ServiceHighlights({
  highlights,
}: {
  highlights: ServiceHighlight[]
}) {
  if (highlights.length === 0) return null

  return (
    <section className="section">
      <div className="container mx-auto px-6 max-w-container space-y-20 lg:space-y-28">
        {highlights.map((highlight, index) => {
          const items = highlight.items ?? []
          return (
            <div
              key={`${highlight.title}-${index}`}
              // Without a picture the copy takes the full width — half a page
              // of text beside half a page of nothing is worse than no
              // two-column layout at all.
              className={
                highlight.imageUrl
                  ? 'grid lg:grid-cols-2 gap-12 lg:gap-16 items-center'
                  : 'max-w-3xl'
              }
            >
              {highlight.imageUrl && (
                <AnimatedSection>
                  <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                    <Image
                      src={highlight.imageUrl}
                      alt={highlight.title ?? ''}
                      fill
                      sizes="(max-width: 1024px) 100vw, 600px"
                      className="object-cover"
                    />
                  </div>
                </AnimatedSection>
              )}

              <AnimatedSection delay={0.1}>
                {highlight.label && <p className="section-label mb-3">{highlight.label}</p>}
                <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-5">
                  {highlight.title}
                </h2>
                {highlight.text && (
                  <p
                    className={`text-base leading-relaxed ${items.length > 0 ? 'mb-6' : 'mb-8'}`}
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {highlight.text}
                  </p>
                )}

                {items.length > 0 && (
                  // Two columns, because these lists are long and short-lined —
                  // a dozen product names down a single column runs past the
                  // picture it is supposed to sit beside.
                  <ul className="mb-8 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                    {items.map((item, i) => (
                      <li
                        key={`${item}-${i}`}
                        className="flex items-start gap-2.5 text-sm leading-relaxed"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <Check
                          aria-hidden="true"
                          strokeWidth={2.5}
                          className="mt-[0.3rem] h-3.5 w-3.5 shrink-0"
                          style={{ color: 'var(--color-gold-ink)' }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {highlight.ctaLabel && highlight.ctaHref && (
                  <Link href={highlight.ctaHref} className="btn-gold">
                    {highlight.ctaLabel}
                  </Link>
                )}
              </AnimatedSection>
            </div>
          )
        })}
      </div>
    </section>
  )
}
