'use client'
import { useEffect, useState } from 'react'

/**
 * Sticky index for the services page. Tracks which panel the reader is on and
 * marks it in the rail. Desktop only — the page stacks on mobile, where a
 * pinned rail would eat most of the screen.
 */
export default function ServiceIndexRail({
  items,
}: {
  items: { id: string; title: string }[]
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    // Mark a panel active once its top passes the upper third of the viewport,
    // so the rail reflects what's being read rather than what's merely visible.
    const onScroll = () => {
      const marker = window.innerHeight * 0.35
      let current = sections[0].id
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) current = section.id
      }
      setActiveId(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  return (
    <nav aria-label="Tjänster">
      <p className="section-label mb-5">Innehåll</p>
      <ol>
        {items.map((item, index) => {
          const active = item.id === activeId
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? 'true' : undefined}
                className="group flex items-baseline gap-3 py-2.5 pl-4 -ml-px border-l-2 transition-colors duration-300"
                style={{
                  borderColor: active ? 'var(--color-gold)' : 'var(--color-border)',
                }}
              >
                <span
                  className="font-heading text-xs tabular-nums tracking-[0.18em] transition-colors duration-300"
                  style={{
                    color: active ? 'var(--color-gold-ink)' : 'var(--color-text-muted)',
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={`text-sm transition-colors duration-300 ${
                    active ? 'font-semibold text-primary' : 'text-text-muted group-hover:text-primary'
                  }`}
                >
                  {item.title}
                </span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
