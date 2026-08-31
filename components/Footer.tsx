import Link from 'next/link'
import CookieSettingsButton from '@/components/CookieSettingsButton'
import type { SiteSettings } from '@/types/sanity'
import { siteConfig } from '@/config/site'

interface FooterProps {
  settings?: SiteSettings | null
  /**
   * The paragraph under the logotype. Fed the landing page's hero subtitle by
   * the layout, so the sentence the customer edits once in "Startsida" is the
   * same one that appears at the bottom of every page.
   */
  blurb?: string
}

const defaultBlurb =
  'Marinelektriker i Göteborg och Öckerö. Felsökning, uppgradering och nyinstallation av el ombord — i båt, husbil och campervan.'

const defaults: SiteSettings = {
  phone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  address: siteConfig.contact.address,
  openingHours: siteConfig.contact.openingHours,
  facebook: siteConfig.social.facebook,
  instagram: siteConfig.social.instagram,
  orgNumber: siteConfig.company.orgNumber,
}

export default function Footer({ settings, blurb }: FooterProps) {
  const s = { ...defaults, ...Object.fromEntries(Object.entries(settings ?? {}).filter(([, v]) => v)) }
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--color-primary)', color: 'rgba(255,255,255,0.85)' }}>
      <div className="container mx-auto px-6 py-16 max-w-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <p className="font-heading text-[32px] text-white font-semibold uppercase leading-none">
              {siteConfig.name}
            </p>
            <p
              className="text-[12px] tracking-[0.06em] uppercase mt-1.5 mb-3"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Marinelektronik
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {blurb?.trim() || defaultBlurb}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="section-label text-white/50 mb-4">Navigera</p>
            <ul className="space-y-2.5">
              {[
                { href: '/tjanster', label: 'Tjänster' },
                // Båtrutor has a page of its own and deliberately no header
                // entry — the footer is where it gets its permanent internal
                // link. See lib/services.ts.
                { href: '/batrutor', label: 'Båtrutor' },
                { href: '/produkter', label: 'Produkter' },
                { href: '/om-oss', label: 'Om oss' },
                { href: '/kontakt', label: 'Kontakt' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="footer-nav-link text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="section-label text-white/50 mb-4">Kontakt</p>
            <div className="space-y-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {s.phone && (
                <p>
                  <a href={`tel:${s.phone}`} className="hover:text-white transition-colors">
                    {s.phone}
                  </a>
                </p>
              )}
              {s.email && (
                <p>
                  <a href={`mailto:${s.email}`} className="hover:text-white transition-colors">
                    {s.email}
                  </a>
                </p>
              )}
              {s.address && (
                <p className="whitespace-pre-line">{s.address}</p>
              )}
              {s.openingHours && (
                <p className="whitespace-pre-line mt-3">{s.openingHours}</p>
              )}
            </div>

            {/* Social links */}
            {(s.instagram || s.facebook) && (
              <div className="flex gap-4 mt-5">
                {s.instagram && (
                  <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                    className="hover:text-white transition-colors"
                    style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                    </svg>
                  </a>
                )}
                {s.facebook && (
                  <a href={s.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                    className="hover:text-white transition-colors"
                    style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs"
          style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.4)' }}>
          <div className="flex flex-col sm:flex-row items-center gap-x-4 gap-y-1 text-center sm:text-left">
            <p>© {year} {siteConfig.legalName}</p>
            {s.orgNumber && <p>Org.nr: {s.orgNumber}</p>}
            {siteConfig.company.fSkatt && <p>Godkänd för F-skatt</p>}
          </div>

          {/* Legal. The cookie link has to live somewhere permanent and
              reachable from every page — withdrawing consent must be as easy as
              giving it, and this row is where a visitor looks for it. */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/integritetspolicy" className="footer-nav-link transition-colors duration-200">
              Integritetspolicy
            </Link>
            <Link href="/cookies" className="footer-nav-link transition-colors duration-200">
              Cookiepolicy
            </Link>
            <CookieSettingsButton />
          </div>
        </div>
      </div>
    </footer>
  )
}
