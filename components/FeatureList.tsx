import { featureIcon, normalizeFeatures } from '@/lib/featureIcons'
import type { ServiceFeature } from '@/types/sanity'

interface FeatureListProps {
  features?: (ServiceFeature | string)[]
  /** Extra classes on the <ul> — /tjanster runs two columns, the page one. */
  className?: string
}

/**
 * A service's "Vad ingår" list: ruled rows, each with its icon in front.
 *
 * Shared by the /tjanster panels and the service page so the two can't drift.
 * The icon comes from the document (see lib/featureIcons.ts); a bullet still
 * stored as a bare string, or with an icon key that no longer exists, falls
 * back to the bock rather than rendering nothing.
 */
export default function FeatureList({ features, className = '' }: FeatureListProps) {
  const items = normalizeFeatures(features)
  if (items.length === 0) return null

  return (
    <ul className={className}>
      {items.map((feature, i) => {
        const Icon = featureIcon(feature.icon)
        return (
          <li
            key={i}
            className="flex items-start gap-3 py-3 text-sm border-t"
            style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
          >
            <Icon
              aria-hidden="true"
              strokeWidth={1.75}
              className="h-4 w-4 shrink-0 mt-0.5"
              style={{ color: 'var(--color-gold-ink)' }}
            />
            <span>{feature.text}</span>
          </li>
        )
      })}
    </ul>
  )
}
