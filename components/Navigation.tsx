'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { siteConfig } from '@/config/site'

// NOTE: /produkter is intentionally absent until the customer has a real
// catalogue in Sanity. The page and schemas exist — just add the link back here.
const navLinks = [
  { href: '/tjanster', label: 'Tjänster' },
  { href: '/om-oss', label: 'Om oss' },
  { href: '/kontakt', label: 'Kontakt' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // The header is dark in every state — transparent over the hero, deep navy
  // once scrolled or on a subpage. That keeps one set of white-on-dark colours
  // instead of flipping the whole palette mid-scroll.
  // Background is set via style, not a class — see --color-primary-veil.
  // `border-b` is always present and only its colour changes. Toggling the
  // border class instead would snap the width 0→1px while the background is
  // still fading, flashing a bright line across the header.
  const navSolid = scrolled || !isHome || mobileOpen
  const navBg = navSolid ? 'backdrop-blur-md' : ''

  const linkColor = 'text-white/75 hover:text-white'
  // Active state is carried by brass + open tracking only — no underline.
  const activeColor = 'text-[var(--color-gold)]'

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${navBg}`}
      style={{
        background: navSolid ? 'var(--color-primary-veil)' : 'transparent',
        borderBottomColor: navSolid ? 'rgba(255,255,255,0.10)' : 'transparent',
      }}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-container">
        {/* Logo — wordmark over descriptor, matching Navolt's existing lockup */}
        <Link href="/" className="text-white transition-colors duration-300">
          <span className="block font-heading text-2xl font-semibold tracking-tight leading-none">
            {siteConfig.name}
          </span>
          <span className="block text-[9px] tracking-[0.28em] uppercase opacity-70 mt-0.5">
            Marinelektronik
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`text-sm transition-all duration-300 ${
                  active
                    ? `font-semibold tracking-[0.14em] ${activeColor}`
                    : `font-medium tracking-wide ${linkColor}`
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          {/* Icon only — the written-out number crowded the link row.
              Same phone glyph as the homepage CTA. */}
          <a
            href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
            aria-label={`Ring oss på ${siteConfig.contact.phone}`}
            title={siteConfig.contact.phone}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200"
            style={{
              background: 'rgba(255,255,255,0.12)',
              color: 'var(--color-gold)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>
        </nav>

        {/* Hamburger */}
        <button
          className="md:hidden p-2 -mr-2 flex flex-col gap-1.5"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Stäng meny' : 'Öppna meny'}
          aria-expanded={mobileOpen}
        >
          <motion.span
            animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className="block w-6 h-0.5 origin-center bg-white"
          />
          <motion.span
            animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            className="block w-6 h-0.5 bg-white"
          />
          <motion.span
            animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="block w-6 h-0.5 origin-center bg-white"
          />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-t border-white/10 overflow-hidden"
            style={{ background: 'var(--color-primary-veil)' }}
          >
            <nav className="container mx-auto px-6 py-6 flex flex-col gap-5">
              {navLinks.map((link) => {
                const active = pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`text-lg ${
                      active
                        ? 'font-semibold tracking-[0.14em] text-[var(--color-gold)]'
                        : 'font-medium tracking-wide text-white/75'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}

              <a
                href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
                className="text-lg font-semibold tracking-wide text-white"
              >
                {siteConfig.contact.phone}
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
