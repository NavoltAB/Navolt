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
// The wordmark's scale in the pill — the descriptor is collapsed by then, so
// this is the only thing setting the logo's size there. Named because the
// centring maths below has to know the logo's *rendered* width, and scale
// doesn't show up in offsetWidth.
const SHRUNK_SCALE = 0.72
// The descriptor's line box, in px. Its height is animated, so the number has to
// be written out rather than left to leading-none — it tracks the larger of the
// span's two font sizes (10px from md up).
const DESCRIPTOR_H = 11

// Deep navy veil, same hue as --color-primary-veil. Written out as rgba here
// because the skins need their own alpha per state.
const navy = (a: number) => `rgba(18, 48, 74, ${a})`

// The painted layer tweens its *colour*, never its opacity. Two cross-fading
// skins — a full-bleed bar and a pill — left a window on the way back up where
// neither was opaque yet and the page showed through: that was the blink. One
// layer that only ever changes colour cannot open that gap.
//
// Ring and drop shadow are written with the same two-shadow structure in every
// state so they interpolate. The bar's ring is invisible except along the
// bottom, since its other three edges sit outside the viewport.
const PILL_SHADOW =
  '0 0 0 1px rgba(255,255,255,0.12), 0 18px 40px -20px rgba(4,16,28,0.85)'
const BAR_SHADOW =
  '0 0 0 1px rgba(255,255,255,0.10), 0 18px 40px -20px rgba(4,16,28,0)'
const BARE_SHADOW =
  '0 0 0 1px rgba(255,255,255,0), 0 18px 40px -20px rgba(4,16,28,0)'

// Arriving: lag the collapse so the ring lands on a pill that already exists
// instead of popping onto a half-formed one. Leaving: get out fast, before the
// bar has widened far enough for a stretching 1px ring to be legible.
const paintTransition = (collapsed: boolean) =>
  collapsed
    ? { duration: 0.45, delay: 0.12, ease: 'easeOut' as const }
    : { duration: 0.28, ease: 'easeOut' as const }

/** One entry in the Tjänster dropdown. Built by the layout from Sanity. */
export type NavService = { title: string; href: string; description?: string }

/**
 * @param services  The services to hang under "Tjänster". Empty — no Sanity
 *   project, or nothing published — leaves it a plain link to the index, which
 *   is what it was before the menu existed.
 */
