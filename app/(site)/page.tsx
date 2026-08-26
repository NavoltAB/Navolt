import Link from 'next/link'
import Image from 'next/image'
import {
  getAllServices,
  getHomePage,
  getLandingProducts,
  getSiteSettings,
} from '@/sanity/queries'
import { list, text } from '@/sanity/fallback'
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/AnimatedSection'
import ProductCard from '@/components/ProductCard'
import ServiceTiles from '@/components/ServiceTiles'
import ElfsightWidget from '@/components/ElfsightWidget'
import { siteConfig } from '@/config/site'

export const revalidate = 60

// ── Placeholder copy ─────────────────────────────────────────
// The four segments mirror Navolt's current site. Treated as
// placeholder until the customer confirms the split — everything
// here is overridden by `service` documents in Sanity as soon as
// any exist.
const fallbackSegments = [
  {
    _id: 'seg-bat',
    title: 'Båt',
    href: '/tjanster#bat',
    imageUrl: '/images/boat-img.jpg',
    shortDescription:
      'Marinelektronik och elsystem i fritidsbåten. Navigation, laddning, landström, belysning och felsökning.',
  },
  {
    _id: 'seg-campervan',
    title: 'Campervan',
    href: '/tjanster#campervan',
    imageUrl: '/images/campervan-img.jpg',
    shortDescription:
      'Skräddarsytt elsystem i din campervan eller husbil. Solceller, litiumbank, växelriktare och värme.',
  },
  {
    _id: 'seg-motorservice',
    title: 'Motorservice',
    href: '/tjanster#motorservice',
    imageUrl: '/images/motorservice.jpg',
    shortDescription:
      'Service och felsökning på båtmotorn — så att du tar dig ut, och hem igen.',
  },
  {
    _id: 'seg-batrutor',
    title: 'Båtrutor',
    href: '/tjanster#batrutor',
    imageUrl: '/images/batrutor/batrutor-1.jpg',
    shortDescription:
      'Byte och montering av båtrutor, med kompletta monteringspaket för de vanligaste båtmodellerna.',
  },
]

// Every string and image on this page is editable in Sanity under "Startsida".
// This object is what renders until someone fills a field in — the page must
// stand up with no Sanity project configured at all, so nothing below may
// depend on the CMS having an answer.
const defaults = {
  heroBadge: 'Göteborg · Öckerö · Hälsö',
  heroTitle: 'Vi löser elen',
  heroTitleAccent: 'ombord',
  heroSubtitle:
    'Felsökning, uppgradering och nyinstallation av el och elektronik i din fritidsbåt, husbil eller campervan.',
  heroImageUrl: '/images/hero-img.jpg',
  heroCtaLabel: 'Se våra tjänster',
  heroPhoneLabel: 'Ring',

  trustStats: [
    { value: '25+', label: 'Varumärken vi arbetar med' },
    { value: '4', label: 'Specialområden' },
    { value: 'Hälsö', label: 'Verkstad i skärgården' },
    { value: 'F-skatt', label: 'Godkänt bolag' },
  ],

  productsLabel: 'Sortiment',
  productsTitle: 'Produkter vi säljer',
  productsCtaLabel: 'Alla produkter',

  manifestoBefore: 'Elen ombord ska bara',
  manifestoAccent: 'fungera',
  manifestoAfter: '— oavsett väder och oavsett hur långt hemifrån du är.',

  servicesLabel: 'Vad vi gör',
  servicesTitle: 'Tjänster vi erbjuder',
  servicesCtaLabel: 'Alla tjänster',

  whyLabel: 'Vårt arbetssätt',
  whyTitle: 'Varför Navolt',
  whyItems: [
    {
      title: 'Rätt utfört från början',
      text: 'El ombord är inte platsen för genvägar. Vi drar, märker och dokumenterar installationen så att den går att felsöka och bygga vidare på — även av någon annan, om tio år.',
    },
    {
      title: 'Vi kommer till båten',
      text: 'Det mesta löser vi där båten ligger. Slipper du transportera fram och tillbaka blir jobbet både snabbare och billigare för dig.',
    },
    {
      title: 'Komponenter vi står bakom',
      text: 'Vi arbetar med marknadsledande marina varumärken — Victron, Mastervolt, Garmin, Raymarine och fler. Delar som går att få tag på och serva även i framtiden.',
    },
  ],

  aboutLabel: 'Om oss',
  aboutTitle: 'Marinelektriker med skärgården som arbetsplats',
  aboutText:
    'Navolt sitter på Hälsö i Göteborgs norra skärgård och arbetar med el och elektronik ombord — från en trasig landströmsladdare till ett komplett elsystem i en nybyggd campervan. Vi tar oss an både det lilla felet som stoppat semestern och de större installationerna som kräver planering.',
  aboutImageUrl: '/images/startpage-2.jpg',
  aboutStats: [
    { value: 'Hälsö', label: 'Bas' },
    { value: 'Göteborg', label: 'Upptagningsområde' },
    { value: 'F-skatt', label: 'Godkänt' },
  ],
  aboutCtaLabel: 'Mer om Navolt',

  reviewsLabel: 'Omdömen',

  ctaLabel: 'Hör av dig',
  ctaTitle: 'Berätta vad som',
  ctaTitleAccent: 'krånglar',
  ctaText:
    'Beskriv problemet eller projektet så återkommer vi med en bedömning — och ett pris innan vi sätter igång.',
  ctaPrimaryLabel: 'Kontakta oss',
  ctaSecondaryLabel: 'Se våra tjänster',
  ctaPhoneLabel: 'Ring oss direkt',
} as const

