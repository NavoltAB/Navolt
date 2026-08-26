'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useCookieConsent } from '@/context/CookieConsentContext'

/**
 * The consent banner and its settings dialog.
 *
 * Rules it has to keep to stay lawful:
 *  - nothing non-essential loads before an answer (enforced in `ElfsightWidget`,
 *    not here — a banner that only *asks* while the scripts already ran is the
 *    single most common way these get this wrong),
 *  - refusing is exactly as easy as accepting: two buttons of the same weight,
 *    side by side, never "Acceptera alla" alone with the refusal buried,
 *  - the choice stays reversible, via the footer link.
 */
export default function CookieBanner() {
  const {
    consent,
    hasResponded,
    ready,
    showSettings,
    acceptAll,
    rejectAll,
    saveCustom,
    openSettings,
    closeSettings,
  } = useCookieConsent()

  const [external, setExternal] = useState(false)

  useEffect(() => {
    if (showSettings) setExternal(consent?.external ?? false)
  }, [showSettings, consent])

  // Esc closes the dialog — it's opened from the footer on every page, and a
  // modal you can't dismiss from the keyboard is a trap.
  useEffect(() => {
    if (!showSettings) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSettings()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showSettings, closeSettings])

  return (
    <AnimatePresence>
      {ready && !hasResponded && !showSettings && (
        <motion.div
          key="cookie-banner"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-[200] border-t shadow-xl"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          role="dialog"
          aria-modal="false"
          aria-label="Cookie-meddelande"
        >
          <div className="container mx-auto px-6 py-5 max-w-container">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <p
                  className="font-heading text-base font-semibold mb-1"
                  style={{ color: 'var(--color-text)' }}
                >
                  Vi använder cookies
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  Nödvändiga cookies krävs för att sidan ska fungera. Vi vill också gärna visa
                  innehåll från externa tjänster — chatt, recensioner och vårt Instagram-flöde —
                  men de sätter egna cookies och laddas därför bara om du säger ja. Läs mer i vår{' '}
                  <Link
                    href="/cookies"
                    className="underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    cookiepolicy
                  </Link>{' '}
                  och{' '}
                  <Link
                    href="/integritetspolicy"
                    className="underline underline-offset-2 hover:text-primary transition-colors"
                  >
                    integritetspolicy
                  </Link>
                  .
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button onClick={rejectAll} className="btn-outline !py-2 !px-5 !text-xs">
                  Endast nödvändiga
                </button>
                <button onClick={acceptAll} className="btn-primary !py-2 !px-5 !text-xs">
                  Acceptera alla
                </button>
                <button
                  onClick={openSettings}
                  className="text-xs underline underline-offset-2 transition-colors hover:text-primary"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Hantera inställningar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {showSettings && (
        <motion.div
          key="cookie-settings"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center p-4 sm:p-6"
          style={{ background: 'rgba(11,34,55,0.6)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSettings()
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Cookie-inställningar"
        >
          <motion.div
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-lg rounded-lg overflow-hidden shadow-2xl"
            style={{ background: 'var(--color-surface)' }}
          >
            <div
              className="flex items-center justify-between px-6 py-5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="font-heading text-xl font-semibold">Cookie-inställningar</h2>
              <button
                onClick={closeSettings}
                aria-label="Stäng"
                className="p-1 rounded transition-colors hover:text-primary"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Välj vilka cookies du tillåter. Du kan ändra ditt val när som helst via
                &ldquo;Cookie-inställningar&rdquo; längst ned på sidan. Läs mer i vår{' '}
                <Link
                  href="/cookies"
                  className="underline underline-offset-2 hover:text-primary transition-colors"
                >
                  cookiepolicy
                </Link>
                .
              </p>

              <div
                className="flex items-start gap-4 py-4 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-1">Nödvändiga</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    Krävs för att webbplatsen ska fungera. Här sparas ditt cookie-val och
                    innehållet i offertkorgen, lokalt i din webbläsare. Ingenting delas med tredje
                    part. Kan inte stängas av.
                  </p>
                </div>
                <span
                  className="shrink-0 mt-0.5 text-xs font-medium px-2.5 py-1 rounded"
                  style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}
                >
                  Alltid på
                </span>
              </div>

              <div
                className="flex items-start gap-4 py-4 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold mb-1">Externa tjänster</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    Låter oss visa chatten, recensionerna och Instagram-flödet. De levereras av
                    Elfsight och hämtar innehåll från Facebook och Instagram, sätter egna cookies
                    och kan registrera att du besökt sidan. Utan det här valet visas innehållet
                    inte alls.
                  </p>
                </div>
                <Toggle checked={external} onChange={setExternal} label="Tillåt externa tjänster" />
              </div>
            </div>

            <div
              className="px-6 py-5 border-t flex flex-wrap gap-3"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <button
                onClick={() => saveCustom({ external })}
                className="btn-primary !py-2 !px-5 !text-xs"
              >
                Spara inställningar
              </button>
              <button onClick={rejectAll} className="btn-outline !py-2 !px-5 !text-xs">
                Endast nödvändiga
              </button>
              <button onClick={acceptAll} className="btn-outline !py-2 !px-5 !text-xs">
                Acceptera alla
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="shrink-0 mt-0.5 relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background: checked ? 'var(--color-primary)' : 'var(--color-border)',
        outlineColor: 'var(--color-primary)',
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}
