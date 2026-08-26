'use client'
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

/**
 * Cookie consent for the whole site.
 *
 * Two categories only, because the site only has two:
 *
 *  - `necessary` — always on, never asked about. Nothing is stored beyond the
 *    consent record itself and the offert basket, both first-party localStorage.
 *  - `external`  — the Elfsight widgets (chat, recensioner, Instagram) and the
 *    Facebook/Instagram content they pull in. These are third-party embeds that
 *    set their own cookies, so under ePrivacy/GDPR they may not load before the
 *    visitor has said yes. `ElfsightWidget` refuses to mount without it.
 *
 * Don't add a category the site doesn't actually use — listing "Statistik" with
 * no analytics behind it is its own compliance problem.
 */
export type ConsentCategories = {
  necessary: true
  external: boolean
}

type ConsentRecord = {
  categories: ConsentCategories
  /** When consent was given — the record you'd point to if it's ever questioned. */
  timestamp: string
  /** Bump CONSENT_VERSION when the categories change; old records stop counting. */
  version: string
}

const CONSENT_KEY = 'navolt_cookie_consent'
const CONSENT_VERSION = '1'

interface CookieConsentValue {
  consent: ConsentCategories | null
  /** False until the visitor has answered — that's when the banner shows. */
  hasResponded: boolean
  /** False during the first paint, before localStorage has been read. */
  ready: boolean
  showSettings: boolean
  acceptAll: () => void
  rejectAll: () => void
  saveCustom: (cats: Pick<ConsentCategories, 'external'>) => void
  openSettings: () => void
  closeSettings: () => void
}

const CookieConsentContext = createContext<CookieConsentValue | null>(null)

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentCategories | null>(null)
  // Both start "already answered" so the banner can't flash on the first frame
  // of a return visit. The effect below corrects it once storage has been read.
  const [hasResponded, setHasResponded] = useState(true)
  const [ready, setReady] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  // Whether third-party scripts have actually been on the page this session.
  // Withdrawing consent has to reload, and only then — see `save`.
  const externalLoaded = useRef(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (stored) {
        const record: ConsentRecord = JSON.parse(stored)
        if (record.version === CONSENT_VERSION && record.categories) {
          setConsent({ necessary: true, external: !!record.categories.external })
          externalLoaded.current = !!record.categories.external
          setReady(true)
          return
        }
      }
    } catch {
      /* private mode, disabled storage — fall through and ask again */
    }
    setHasResponded(false)
    setReady(true)
  }, [])

  const save = useCallback((categories: ConsentCategories) => {
    const record: ConsentRecord = {
      categories,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    }
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(record))
    } catch {
      /* consent still applies for this page view even if it can't be stored */
    }
    setConsent(categories)
    setHasResponded(true)
    setShowSettings(false)

    // Unmounting a widget takes its div away but not platform.js, and nothing we
    // can run from here deletes a cookie set on elfsight.com or facebook.com.
    // A reload is the only way to actually get those scripts off the page, so
    // withdrawing consent reloads — but only if they were ever loaded.
    if (!categories.external && externalLoaded.current) {
      window.location.reload()
      return
    }
    if (categories.external) externalLoaded.current = true
  }, [])

  const acceptAll = useCallback(() => save({ necessary: true, external: true }), [save])
  const rejectAll = useCallback(() => save({ necessary: true, external: false }), [save])
  const saveCustom = useCallback(
    (cats: Pick<ConsentCategories, 'external'>) => save({ necessary: true, ...cats }),
    [save]
  )
  const openSettings = useCallback(() => setShowSettings(true), [])
  const closeSettings = useCallback(() => setShowSettings(false), [])

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasResponded,
        ready,
        showSettings,
        acceptAll,
        rejectAll,
        saveCustom,
        openSettings,
        closeSettings,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider')
  return ctx
}
