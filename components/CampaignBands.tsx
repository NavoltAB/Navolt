import Link from 'next/link'
import Image from 'next/image'
import AnimatedSection from '@/components/AnimatedSection'
import type { Campaign } from '@/types/sanity'

/**
 * The landing page's campaign section — kampanjveckor, rea, tidsbegränsade
 * erbjudanden. Sits between "Varför Navolt" and "Om oss".
 *
 * It borrows the About band's shape on purpose: same two-column grid, same
 * image proportions, same eyebrow → rubrik → text → knapp order. Three things
 * separate it from the band underneath, and they are deliberately the cheap
 * ones — nothing here is a new layout to maintain:
 *
 * - The columns are **mirrored**. Text left, photo right, so the campaign and
 *   the About band below read as a pair rather than a repeat.
 * - It sits in a **brass-tinted panel** with a hairline brass border. The rest
 *   of the page uses the accent by the word; this is the one block allowed to
 *   use it as a surface, which is what marks it as an offer.
 * - The button is `btn-gold`, not `btn-outline`.
 *
 * Renders nothing at all when no campaign is active — which is most of the
 * year. The caller checks the array rather than this component rendering an
 * empty `<section>`, so the section's border doesn't leave a stray rule behind.
 */

/**
 * "Gäller t.o.m. 30 september" — the year is added only when the campaign ends
 * in a different one, so the common case stays short and the December band
 * running into January still says which January it means.
 */
function formatEndDate(endDate: string): string | null {
  const date = new Date(`${endDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(date)
}

function CampaignBand({ campaign }: { campaign: Campaign }) {
  const { title, titleAccent, label, text, badge, imageUrl, ctaLabel, ctaHref, endDate } = campaign

  // Same rule as the long prose fields elsewhere: a blank line is a paragraph.
  const paragraphs = (text ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const until = endDate ? formatEndDate(endDate) : null
  const href = ctaHref?.trim() || '/kontakt'
  const external = href.startsWith('http')

  const button = external ? (
    <a href={href} className="btn-gold" target="_blank" rel="noopener noreferrer">
      {ctaLabel?.trim() || 'Läs mer'}
    </a>
  ) : (
    <Link href={href} className="btn-gold">
      {ctaLabel?.trim() || 'Läs mer'}
    </Link>
  )

  return (
    <article
      className="overflow-hidden"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(192, 138, 62, 0.32)',
        // Brass wash across the text column, fading out under the photo so the
        // tint never fights the image it meets.
        background:
          'linear-gradient(105deg, rgba(192,138,62,0.13) 0%, rgba(192,138,62,0.05) 48%, var(--color-surface) 78%)',
      }}
    >
      <div
        className={`grid grid-cols-1 items-center ${imageUrl ? 'lg:grid-cols-2' : ''}`}
      >
        {/* Text — first in the DOM, and first on screen once the grid stacks.
            The photo is the hook on a phone, but the offer is the message. */}
        <AnimatedSection
          direction="left"
          className="order-2 lg:order-1 px-7 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16"
        >
          <p className="section-label mb-4">{label?.trim() || 'Kampanj'}</p>

          <h2 className="section-title mb-5" style={{ lineHeight: 1.12 }}>
            {title}
            {titleAccent?.trim() && (
              <>
                {' '}
                <em style={{ color: 'var(--color-gold)', fontStyle: 'italic' }}>
                  {titleAccent.trim()}
                </em>
              </>
            )}
          </h2>

          {paragraphs.length > 0 && (
            <div className="space-y-3 mb-8" style={{ maxWidth: '560px' }}>
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="section-subtitle">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            {button}

            {until && (
              <span
                className="inline-flex items-center gap-2 text-sm"
                style={{ color: 'var(--color-gold-ink)' }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <polyline points="12 7 12 12 15.5 14" />
                </svg>
                {/* <time> so the deadline is machine-readable, not just ink. */}
                Gäller t.o.m. <time dateTime={endDate}>{until}</time>
              </span>
            )}
          </div>
        </AnimatedSection>

        {imageUrl && (
          <AnimatedSection direction="right" className="order-1 lg:order-2 h-full">
            <div
              className="relative aspect-[5/4] lg:aspect-auto lg:h-full lg:min-h-[26rem]"
              style={{ background: 'var(--color-primary)' }}
            >
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />

              {badge?.trim() && (
                <span
                  className="absolute top-5 right-5 font-heading font-semibold"
                  style={{
                    background: 'var(--color-gold)',
                    color: '#fff',
                    padding: '0.5rem 1.1rem',
                    borderRadius: '100px',
                    fontSize: 'var(--text-base)',
                    letterSpacing: '0.01em',
                    boxShadow: '0 6px 18px rgba(11, 34, 55, 0.22)',
                  }}
                >
                  {badge.trim()}
                </span>
              )}
            </div>
          </AnimatedSection>
        )}
      </div>
    </article>
  )
}

export default function CampaignBands({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) return null

  return (
    <section className="section" style={{ borderTop: '1px solid var(--color-border)' }}>
      <div className="container mx-auto px-6" style={{ maxWidth: 'var(--container-max)' }}>
        {/* Two campaigns at once is a deal week, not the norm — they stack with
            a gap rather than competing for one row. */}
        <div className="space-y-10">
          {campaigns.map((campaign) => (
            <CampaignBand key={campaign._id} campaign={campaign} />
          ))}
        </div>
      </div>
    </section>
  )
}
