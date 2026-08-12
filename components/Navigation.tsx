'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/context/CartContext'
import { siteConfig } from '@/config/site'

const navLinks = [
  { href: '/tjanster', label: 'Tjänster' },
  { href: '/produkter', label: 'Produkter' },
  { href: '/om-oss', label: 'Om oss' },
  { href: '/kontakt', label: 'Kontakt' },
]

// One curve for every property that changes the header's *shape*, so the pill
// collapse reads as a single movement rather than a pile of independent tweens.
const ease = [0.16, 1, 0.3, 1] as const
const shape = { duration: 0.85, ease }
const SHRINK_AT = 60
const PILL_MAX = 880

// Deep navy veil, same hue as --color-primary-veil. Written out as rgba here
// because the skins need their own alpha per state.
const navy = (a: number) => `rgba(18, 48, 74, ${a})`

// Background, blur and ring live on their own layers and only ever animate
// opacity — never alongside the shape tween. Fading out has to beat the widening
// bar (otherwise you watch a rounded 1px ring stretch across the viewport before
// it vanishes), and fading in has to lag the collapse so the ring arrives on a
// pill that already exists instead of popping onto a half-formed one.
const skin = (visible: boolean) =>
  visible
    ? { duration: 0.45, delay: 0.14, ease: 'easeOut' as const }
    : { duration: 0.22, ease: 'easeOut' as const }

