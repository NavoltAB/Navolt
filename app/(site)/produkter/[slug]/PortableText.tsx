import type { PortableTextBlock } from '@/types/sanity'

/**
 * Minimal renderer for the `description` rich-text field.
 *
 * Deliberately small: the product schema allows headings, paragraphs, lists and
 * inline emphasis, and `.prose-sanity` in globals.css styles exactly those. A
 * block type with no styles behind it is skipped rather than rendered bare.
 */
export default function PortableText({ value }: { value: PortableTextBlock[] }) {
  const blocks = value.filter((block) => block._type === 'block')

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

    if (block.style === 'h2') out.push(<h2 key={block._key}>{content}</h2>)
    else if (block.style === 'h3') out.push(<h3 key={block._key}>{content}</h3>)
    else if (block.style === 'blockquote') out.push(<blockquote key={block._key}>{content}</blockquote>)
    else out.push(<p key={block._key}>{content}</p>)
  })

  flush()

  return <>{out}</>
}
