'use client'
import { useCookieConsent } from '@/context/CookieConsentContext'

/**
 * Reopens the consent dialog. Sits in the footer on every page, because GDPR
 * requires withdrawing consent to be as easy as giving it.
 */
export default function CookieSettingsButton({ className }: { className?: string }) {
  const { openSettings } = useCookieConsent()
  return (
    <button
      onClick={openSettings}
      className={className ?? 'footer-nav-link transition-colors duration-200'}
    >
      Cookie-inställningar
    </button>
  )
}
