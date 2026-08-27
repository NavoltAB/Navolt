'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const ease = [0.16, 1, 0.3, 1] as const

/**
 * The pill-and-panel both filter controls on /produkter are built from.
 *
 * It owns nothing but its own open state — the actual selection lives in
 * ProductsShell, because the grid has to react to it. Closing is handled here
 * rather than by each menu: pointerdown outside, Escape, and a re-click on the
 * trigger all mean the same thing, and having three copies of that logic is how
 * one of them ends up subtly different.
 *
 * `pointerdown` rather than `click` so the panel is already gone by the time a
 * click lands on whatever was underneath it — otherwise opening one menu
 * straight from another swallows the first press.
 */
export default function FilterMenu({
  label,
  summary,
  active,
  disabled = false,
  children,
}: {
  label: string
  /** Replaces the label when something is selected, e.g. "Nyast" or "2 valda". */
  summary?: string | null
  active: boolean
  disabled?: boolean
  children: (close: () => void) => React.ReactNode
}) {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        // Send focus back to the trigger, or Escape leaves the keyboard user
        // stranded at the top of the document.
        wrapRef.current?.querySelector('button')?.focus()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={open ? panelId : undefined}
        className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          borderColor: active || open ? 'var(--color-primary)' : 'var(--color-border)',
          background: active ? 'var(--color-primary)' : 'var(--color-surface)',
          color: active ? '#fff' : 'var(--color-text)',
        }}
      >
        <span>{summary || label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
          className="transition-transform duration-300 ease-out"
          style={{ transform: open ? 'rotate(180deg)' : undefined }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.28, ease }}
            className="absolute left-0 z-40 mt-2 w-[17rem] origin-top overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 24px 48px -24px rgba(7,20,33,0.45)',
            }}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
