import ElfsightWidget from '@/components/ElfsightWidget'
import { siteConfig } from '@/config/site'

/** Facebook chat bubble, pinned bottom-right on every page of the site. */
export default function ChatBubble() {
  const appId = siteConfig.elfsight.chat
  if (!appId) return null

  // The white disc and its padding are drawn inside the widget, so they can't
  // be styled from here — scaling the wrapper shrinks the whole bubble
  // proportionally instead. Anchored bottom-right so it stays in the corner.
  return (
    <div className="fixed bottom-4 right-4 z-50 origin-bottom-right scale-[0.85]">
      {/* No placeholder without consent: a dashed card parked in the corner
          of every page is worse than an empty corner. The chat is reachable
          again from the cookie settings in the footer. */}
      <ElfsightWidget appId={appId} fallback="none" />
    </div>
  )
}