export default function Navigation() {
  const [shrunk, setShrunk] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  // Measured, not a big constant: `maxWidth: 3000` overshoots the viewport, so
  // flex clamps the bar to full width a quarter of the way through the tween
  // while padding and radius are still moving — which is what read as lag.
  // Over-large is harmless before mount (flex-shrink clamps it), under-large is
  // not, hence the 3000 seed.
  const [docWidth, setDocWidth] = useState(3000)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const { count, ready } = useCart()

  // Equal-growth spacers centre the links in the space *between* the columns,
  // not in the pill — so the links sit (leftCol − rightCol) / 2 off centre. The
  // logo column is much wider than it looks: the collapsed descriptor animates
  // its height to 0 but keeps its full tracked-out width. Measure both columns
  // and cancel the difference with a margin rather than hardcoding a guess.
  const logoRef = useRef<HTMLAnchorElement>(null)
  const tailRef = useRef<HTMLDivElement>(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const logo = logoRef.current
    const tail = tailRef.current
    if (!logo || !tail) return
    // Both widths are layout widths, so they're state-independent: `scale`
    // doesn't touch them and the descriptor only collapses vertically.
    const measure = () => setBalance(logo.offsetWidth - tail.offsetWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(logo)
    ro.observe(tail)
    document.fonts?.ready.then(measure).catch(() => {})
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const measure = () => {
      setIsMobile(window.innerWidth < 768)
      setDocWidth(document.documentElement.clientWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > SHRINK_AT)
    onScroll()
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
  // on a subpage, and a translucent navy pill once scrolled. That keeps one set
  // of white-on-dark colours instead of flipping the palette mid-scroll.
  const barVisible = !isHome && !shrunk

  // Geometry only. No colour, no blur, no shadow — see `skin` above.
  const geometry = shrunk
    ? {
        maxWidth: isMobile ? docWidth - 32 : PILL_MAX,
        marginTop: 14,
        marginLeft: isMobile ? 16 : 24,
        marginRight: isMobile ? 16 : 24,
        borderRadius: 999,
        paddingLeft: 18,
        paddingRight: 18,
        paddingTop: 10,
        paddingBottom: 10,
      }
    : {
        maxWidth: docWidth,
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        borderRadius: 0,
        paddingLeft: isMobile ? 24 : 48,
        paddingRight: isMobile ? 24 : 48,
        paddingTop: isMobile ? 14 : 20,
        paddingBottom: isMobile ? 14 : 20,
      }

  const linkColor = 'text-white/75 hover:text-white'
  // Active state is carried by brass + open tracking only — no underline.
  const activeColor = 'text-[var(--color-gold)]'

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.header
          className="pointer-events-auto relative w-full flex items-center"
          initial={false}
          animate={geometry}
          transition={shape}
        >
          {/* Skins. Both inherit the animating radius and are positioned, so
              they paint under the content below (which is `relative`, i.e. also
              positioned, and later in DOM order). */}
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: 'inherit',
              background: navy(0.92),
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 1px 0 0 rgba(255,255,255,0.10)',
            }}
            initial={false}
            animate={{ opacity: barVisible ? 1 : 0 }}
            transition={skin(barVisible)}
          />
          {/* Mobile drops the blur and goes near-opaque — backdrop-filter on a
              resizing fixed element is the one thing that reliably janks on
              phones. The blur radius itself is constant; only opacity moves. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: 'inherit',
              background: isMobile ? navy(0.97) : navy(0.72),
              backdropFilter: isMobile ? 'none' : 'blur(24px)',
              WebkitBackdropFilter: isMobile ? 'none' : 'blur(24px)',
              boxShadow:
                '0 0 0 1px rgba(255,255,255,0.12), 0 18px 40px -20px rgba(4,16,28,0.85)',
            }}
            initial={false}
            animate={{ opacity: shrunk ? 1 : 0 }}
            transition={skin(shrunk)}
          />

          {/* Logo — wordmark over descriptor. Scaled, not resized: animating
              fontSize reflows and re-rasterises the serif every frame. */}
          <Link ref={logoRef} href="/" className="relative shrink-0 text-white">
            <motion.div
              style={{ originX: 0, originY: 0.5, willChange: 'transform' }}
              animate={{ scale: shrunk ? 0.82 : 1 }}
              transition={shape}
            >
              <span className="block font-heading text-2xl font-semibold tracking-tight leading-none">
                {siteConfig.name}
              </span>
              {/* The descriptor collapses so the lockup keeps its balance in the
                  pill. Its opacity runs ahead of its height on the way out and
                  behind on the way back, so you never see clipped half-letters. */}
              <motion.span
                className="block overflow-hidden text-[9px] uppercase leading-none tracking-[0.28em]"
                animate={{
                  opacity: shrunk ? 0 : 0.7,
                  height: shrunk ? 0 : 11,
                  marginTop: shrunk ? 0 : 4,
                }}
                transition={{
                  default: shape,
                  opacity: shrunk
                    ? { duration: 0.22, ease: 'easeOut' }
                    : { duration: 0.4, delay: 0.3, ease: 'easeOut' },
                }}
              >
                Marinelektronik
              </motion.span>
            </motion.div>
          </Link>

          {/* Paired spacers. Full-bleed: only the left one grows, so the links
              sit right, beside the phone. Pill: both grow, which floats the
              links between the wordmark and the phone. */}
          <motion.div
            className="relative hidden md:block"
            initial={false}
            animate={{ flexGrow: 1 }}
            transition={shape}
          />

          {/* Desktop links */}
          <motion.nav
            className="relative hidden md:flex items-center"
            initial={false}
            animate={{ gap: shrunk ? 22 : 32, marginRight: shrunk ? balance : 0 }}
            transition={shape}
          >
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`text-sm whitespace-nowrap transition-colors duration-300 ${
                    active
                      ? `font-semibold tracking-[0.14em] ${activeColor}`
                      : `font-medium tracking-wide ${linkColor}`
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </motion.nav>

          <motion.div
            className="relative hidden md:block"
            initial={false}
            animate={{ flexGrow: shrunk ? 1 : 0 }}
            transition={shape}
          />

          {/* Icon only — the written-out number crowded the link row.
              Same phone glyph as the homepage CTA. */}
          <motion.div
            ref={tailRef}
            className="relative hidden md:flex items-center gap-2.5 shrink-0"
            initial={false}
            animate={{ marginLeft: shrunk ? 0 : 28 }}
            transition={shape}
          >
            {/* Basket. Absent while empty rather than sitting there greyed out:
                on a site whose catalogue may be empty, a permanent cart icon is
                chrome for a feature nobody is using. It animates its own width,
                and the ResizeObserver above re-measures the tail so the centred
                links stay centred when it appears. */}
            <AnimatePresence initial={false}>
              {ready && count > 0 && (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0, width: 0, scale: 0.6 }}
                  animate={{ opacity: 1, width: 36, scale: shrunk ? 0.89 : 1 }}
                  exit={{ opacity: 0, width: 0, scale: 0.6 }}
                  transition={{ duration: 0.45, ease }}
                  className="relative shrink-0 overflow-visible"
                  style={{ willChange: 'transform' }}
                >
                  <Link
                    href="/offert"
                    aria-label={`Offertkorg, ${count} ${count === 1 ? 'artikel' : 'artiklar'}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300"
                    style={{ background: 'rgba(255,255,255,0.12)', color: 'var(--color-gold)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </Link>

                  {/* Re-keyed on the number so every change replays the spring —
                      the badge pops when you add something, which is the only
                      feedback you get if the basket is off-screen. */}
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 24, mass: 0.7 }}
                    aria-hidden
                    className="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums text-white"
                    style={{ background: 'var(--color-gold)' }}
                  >
                    {count}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.a
              href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
              aria-label={`Ring oss på ${siteConfig.contact.phone}`}
              title={siteConfig.contact.phone}
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: 'var(--color-gold)',
                willChange: 'transform',
              }}
              initial={false}
              animate={{ scale: shrunk ? 0.89 : 1 }}
              transition={shape}
              whileHover={{ scale: shrunk ? 0.96 : 1.08 }}
              whileTap={{ scale: shrunk ? 0.84 : 0.94 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </motion.a>
          </motion.div>

          {/* Hamburger */}
          <button
            className="relative md:hidden ml-auto p-2 -mr-2 flex flex-col gap-1.5 shrink-0"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Stäng meny' : 'Öppna meny'}
            aria-expanded={mobileOpen}
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease }}
              className="block w-6 h-0.5 origin-center bg-white"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              className="block w-6 h-0.5 bg-white"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease }}
              className="block w-6 h-0.5 origin-center bg-white"
            />
          </button>
        </motion.header>
      </motion.div>

      {/* Mobile menu — a detached card rather than a drawer, since the header
          itself is a floating pill once scrolled. */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, top: shrunk ? 74 : 82 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
            className="md:hidden fixed inset-x-4 z-40 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: navy(0.97),
              boxShadow:
                '0 0 0 1px rgba(255,255,255,0.12), 0 18px 40px -20px rgba(4,16,28,0.85)',
            }}
          >
            <nav className="flex flex-col px-6 py-5">
              {navLinks.map((link) => {
                const active = pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`py-3 text-lg border-b border-white/[0.08] ${
                      active
                        ? 'font-semibold tracking-[0.14em] text-[var(--color-gold)]'
                        : 'font-medium tracking-wide text-white/75'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}

              {ready && count > 0 && (
                <Link
                  href="/offert"
                  className="flex items-center justify-between py-3 text-lg font-medium tracking-wide border-b border-white/[0.08] text-white/75"
                >
                  Offertkorg
                  <span
                    className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums text-white"
                    style={{ background: 'var(--color-gold)' }}
                  >
                    {count}
                  </span>
                </Link>
              )}

              <a
                href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
                className="pt-4 text-lg font-semibold tracking-wide text-white"
              >
                {siteConfig.contact.phone}
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
