import { featureIcon, groupFeatures, splitFeature } from '@/lib/featureIcons'
import type { NormalizedFeature } from '@/lib/featureIcons'
import type { ServiceFeatureItem } from '@/types/sanity'

interface FeatureListProps {
  features?: ServiceFeatureItem[]
  /** Extra classes on the outer element — spacing, mostly; the grid is set here. */
  className?: string
}

/**
 * A service's "Vad ingår" list, as cards.
 *
 * Used on the service page. It was a single ruled column running down one side
 * of the body copy, which turned twelve bullets into a very tall grey ribbon
 * beside an empty half-page; cards let the same list fill the width and be
 * scanned rather than read top to bottom.
 *
 * Each card leads with the bullet's label ("Solcell", "Kopplingsschema") in
 * the heading font, so the eye can find the right one without reading every
 * sentence — see `splitFeature`. A bullet with no label still renders, just as
 * a sentence under its icon.
 *
 * The icon comes from the document (see lib/featureIcons.ts); a bullet still
 * stored as a bare string, or with an icon key that no longer exists, falls
 * back to the bock rather than rendering nothing.
 *
 * Where the editor has dropped category headings into the array, the cards
 * come back as several titled groups (`groupFeatures`) and each gets its own
 * heading above its own grid — twenty cards in one undifferentiated grid is a
 * wall, and marinelektronik is exactly that long. An uncategorised service
 * comes back as one untitled group and renders as the plain grid it always
 * was, so nothing changes for the services nobody has categorised.
 */
export default function FeatureList({ features, className = '' }: FeatureListProps) {
  const groups = groupFeatures(features)
  if (groups.length === 0) return null

  // One untitled group is the uncategorised case: no heading to render, and
  // no section wrapper worth the extra element.
  if (groups.length === 1 && !groups[0].title) {
    return <FeatureGrid items={groups[0].items} headingTag="h3" className={className} />
  }

  return (
    <div className={`space-y-12 md:space-y-14 ${className}`.trim()}>
      {groups.map((group, i) => (
        <section key={`${group.title ?? 'ovrigt'}-${i}`}>
          {group.title && (
            <div className="flex items-center gap-4 mb-5">
              <h3
                className="font-heading text-xl md:text-2xl font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                {group.title}
              </h3>
              {/* Carries the eye across to the next category and keeps the
                  headings from reading as four separate page sections. */}
              <span className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
            </div>
          )}
          <FeatureGrid items={group.items} headingTag="h4" />
        </section>
      ))}
    </div>
  )
}

/**
 * The cards themselves.
 *
 * `headingTag` keeps the document outline intact: a card sits under the
 * page's h2 when there are no categories, and under a category's h3 when
 * there are — the same markup either way, one level down.
 */
function FeatureGrid({
  items,
  headingTag: CardHeading,
  className = '',
}: {
  items: NormalizedFeature[]
  headingTag: 'h3' | 'h4'
  className?: string
}) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`.trim()}>
      {items.map((feature, i) => {
        const Icon = featureIcon(feature.icon)
        const { label, body } = splitFeature(feature.text)
        return (
          <li key={i} className="card h-full p-5">
            <div className="flex items-center gap-2.5 mb-2.5">
              <Icon
                aria-hidden="true"
                strokeWidth={1.75}
                className="h-4 w-4 shrink-0"
                style={{ color: 'var(--color-gold-ink)' }}
              />
              {label && (
                <CardHeading
                  className="font-heading font-semibold leading-snug"
                  style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary)' }}
                >
                  {label}
                </CardHeading>
              )}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {body}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