export default function Navigation({ services = [] }: { services?: NavService[] }) {
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
  // The Tjänster dropdown. The header knows no service by name — it lists
  // whatever the layout hands it.
  const [servicesOpen, setServicesOpen] = useState(false)
  // The same list in the mobile menu, where it's an accordion instead —
  // there's no hover on a phone, and four services unfolded push Kontakt
  // off the bottom of a small screen.
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)

  // Equal-growth spacers centre the links between the columns, so the links land
  // (leftCol − rightCol) / 2 off the pill's centre and a margin has to cancel it.
  //
  // The catch is that the logo column is wider than the ink in it: the wordmark
  // is *scaled* in the pill, and scale doesn't show up in offsetWidth. Cancelling
  // the whole box centres the links on the pill but leaves them looking pushed
  // left, because the tail of the column is empty. So cancel the dead space
  // instead — box width minus rendered ink — which puts the row on the midpoint
  // between the wordmark and the phone, where the eye expects it. The tail drops
  // out of the algebra: it shifts the row and the target by the same amount.
  const logoRef = useRef<HTMLAnchorElement>(null)
  const wordmarkRef = useRef<HTMLSpanElement>(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const logo = logoRef.current
    const wordmark = wordmarkRef.current
    if (!logo || !wordmark) return
    // The wordmark span is `block`, so its own offsetWidth is the *column's*
    // width, not the word's — measuring that cancels nothing. A Range over its
    // text gives the real ink. Range rects are post-transform, so divide out
    // whatever scale is currently applied (offsetWidth is the pre-transform
    // width of the same box, so their ratio is exactly that scale) to get a
    // layout width that's the same whichever state we happen to measure in.
    const measure = () => {
      const scale = wordmark.getBoundingClientRect().width / wordmark.offsetWidth
      const range = document.createRange()
      range.selectNodeContents(wordmark)
      const ink = range.getBoundingClientRect().width / (scale || 1)
      setBalance(logo.offsetWidth - ink * SHRUNK_SCALE)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(logo)
    ro.observe(wordmark)
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
    // A menu left open across a navigation hangs over the page you land on.
    setServicesOpen(false)
  }, [pathname])

  // Opening the menu on a service page shows that section already open —
  // you got there from it, so collapsing where you are would be odd. Only
  // on open, so collapsing it by hand afterwards sticks.
  useEffect(() => {
    if (mobileOpen) {
      setMobileServicesOpen(services.some((service) => pathname === service.href))
    }
  }, [mobileOpen, pathname, services])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Three grounds: nothing over the landing hero, deep navy on every other page,
  // a translucent navy pill once scrolled. One layer carries all three and
  // tweens its *colour*, never its opacity — that's the whole blink fix, and it
  // holds however many states there are. Cross-fading two stacked skins is what
  // left a window on the way back up where neither was opaque yet and the page
  // showed through; a single layer changing colour cannot open that gap, whether
  // it's moving between two navies or navy and nothing at all.
  const paint = shrunk
    ? {
        backgroundColor: isMobile ? navy(0.97) : navy(0.72),
        boxShadow: PILL_SHADOW,
      }
    : isHome
      ? { backgroundColor: navy(0), boxShadow: BARE_SHADOW }
      : { backgroundColor: navy(0.92), boxShadow: BAR_SHADOW }

  // Blur is the one property that can't ride along on a colour tween, so it goes
  // back to its own layer *underneath* the paint — a backdrop filter only sees
  // what's painted below it. It has to be absent over the hero, or the photo
  // goes soft behind a header that's meant to be invisible there. A gap in this
  // fade is harmless: it only ever costs a frame of unblurred glass, never a
  // frame of missing ground.
  const blurred = shrunk || !isHome

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
  // Active state is brass plus a small brass mark below — the same language as
  // the category rail on /produkter. Weight and tracking stay identical to the
  // inactive links: letter-spacing that changes per route makes the row twitch
  // as you navigate, and it's the one thing a nav can't afford to do.
  const activeColor = 'text-[var(--color-gold)]'
  // The mark is centred with left/right 0 + auto margins rather than a
  // translate, so it stays put while the header's padding is mid-tween. It is
  // deliberately not a `layoutId` that slides between links: layout projection
  // inside a container whose padding is animating measures against a box that
  // no longer exists a frame later, and the dot drifts off its label.

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
          // The menu hangs off the header, not off the label, so the header is
          // the region that owns it: moving between the label and the panel
          // stays inside this element (the panel is a DOM child however far
          // below it paints), and only leaving the header entirely closes it.
          // That's what removes the need for a hover bridge across the gap.
          onMouseLeave={() => setServicesOpen(false)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setServicesOpen(false)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setServicesOpen(false)
          }}
        >
          {/* Skins. Both inherit the animating radius and are positioned, so
              they paint under the content below (which is `relative`, i.e. also
              positioned, and later in DOM order).

              Blur first, paint second — a backdrop filter samples only what sits
              below it, so the glass has to be the lower of the two. Mobile drops
              the blur entirely: backdrop-filter on a resizing fixed element is
              the one thing that reliably janks on phones, and at 0.97 alpha
              there'd be nothing to see through anyway. */}
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: 'inherit',
              backdropFilter: isMobile ? 'none' : 'blur(20px)',
              WebkitBackdropFilter: isMobile ? 'none' : 'blur(20px)',
            }}
            initial={false}
            animate={{ opacity: blurred ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ borderRadius: 'inherit' }}
            initial={false}
            animate={paint}
            transition={paintTransition(shrunk)}
          />

          {/* Logo — wordmark over descriptor. Scaled, not resized: animating
              fontSize reflows and re-rasterises the type every frame. */}
          <Link ref={logoRef} href="/" className="relative shrink-0 text-white">
            <motion.div
              className="text-center"
              style={{ originX: 0, originY: 0.5, willChange: 'transform' }}
              animate={{ scale: shrunk ? SHRUNK_SCALE : 1 }}
              transition={shape}
            >
              {/* The wordmark is the wider of the two lines at both sizes, so it
                  alone sets the column's width — which is what lets the
                  `text-center` above centre the descriptor under it without
                  moving the wordmark itself. Shrink the wordmark or grow the
                  descriptor past that crossover and the wordmark starts sliding
                  right instead. */}
              <span ref={wordmarkRef} className="block font-heading text-[24px] md:text-[34px] font-semibold uppercase leading-none">
                {siteConfig.name}
              </span>
              {/* The descriptor collapses so the lockup keeps its balance in the
                  pill. Its opacity runs ahead of its height on the way out and
                  behind on the way back, so you never see clipped half-letters. */}
              <motion.span
                className="block overflow-hidden text-[8px] md:text-[10px] uppercase leading-none tracking-[0.06em]"
                animate={{
                  opacity: shrunk ? 0 : 0.7,
                  height: shrunk ? 0 : DESCRIPTOR_H,
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
              // A service page is its own top-level URL, so "Tjänster" has to
              // be told it owns them — startsWith can't see that /batrutor
              // belongs under it.
              const active =
                pathname.startsWith(link.href) ||
                (link.href === '/tjanster' && services.some((s) => pathname === s.href))

              const anchor = (
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  {...(link.href === '/tjanster' && services.length > 0
                    ? { 'aria-expanded': servicesOpen, 'aria-controls': 'services-menu' }
                    : {})}
                  className={`relative text-sm font-medium tracking-wide whitespace-nowrap transition-colors duration-300 ${
                    active ? activeColor : linkColor
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      aria-hidden
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
                      className="absolute -bottom-2 left-0 right-0 mx-auto h-1 w-1 rounded-full"
                      style={{ background: 'var(--color-gold)' }}
                    />
                  )}
                </Link>
              )

              // Every other label closes the menu on its way past, so hovering
              // along the row doesn't leave it hanging open under Produkter.
              if (link.href !== '/tjanster' || services.length === 0) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setServicesOpen(false)}
                  >
                    {anchor}
                  </div>
                )
              }

              // The trigger stays a real link to the index — the menu is an
              // addition to it, not a replacement, so the label still goes
              // somewhere for anyone who clicks rather than hovers.
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onFocus={() => setServicesOpen(true)}
                >
                  {anchor}
                </div>
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
                    href="/varukorg"
                    aria-label={`Varukorg, ${count} ${count === 1 ? 'artikel' : 'artiklar'}`}
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
          {/* Services mega-menu.
              Anchored to the header rather than to the label, so it is exactly
              as wide as the header is at any moment: full-bleed at the top of
              the page, pill-width once scrolled. left/right-0 resolve against
              the header's padding box, and the radius and the gap follow the
              same `shrunk` flag the header's own geometry does, so the two
              shapes stay in agreement mid-tween. */}
          <AnimatePresence>
            {servicesOpen && services.length > 0 && (
              <motion.div
                key="services-menu"
                id="services-menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  borderRadius: shrunk ? 22 : 0,
                  marginTop: shrunk ? 10 : 0,
                }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="absolute left-0 right-0 top-full hidden overflow-hidden md:block"
                // Light ground under a dark header, so the panel reads as a
                // sheet of the page pulled down rather than more chrome. Opaque
                // rather than veiled: text this small needs the contrast, and
                // the panel hangs over whatever the page happens to be showing.
                style={{ backgroundColor: 'var(--color-surface)', boxShadow: PILL_SHADOW }}
              >
                <div className="grid gap-1 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  {services.map((service) => {
                    const current = pathname === service.href
                    return (
                      <Link
                        key={service.href}
                        href={service.href}
                        aria-current={current ? 'page' : undefined}
                        className="rounded-xl px-4 py-3.5 transition-colors duration-200 hover:bg-[var(--color-bg)]"
                      >
                        <span
                          className="block font-heading text-sm font-semibold tracking-wide transition-colors duration-200"
                          style={{
                            color: current
                              ? 'var(--color-gold-ink)'
                              : 'var(--color-primary)',
                          }}
                        >
                          {service.title}
                        </span>
                        {service.description && (
                          <span
                            className="mt-1.5 block text-xs leading-relaxed line-clamp-2"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            {service.description}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>

                <div
                  className="border-t px-5 py-3"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <Link
                    href="/tjanster"
                    className="text-xs font-medium uppercase tracking-[0.14em] transition-colors duration-200 hover:text-[var(--color-primary)]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Alla tjänster
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                const active =
                  pathname.startsWith(link.href) ||
                  (link.href === '/tjanster' && services.some((s) => pathname === s.href))
                const subLinks = link.href === '/tjanster' ? services : []
                // Same brass mark on every row — a dot under an 18px line in a
                // stacked list reads as a stray bullet rather than an
                // indicator, so it sits at the end of the row instead.
                const mark = active && (
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: 'var(--color-gold)' }}
                  />
                )

                if (subLinks.length === 0) {
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center justify-between border-b border-white/[0.08] py-3 text-lg font-medium tracking-wide ${
                        active ? 'text-[var(--color-gold)]' : 'text-white/75'
                      }`}
                    >
                      {link.label}
                      {mark}
                    </Link>
                  )
                }

                // Tjänster is a disclosure: the label still navigates to the
                // index, and the chevron beside it opens the list. Splitting
                // the two is what keeps /tjanster reachable — a row that only
                // toggles would strand it.
                return (
                  <div key={link.href} className="border-b border-white/[0.08]">
                    <div className="flex items-center">
                      <Link
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        className={`flex-1 py-3 text-lg font-medium tracking-wide ${
                          active ? 'text-[var(--color-gold)]' : 'text-white/75'
                        }`}
                      >
                        {link.label}
                      </Link>
                      {mark}
                      <button
                        type="button"
                        onClick={() => setMobileServicesOpen((open) => !open)}
                        aria-expanded={mobileServicesOpen}
                        aria-controls="mobile-services"
                        aria-label={mobileServicesOpen ? 'Dölj tjänster' : 'Visa tjänster'}
                        // 44px square: the tap target has to clear the label's
                        // own, or the two fight over the same thumb.
                        className="-mr-3 flex h-11 w-11 shrink-0 items-center justify-center text-white/55 transition-colors duration-200 hover:text-white"
                      >
                        <motion.svg
                          aria-hidden
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={false}
                          animate={{ rotate: mobileServicesOpen ? 180 : 0 }}
                          transition={{ duration: 0.28, ease }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </motion.svg>
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {mobileServicesOpen && (
                        <motion.div
                          key="mobile-services"
                          id="mobile-services"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col pb-2">
                            {subLinks.map((service) => (
                              <Link
                                key={service.href}
                                href={service.href}
                                aria-current={pathname === service.href ? 'page' : undefined}
                                className={`py-2 pl-4 text-base tracking-wide ${
                                  pathname === service.href
                                    ? 'text-[var(--color-gold)]'
                                    : 'text-white/55'
                                }`}
                              >
                                {service.title}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}

              {ready && count > 0 && (
                <Link
                  href="/varukorg"
                  className="flex items-center justify-between py-3 text-lg font-medium tracking-wide border-b border-white/[0.08] text-white/75"
                >
                  Varukorg
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
