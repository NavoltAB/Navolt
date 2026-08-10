import Link from 'next/link'
import Image from 'next/image'
import { getAllServices, getHomePage } from '@/sanity/queries'
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/AnimatedSection'
import Brands from '@/components/Brands'
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

const features = [
  {
    label: 'Rätt utfört från början',
    text: 'El ombord är inte platsen för genvägar. Vi drar, märker och dokumenterar installationen så att den går att felsöka och bygga vidare på — även av någon annan, om tio år.',
  },
  {
    label: 'Vi kommer till båten',
    text: 'Det mesta löser vi där båten ligger. Slipper du transportera fram och tillbaka blir jobbet både snabbare och billigare för dig.',
  },
  {
    label: 'Komponenter vi står bakom',
    text: 'Vi arbetar med marknadsledande marina varumärken — Victron, Mastervolt, Garmin, Raymarine och fler. Delar som går att få tag på och serva även i framtiden.',
  },
]

const stats = [
  { value: '25+', label: 'Varumärken vi arbetar med' },
  { value: '4', label: 'Specialområden' },
  { value: 'Hälsö', label: 'Verkstad i skärgården' },
  { value: 'F-skatt', label: 'Godkänt bolag' },
]

export default async function HomePage() {
  const [services, homePage] = await Promise.all([getAllServices(), getHomePage()])

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

  const heroTitle = homePage?.heroTitle
  const heroSubtitle =
    homePage?.heroSubtitle ||
    'Felsökning, uppgradering och nyinstallation av el och elektronik i din fritidsbåt, husbil eller campervan.'

  const aboutTitle = homePage?.aboutTitle || 'Marinelektriker med skärgården som arbetsplats'
  const aboutText =
    homePage?.aboutText ||
    'Navolt sitter på Hälsö i Göteborgs norra skärgård och arbetar med el och elektronik ombord — från en trasig landströmsladdare till ett komplett elsystem i en nybyggd campervan. Vi tar oss an både det lilla felet som stoppat semestern och de större installationerna som kräver planering.'

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Image
          src={homePage?.heroImageUrl || '/images/hero-img.jpg'}
          alt="Marinelektronik och elinstallation i båt — Navolt i Göteborg och Öckerö"
          fill
          className="object-cover"
          priority
        />

        {/* Navy scrim — keeps the white headline legible over the photo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(150deg, rgba(7,20,33,0.86) 0%, rgba(11,34,55,0.62) 45%, rgba(7,20,33,0.88) 100%)',
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
              Göteborg · Öckerö · Hälsö
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
              {heroTitle || (
                <>
                  Vi löser elen<br />
                  <em style={{ color: 'var(--color-gold)', fontStyle: 'italic' }}>ombord</em>
                </>
              )}
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.42}>
            <p
              className="text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto"
              style={{ color: 'rgba(255,255,255,0.66)' }}
            >
              {heroSubtitle}
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.56}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/tjanster" className="btn-gold">
                Se våra tjänster
              </Link>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
                className="group inline-flex items-center gap-2 text-sm font-medium text-white"
              >
                <span className="border-b border-transparent pb-0.5 transition-colors duration-200 group-hover:border-white/60">
                  Ring {siteConfig.contact.phone}
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
            {stats.map((s) => (
              <StaggerItem key={s.label}>
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

      {/* ── Segments ──────────────────────────────────────────── */}
      <section className="section">
        <div className="container mx-auto px-6" style={{ maxWidth: 'var(--container-max)' }}>
          <AnimatedSection className="mb-12">
            <p className="section-label mb-3">Vad vi gör</p>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <h2 className="section-title">Fyra saker vi kan på riktigt</h2>
              <Link href="/tjanster" className="btn-outline shrink-0">
                Alla tjänster
              </Link>
            </div>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {segments.map((seg) => (
              <StaggerItem key={seg._id}>
                <Link
                  href={seg.href}
                  className="group block h-full overflow-hidden"
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface)',
                  }}
                >
                  <div
                    className="aspect-[4/3] relative overflow-hidden"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {seg.imageUrl && (
                      <Image
                        src={seg.imageUrl}
                        alt={seg.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    )}
                    <div
                      className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      style={{ background: 'rgba(11,34,55,0.18)' }}
                    />
                  </div>

                  <div className="p-6 flex flex-col gap-2">
                    <h3
                      className="font-heading font-semibold"
                      style={{ fontSize: 'var(--text-xl)' }}
                    >
                      {seg.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {seg.shortDescription}
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-medium mt-2"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Läs mer
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="translate-x-0 group-hover:translate-x-1 transition-transform duration-200"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Manifesto ─────────────────────────────────────────── */}
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
              Elen ombord ska bara{' '}
              <em style={{ color: 'var(--color-gold)', fontStyle: 'italic' }}>fungera</em> — oavsett
              väder och oavsett hur långt hemifrån du är.
            </p>
          </AnimatedSection>
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
              <p className="section-label mb-2">Vårt arbetssätt</p>
              <h2 className="section-title">Varför Navolt</h2>
            </div>
          </div>

          {features.map((f, i) => (
            <AnimatedSection key={f.label} delay={i * 0.1}>
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
                    {f.label}
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
                  src={homePage?.aboutImageUrl || '/images/startpage-2.jpg'}
                  alt={`Om ${siteConfig.legalName}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right">
              <p className="section-label mb-4">Om oss</p>
              <h2 className="section-title mb-6">{aboutTitle}</h2>
              <p className="section-subtitle mb-10">{aboutText}</p>

              <div className="grid grid-cols-3 gap-6 mb-10">
                {[
                  { value: 'Hälsö', label: 'Bas' },
                  { value: 'Göteborg', label: 'Upptagningsområde' },
                  { value: 'F-skatt', label: 'Godkänt' },
                ].map((s) => (
                  <div key={s.label}>
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
                Mer om Navolt
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── Brands ────────────────────────────────────────────── */}
      <Brands />

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
                Hör av dig
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
                Berätta vad som{' '}
                <em style={{ color: 'var(--color-gold)', fontStyle: 'italic' }}>krånglar</em>
              </h2>
              <p
                className="text-lg mt-6 max-w-md leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.58)' }}
              >
                Beskriv problemet eller projektet så återkommer vi med en bedömning — och ett pris
                innan vi sätter igång.
              </p>
            </AnimatedSection>

            <AnimatedSection direction="right" className="w-full lg:max-w-sm lg:justify-self-end">
              <div className="flex flex-col gap-4">
                <Link href="/kontakt" className="btn-gold w-full">
                  Kontakta oss
                </Link>
                <Link
                  href="/tjanster"
                  className="btn-outline w-full !border-white/25 !text-white hover:!bg-white/10 hover:!text-white hover:!border-white/25"
                >
                  Se våra tjänster
                </Link>

                <a
                  href={`tel:${siteConfig.contact.phone.replace(/[^0-9+]/g, '')}`}
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
                      Ring oss direkt
                    </span>
                    <span
                      className="block font-heading font-semibold transition-colors duration-200 group-hover:text-white"
                      style={{ fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.9)' }}
                    >
                      {siteConfig.contact.phone}
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
