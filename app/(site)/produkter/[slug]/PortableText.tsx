import type { PortableTextBlock } from '@/types/sanity'

/**
 * Minimal renderer for the `description` rich-text fields.
 *
 * Deliberately small: the schemas allow headings, paragraphs, lists and inline
 * emphasis, and `.prose-sanity` in globals.css styles exactly those. A block
 * type with no styles behind it is skipped rather than rendered bare.
 *
 * ── Heading levels ───────────────────────────────────────────────────────
 * An editor picks a heading by how it looks in the studio, not by where the
 * field ends up in the page — the product descriptions all lead with "H3"
 * because that was the size that read right, which put an h3 straight under
 * the page h1 and skipped a level in the outline.
 *
 * So the levels are relative, not literal: the shallowest heading used in the
 * field is pinned to `baseLevel` and every deeper one keeps its distance from
 * it. `baseLevel` is the level *below* whatever heading introduces the field —
 * 2 on a product page, where the description hangs off the h1, and 3 on a
 * service page, where the brödtext sits inside a section that already has its
 * own h2. The relative structure the editor typed survives either way.
 */

const HEADING_LEVELS: Record<string, number> = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 }

type HeadingTag = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export default function PortableText({
  value,
  baseLevel = 2,
}: {
  value: PortableTextBlock[]
  /** The level the field's own top heading should render at. 2–5. */
  baseLevel?: 2 | 3 | 4 | 5
}) {
  const blocks = value.filter((block) => block._type === 'block')

  const used = blocks.map((block) => HEADING_LEVELS[block.style ?? ''] ?? 0).filter(Boolean)
  const shallowest = used.length > 0 ? Math.min(...used) : baseLevel
  // Clamped at h6, so a field nested four styles deep still renders a heading
  // rather than an invalid tag.
  const tagFor = (style: string): HeadingTag =>
    `h${Math.min(6, baseLevel + (HEADING_LEVELS[style] - shallowest))}` as HeadingTag

  const out: React.ReactNode[] = []
  let list: { key: string; items: React.ReactNode[] } | null = null

  const flush = () => {
    if (!list) return
    out.push(<ul key={`ul-${list.key}`}>{list.items}</ul>)
    list = null
  }

  blocks.forEach((block) => {
    const content = block.children.map((child, i) =>
      // `marks` also carries link annotations keyed to markDefs; those are not
      // offered in the studio for products, so only the two style marks matter.
      child.marks?.includes('strong') ? (
        <strong key={i}>{child.text}</strong>
      ) : child.marks?.includes('em') ? (
        <em key={i}>{child.text}</em>
      ) : (
        <span key={i}>{child.text}</span>
      )
    )

    if (block.listItem) {
      if (!list) list = { key: block._key, items: [] }
      list.items.push(<li key={block._key}>{content}</li>)
      return
    }

    flush()

    const style = block.style ?? ''
    if (HEADING_LEVELS[style]) {
      const Heading = tagFor(style)
      out.push(<Heading key={block._key}>{content}</Heading>)
    } else if (style === 'blockquote') {
      out.push(<blockquote key={block._key}>{content}</blockquote>)
    } else {
      out.push(<p key={block._key}>{content}</p>)
    }
  })

  flush()

  return <>{out}</>
}
