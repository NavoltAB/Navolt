'use client'
import Script from 'next/script'
import { useCookieConsent } from '@/context/CookieConsentContext'

/**
 * Mounts an Elfsight widget — behind cookie consent.
 *
 * Elfsight works in two parts: an empty div carrying the app id, and
 * platform.js which finds it and renders into it. Both are needed — the div
 * alone renders nothing.
 *
 * The script is declared per widget rather than once in the layout, so a page
 * with no widgets never loads it. next/script deduplicates by src, so several
 * widgets on one page still fetch it once. `lazyOnload` keeps it off the
 * critical path.
 *
 * Nothing here renders until the visitor has allowed "Externa tjänster":
 * platform.js is a third-party script that sets its own cookies and pulls in
 * Facebook/Instagram content, so loading it before consent is exactly what
 * ePrivacy forbids. Until then the widget is replaced by a placeholder that
 * explains what's missing and opens the consent dialog.
 *
 * What each widget looks like is configured in the customer's Elfsight
 * dashboard, not here.
 */
export default function ElfsightWidget({
  appId,
  className,
  lazy = true,
  fallback = 'notice',
  fallbackLabel = 'Det här innehållet kommer från en extern tjänst (Elfsight).',
}: {
  appId: string
  className?: string
  /**
   * Elfsight's own deferral: with it on, the widget renders only once the div
   * reaches the viewport. Turn it off for a widget that is mounted deliberately
   * out of sight to warm it up — otherwise it sits there waiting to be seen and
   * never loads.
   */
  lazy?: boolean
  /**
   * What to show without consent. `notice` explains and offers to turn it on;
   * `none` renders nothing, for widgets that are chrome rather than content —
   * a placeholder card floating where the chat bubble used to be is worse than
   * an empty corner.
   */
  fallback?: 'notice' | 'none'
  /** First line of the placeholder, so each widget can name what it is. */
  fallbackLabel?: string
}) {
  const { consent, ready, openSettings } = useCookieConsent()

  // `ready` is false only for the first frame, before localStorage has been
  // read. Rendering the placeholder in that gap would flash it at every visitor
  // who has already said yes.
  if (!ready) return null

  if (!consent?.external) {
    if (fallback === 'none') return null
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-md border border-dashed px-6 py-10 text-center ${className ?? ''}`}
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      >
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {fallbackLabel}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Det visas först när du tillåter cookies för externa tjänster.
        </p>
        <button onClick={openSettings} className="btn-outline !py-2 !px-5 !text-xs">
          Tillåt och visa innehållet
        </button>
      </div>
    )
  }

  return (
    <>
      <div
        className={`elfsight-app-${appId} ${className ?? ''}`}
        {...(lazy ? { 'data-elfsight-app-lazy': '' } : {})}
      />
      <Script src="https://static.elfsight.com/platform/platform.js" strategy="lazyOnload" />
    </>
  )
}
