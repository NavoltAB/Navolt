import Script from 'next/script'
import { siteConfig } from '@/config/site'

/**
 * Facebook chat bubble, served by Elfsight.
 *
 * Elfsight works in two parts: this empty div carries the app id, and
 * platform.js finds it and mounts the widget into it. Both are needed —
 * the div alone renders nothing. `lazyOnload` keeps the ~100kB script off
 * the critical path; the bubble appears a moment after the page is usable.
 *
 * The widget itself (colour, greeting, which Facebook page it opens) is
 * configured in the customer's Elfsight dashboard, not here.
 */
export default function ChatBubble() {
  const appId = siteConfig.elfsight.chat
  if (!appId) return null

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`elfsight-app-${appId}`} data-elfsight-app-lazy />
      </div>
      <Script src="https://static.elfsight.com/platform/platform.js" strategy="lazyOnload" />
    </>
  )
}
