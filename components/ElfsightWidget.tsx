import Script from 'next/script'

/**
 * Mounts an Elfsight widget.
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
 * What each widget looks like is configured in the customer's Elfsight
 * dashboard, not here.
 */
export default function ElfsightWidget({
  appId,
  className,
}: {
  appId: string
  className?: string
}) {
  return (
    <>
      <div className={`elfsight-app-${appId} ${className ?? ''}`} data-elfsight-app-lazy />
      <Script src="https://static.elfsight.com/platform/platform.js" strategy="lazyOnload" />
    </>
  )
}
