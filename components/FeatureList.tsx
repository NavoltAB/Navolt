import { featureIcon, normalizeFeatures, splitFeature } from '@/lib/featureIcons'
import type { ServiceFeature } from '@/types/sanity'

interface FeatureListProps {
  features?: (ServiceFeature | string)[]
  /** Extra classes on the <ul> — spacing, mostly; the grid is set here. */
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
 */
export default function FeatureList({ features, className = '' }: FeatureListProps) {
  const items = normalizeFeatures(features)
  if (items.length === 0) return null

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
                <h3
                  className="font-heading font-semibold leading-snug"
                  style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary)' }}
                >
                  {label}
                </h3>
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
