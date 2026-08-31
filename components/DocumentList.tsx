import { StaggerContainer, StaggerItem } from '@/components/AnimatedSection'
import type { SanityFile } from '@/types/sanity'

/**
 * The download rows under a product's specs and on a service page.
 *
 * Both render the same thing — a monteringsanvisning is a monteringsanvisning
 * whether it hangs off the rutan or off the tjänsten — so the markup lives
 * here rather than in two pages that would drift apart.
 *
 * Renders nothing at all when there are no files, so a caller can hand it an
 * empty list without guarding first.
 */

// kB rather than KiB: the number on a download link is read by a customer
// deciding whether to tap it on mobile data, not by anyone doing arithmetic.
export function fileSize(bytes?: number) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentList({
  documents,
  className,
}: {
  documents: SanityFile[]
  className?: string
}) {
  if (documents.length === 0) return null

  return (
    <StaggerContainer className={className}>
      <ul>
        {documents.map((doc, i) => {
          const size = fileSize(doc.size)
          const label = doc.title || doc.filename || 'Dokument'
          return (
            <StaggerItem key={`${doc.url ?? label}-${i}`}>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5 py-3.5 transition-colors"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 group-hover:bg-[var(--color-gold)] group-hover:text-white"
                  style={{
                    background: 'rgba(192,138,62,0.12)',
                    color: 'var(--color-gold-ink)',
                  }}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                  >
                    <path d="M12 3v12" />
                    <polyline points="7 11 12 16 17 11" />
                    <path d="M4 20h16" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium transition-colors group-hover:text-[var(--color-gold-ink)]">
                    {label}
                  </span>
                  <span className="block text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {[doc.ext?.toUpperCase(), size].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </a>
            </StaggerItem>
          )
        })}
      </ul>
    </StaggerContainer>
  )
}
