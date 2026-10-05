import { featureIcon, groupFeatures, splitFeature } from '@/lib/featureIcons'
import type { FeatureGroup, NormalizedFeature } from '@/lib/featureIcons'
import type { ServiceFeatureItem } from '@/types/sanity'

/**
 * How the punch list is laid out.
 *
 * `cards` — one card per bullet. Reads as a sortiment of separate things, which
 * is what marinelektronik and campervan are: a litiumkonvertering and an
 * autopilot have nothing to do with each other beyond both being jobs we take.
 *
 * `grouped` — one card per category, the bullets inside it as a list. For a
 * service whose bullets are the *contents* of a few jobs rather than jobs in
 * their own right: motorservice's twenty-six are eight things we change in an
 * oil service and ten in a vinterkonservering, and twenty-six separate cards
 * said that an impeller and a vinterkonservering were the same size of thing.
 */
export type FeaturesLayout = 'cards' | 'grouped'

interface FeatureListProps {
  features?: ServiceFeatureItem[]
  layout?: FeaturesLayout
  /**
   * The level the *category* rubriker sit at. In `cards` the bullets go one
   * below; in `grouped` they are list items and take no heading at all. 2 where
   * the section's eyebrow is the only thing above the list, 3 where the page
   * has given it a rubrik of its own and that rubrik is the h2. The caller
   * knows which, since it is the one rendering the rubrik.
   */
  headingLevel?: 2 | 3
  /** Extra classes on the outer element — spacing, mostly; the grid is set here. */
  className?: string
}

/**
 * A service's "Vad ingår" list.
 *
 * Used on the service page. It was a single ruled column running down one side
 * of the body copy, which turned twelve bullets into a very tall grey ribbon
 * beside an empty half-page; the list fills the width instead and is scanned
 * rather than read top to bottom.
 *
 * Each bullet leads with its label ("Solcell", "Kopplingsschema") in the
 * heading font, so the eye can find the right one without reading every
 * sentence — see `splitFeature`. A bullet with no label still renders, just as
 * a sentence under its icon.
 *
 * The icon comes from the document (see lib/featureIcons.ts); a bullet still
 * stored as a bare string, or with an icon key that no longer exists, falls
 * back to the bock rather than rendering nothing.
 *
 * Where the editor has dropped category headings into the array, the bullets
 * come back as several titled groups (`groupFeatures`), each with its own
 * heading — twenty bullets in one undifferentiated grid is a wall, and
 * marinelektronik is exactly that long. An uncategorised service comes back as
 * one untitled group and renders as the plain grid it always was, so nothing
 * changes for the services nobody has categorised.
 */
export default function FeatureList({
  features,
  layout = 'cards',
  headingLevel = 2,
  className = '',
}: FeatureListProps) {
  const groups = groupFeatures(features)
  if (groups.length === 0) return null

  const GroupHeading = `h${headingLevel}` as 'h2' | 'h3'
  const bulletHeading = `h${headingLevel + 1}` as 'h3' | 'h4'

  if (layout === 'grouped') {
    return <GroupedCards groups={groups} heading={GroupHeading} className={className} />
  }

  // One untitled group is the uncategorised case: no heading to render, and
  // no section wrapper worth the extra element. The cards still take the level
  // the groups would have had — there is no rubrik between them and the page.
  if (groups.length === 1 && !groups[0].title) {
    return (
      <FeatureGrid items={groups[0].items} headingTag={GroupHeading} className={className} />
    )
  }

  return (
    <div className={`space-y-12 md:space-y-14 ${className}`.trim()}>
      {groups.map((group, i) => (
        <section key={`${group.title ?? 'ovrigt'}-${i}`}>
          {group.title && (
            <div className="flex items-center gap-4 mb-5">
              <GroupHeading
                className="font-heading text-xl md:text-2xl font-semibold"
                style={{ color: 'var(--color-primary)' }}
              >
                {group.title}
              </GroupHeading>
              {/* Carries the eye across to the next category and keeps the
                  headings from reading as four separate page sections. */}
              <span className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
            </div>
          )}
          <FeatureGrid items={group.items} headingTag={bulletHeading} />
        </section>
      ))}
    </div>
  )
}

/**
 * The `grouped` layout: a card per category, its bullets listed inside.
 *
 * `items-start` rather than a stretched row, so a category with four bullets
 * is a short card instead of four lines of copy marooned at the top of a tall
 * one — the categories are genuinely different lengths and the layout is
 * better off saying so.
 *
 * The bullets are list items, not headings: inside a named category an
 * impeller is a line on a checklist, and marking twenty-six of them as
 * headings buried the four rubriker that actually carry the section. The
 * number above each rubrik is the same 01–04 the steps and the landing tiles
 * use, which is what ties this back to the rest of the page.
 */
function GroupedCards({
  groups,
  heading: GroupHeading,
  className = '',
}: {
  groups: FeatureGroup[]
  heading: 'h2' | 'h3'
  className?: string
}) {
  return (
    <div
      className={`grid items-start gap-5 md:grid-cols-2 ${className}`.trim()}
    >
      {groups.map((group, i) => (
        <section key={`${group.title ?? 'ovrigt'}-${i}`} className="card h-auto p-7 md:p-8">
          {group.title && (
            <>
              <span
                className="font-heading text-[11px] tabular-nums tracking-[0.22em] block mb-2.5"
                style={{ color: 'var(--color-gold-ink)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <GroupHeading
                className="font-heading text-xl md:text-2xl font-semibold mb-6"
                style={{ color: 'var(--color-primary)' }}
              >
                {group.title}
              </GroupHeading>
            </>
          )}

          <ul className="space-y-4">
            {group.items.map((feature, j) => {
              const Icon = featureIcon(feature.icon)
              const { label, body } = splitFeature(feature.text)
              return (
                <li key={j} className="flex gap-3">
                  {/* Nudged down to the cap height of the line beside it —
                      centred on the row it would float between two lines of
                      body copy on a bullet that wraps. */}
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.75}
                    className="h-4 w-4 shrink-0 mt-0.5"
                    style={{ color: 'var(--color-gold-ink)' }}
                  />
                  <div>
                    {label && (
                      <span
                        className="block font-heading font-semibold leading-snug"
                        style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary)' }}
                      >
                        {label}
                      </span>
                    )}
                    <p
                      className={`text-sm leading-relaxed ${label ? 'mt-1' : ''}`}
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {body}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

/**
 * The `cards` layout: one card per bullet.
 *
 * `headingTag` keeps the document outline intact: the caller works out what a
 * card sits under — a category rubrik, or the section itself where there are
 * no categories — and passes the level one below it.
 */
function FeatureGrid({
  items,
  headingTag: CardHeading,
  className = '',
}: {
  items: NormalizedFeature[]
  headingTag: 'h2' | 'h3' | 'h4'
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