export default async function HomePage() {
  const [services, homePage, products, settings] = await Promise.all([
    getAllServices(),
    getHomePage(),
    getLandingProducts(),
    getSiteSettings(),
  ])

  // The number appears twice on this page. It lives in Webbplatsinställningar
  // like it does in the footer and on /kontakt — editing it in one place has to
  // change it everywhere, or the site starts contradicting itself.
  const phone = text(settings?.phone, siteConfig.contact.phone)
  const phoneHref = `tel:${phone.replace(/[^0-9+]/g, '')}`

  const segments =
    services.length > 0
      ? services.map((s) => ({
          _id: s._id,
          title: s.title,
          href: s.slug ? `/tjanster#${s.slug}` : '/tjanster',
          imageUrl: s.imageUrl,
          shortDescription: s.shortDescription,
        }))
      : fallbackSegments

  const heroTitleAccent = text(homePage?.heroTitleAccent, defaults.heroTitleAccent)
  const manifestoAccent = text(homePage?.manifestoAccent, defaults.manifestoAccent)
  const ctaTitleAccent = text(homePage?.ctaTitleAccent, defaults.ctaTitleAccent)

  const trustStats = list(homePage?.trustStats, defaults.trustStats)
  const aboutStats = list(homePage?.aboutStats, defaults.aboutStats)
  // A row with no heading has nothing to number, so it's dropped rather than
  // rendered as a bare paragraph beside an orphaned "04".
  const whyItems = list(homePage?.whyItems, defaults.whyItems).filter((item) => item.title)

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* `sizes` is spelled out rather than left to the `fill` default so the
            intent is on the page: this is edge to edge at every width.

            Quality is below the default 75 because the photo spends its life
            under the scrim below — a smooth, low-detail sea, dimmed, is the
            best case for the encoder and the artefacts have nowhere to show.
            It is the LCP element, so the bytes are worth more here than the
            last few percent of fidelity nobody can see. */}
        <Image
          src={text(homePage?.heroImageUrl, defaults.heroImageUrl)}
          alt="Marinelektronik och elinstallation i båt — Navolt i Göteborg och Öckerö"
          fill
          sizes="100vw"
          quality={60}
          className="object-cover"
          priority
        />

        {/* Navy scrim — keeps the white headline legible over the photo.

            Held deliberately light in the middle, where the headline sits. The
            photo is already a deep navy sea, so white type clears 11:1 against
            the bare image; the scrim only has to even out the water's texture
            and darken the corners. Heavier than this and the picture flattens
            into a plain navy panel, which is what it used to do. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(150deg, rgba(7,20,33,0.50) 0%, rgba(11,34,55,0.24) 45%, rgba(7,20,33,0.52) 100%)',
          }}
        />

        {/* Brass highlight — adds depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(192,138,62,0.10) 0%, transparent 70%)',
          }}
        />

        <div
          className="relative z-10 container mx-auto px-6 text-center text-white"
          style={{ maxWidth: 'var(--container-max)' }}
        >
          <AnimatedSection delay={0.1}>
            <div
              className="inline-flex items-center gap-2.5 mb-10 px-5 py-2 text-xs tracking-[0.22em] uppercase"
              style={{
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '100px',
                color: 'rgba(255, 255, 255, 0.88)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--color-gold)' }}
              />
              {text(homePage?.heroBadge, defaults.heroBadge)}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.25}>
            <h1
              className="font-heading text-white font-semibold text-balance mb-8"
              style={{
                fontSize: 'clamp(2.6rem, 6.5vw, 5.5rem)',
                lineHeight: 1.06,
                letterSpacing: '-0.02em',
              }}
            >
              {text(homePage?.heroTitle, defaults.heroTitle)}
              {heroTitleAccent && (
                <>
                  <br />
                  <em style={{ color: 'var(--color-gold)', fontStyle: 'italic' }}>
                    {heroTitleAccent}
                  </em>
                </>
              )}
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.42}>
            <p
              className="text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.66)' }}
            >
              {text(homePage?.heroSubtitle, defaults.heroSubtitle)}
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.56}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/tjanster" className="btn-gold">
                {text(homePage?.heroCtaLabel, defaults.heroCtaLabel)}
              </Link>
              <a
                href={phoneHref}
                className="group inline-flex items-center gap-2 text-sm font-medium text-white"
              >
                <span className="border-b border-transparent pb-0.5 transition-colors duration-200 group-hover:border-white/60">
                  {text(homePage?.heroPhoneLabel, defaults.heroPhoneLabel)}{' '}
                  {phone}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="translate-x-0 transition-transform duration-200 group-hover:translate-x-1"
                  style={{ color: 'var(--color-gold)' }}
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Trust bar ─────────────────────────────────────────── */}
      <section style={{ background: 'var(--color-primary)' }}>
        <div className="container mx-auto px-6 py-10" style={{ maxWidth: 'var(--container-max)' }}>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustStats.map((s, i) => (
              <StaggerItem key={`${s.label}-${i}`}>
                <div className="text-center">
                  <p
                    className="font-heading font-semibold mb-1"
                    style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'var(--color-gold)' }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="text-xs tracking-[0.12em] uppercase"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {s.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Products ──────────────────────────────────────────── */}
      {/* Renders only when there's stock to show. Unlike services there's no
          fallback copy for products — an empty grid under a "Sortiment"
          heading would read as broken, so the whole section stands down until
          Sanity has something in it. */}
      {products.length > 0 && (
        <section className="section">
          <div className="container mx-auto px-6" style={{ maxWidth: 'var(--container-max)' }}>
            <AnimatedSection className="mb-12">
              <p className="section-label mb-3">
                {text(homePage?.productsLabel, defaults.productsLabel)}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <h2 className="section-title">
                  {text(homePage?.productsTitle, defaults.productsTitle)}
                </h2>
                <Link href="/produkter" className="btn-outline shrink-0">
                  {text(homePage?.productsCtaLabel, defaults.productsCtaLabel)}
                </Link>
              </div>
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map((product) => (
                <StaggerItem key={product._id} className="h-full">
                  <ProductCard product={product} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}

      {/* ── Manifesto ─────────────────────────────────────────── */}
      {/* Sits between the products and the services: the claim lands first,
          then the tiles below show what backs it up. */}
      <section
        className="py-20"
        style={{
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container mx-auto px-6" style={{ maxWidth: 'var(--container-max)' }}>
          <AnimatedSection>
            <p
              className="font-heading font-semibold text-center mx-auto"
              style={{
                fontSize: 'clamp(1.6rem, 3.5vw, 2.75rem)',
                lineHeight: 1.22,
                maxWidth: '820px',
                color: 'var(--color-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              {text(homePage?.manifestoBefore, defaults.manifestoBefore)}{' '}
              <em style={{ color: 'var(--color-gold)', fontStyle: 'italic' }}>
                {manifestoAccent}
              </em>{' '}
              {text(homePage?.manifestoAfter, defaults.manifestoAfter)}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Segments ──────────────────────────────────────────── */}
      <section className="section">
        <div className="container mx-auto px-6" style={{ maxWidth: 'var(--container-max)' }}>
          <AnimatedSection className="mb-12">
            <p className="section-label mb-3">
              {text(homePage?.servicesLabel, defaults.servicesLabel)}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <h2 className="section-title">
                {text(homePage?.servicesTitle, defaults.servicesTitle)}
              </h2>
              <Link href="/tjanster" className="btn-outline shrink-0">
                {text(homePage?.servicesCtaLabel, defaults.servicesCtaLabel)}
              </Link>
            </div>
          </AnimatedSection>

          {/* Editorial photo tiles rather than cards — the card shape is
              reserved for products, which carry price and stock. See
              components/ServiceTiles.tsx. */}
          <ServiceTiles segments={segments} />
        </div>
      </section>

      {/* ── Why us ────────────────────────────────────────────── */}
      <section className="section">
        <div className="container mx-auto px-6" style={{ maxWidth: 'var(--container-max)' }}>
          <div
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-10"
            style={{ borderBottom: '2px solid var(--color-primary)' }}
          >
            <div>
              <p className="section-label mb-2">{text(homePage?.whyLabel, defaults.whyLabel)}</p>
              <h2 className="section-title">{text(homePage?.whyTitle, defaults.whyTitle)}</h2>
            </div>
          </div>

          {whyItems.map((f, i) => (
            <AnimatedSection key={`${f.title}-${i}`} delay={i * 0.1}>
              <div className="py-10 md:py-12" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div
                  className="flex flex-col md:grid md:items-start md:gap-10"
                  style={{ gridTemplateColumns: '4.5rem 1fr 1.8fr' }}
                >
                  <span
                    className="font-heading font-semibold leading-none mb-4 md:mb-0"
                    style={{
                      fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                      color: 'var(--color-border)',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className="font-heading font-semibold mb-3 md:mb-0 md:pt-1"
                    style={{ fontSize: 'var(--text-2xl)' }}
                  >
                    {f.title}
                  </h3>
                  <p className="leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {f.text}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────── */}
      <section className="section" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="container mx-auto px-6" style={{ maxWidth: 'var(--container-max)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
            <AnimatedSection direction="left">
              <div
                className="aspect-[5/4] rounded-lg overflow-hidden relative"
                style={{ background: 'var(--color-primary)' }}
              >
                <Image
                  src={text(homePage?.aboutImageUrl, defaults.aboutImageUrl)}
                  alt={`Om ${siteConfig.legalName}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <p className="section-label mb-4">
                {text(homePage?.aboutLabel, defaults.aboutLabel)}
              </p>
              <h2 className="section-title mb-6">
                {text(homePage?.aboutTitle, defaults.aboutTitle)}
              </h2>
              <p className="section-subtitle mb-10">
                {text(homePage?.aboutText, defaults.aboutText)}
              </p>

              {/* Flex, not grid-cols-3 — the labels differ too much in length
                  for equal columns, which left ragged gaps after the short
                  ones. Sizing to content keeps the spacing between items even. */}
              <div className="flex flex-wrap gap-x-12 gap-y-6 mb-10">
                {aboutStats.map((s, i) => (
                  <div key={`${s.label}-${i}`}>
                    <p
                      className="font-heading font-semibold mb-0.5"
                      style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary)' }}
                    >
                      {s.value}
                    </p>
                    <p
                      className="text-xs tracking-[0.1em] uppercase"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <Link href="/om-oss" className="btn-outline">
                {text(homePage?.aboutCtaLabel, defaults.aboutCtaLabel)}
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Reviews ───────────────────────────────────────────── */}
      {/* Eyebrow only — the Elfsight widget carries its own title. */}
      {siteConfig.elfsight.reviews && (
        <section className="section" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="container mx-auto px-6 max-w-container">
            <AnimatedSection className="mb-10 text-center">
              <p className="section-label">
                {text(homePage?.reviewsLabel, defaults.reviewsLabel)}
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <ElfsightWidget
                appId={siteConfig.elfsight.reviews}
                fallbackLabel="Våra kundomdömen visas via en extern tjänst (Elfsight)."
              />
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Brands live on /om-oss — the landing page already carries the "25+
          varumärken" stat and the "Komponenter vi står bakom" feature, so a
          25-logo grid here was a third telling of the same thing. */}

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section
        className="py-24 md:py-28 relative overflow-hidden"
        style={{ background: 'var(--color-primary)' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 70% at 12% 75%, rgba(192,138,62,0.08) 0%, transparent 60%)',
          }}
        />
        <div
          className="container mx-auto px-6 relative z-10"
          style={{ maxWidth: 'var(--container-max)' }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <AnimatedSection direction="left">
              <p className="section-label mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {text(homePage?.ctaLabel, defaults.ctaLabel)}
              </p>
              <h2
                className="font-heading font-semibold"
                style={{
                  fontSize: 'clamp(1.9rem, 4vw, 3.2rem)',
                  color: 'white',
                  lineHeight: 1.12,
                  letterSpacing: '-0.02em',
                }}
              >
                {text(homePage?.ctaTitle, defaults.ctaTitle)}{' '}
                <em style={{ color: 'var(--color-gold)', fontStyle: 'italic' }}>
                  {ctaTitleAccent}
                </em>
              </h2>
              <p
                className="text-lg mt-6 max-w-md leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.58)' }}
              >
                {text(homePage?.ctaText, defaults.ctaText)}
              </p>
            </AnimatedSection>

            <AnimatedSection direction="right" className="w-full lg:max-w-sm lg:justify-self-end">
              <div className="flex flex-col gap-4">
                <Link href="/kontakt" className="btn-gold w-full">
                  {text(homePage?.ctaPrimaryLabel, defaults.ctaPrimaryLabel)}
                </Link>
                <Link
                  href="/tjanster"
                  className="btn-outline w-full !border-white/25 !text-white hover:!bg-white/10 hover:!text-white hover:!border-white/25"
                >
                  {text(homePage?.ctaSecondaryLabel, defaults.ctaSecondaryLabel)}
                </Link>

                <a
                  href={phoneHref}
                  className="group flex items-center gap-3 mt-3 pt-5"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition-colors duration-200"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-gold)' }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  <span>
                    <span
                      className="block text-xs tracking-[0.12em] uppercase"
                      style={{ color: 'rgba(255,255,255,0.42)' }}
                    >
                      {text(homePage?.ctaPhoneLabel, defaults.ctaPhoneLabel)}
                    </span>
                    <span
                      className="block font-heading font-semibold transition-colors duration-200 group-hover:text-white"
                      style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.9)' }}
                    >
                      {phone}
                    </span>
                  </span>
                </a>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  )
}
