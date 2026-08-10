import ElfsightWidget from '@/components/ElfsightWidget'
import { siteConfig } from '@/config/site'

/** Facebook chat bubble, pinned bottom-right on every page of the site. */
export default function ChatBubble() {
  const appId = siteConfig.elfsight.chat
  if (!appId) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <ElfsightWidget appId={appId} />
    </div>
  )
}
