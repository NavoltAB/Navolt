import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/AnimatedSection'
import PageTransition from '@/components/PageTransition'
import ElfsightWidget from '@/components/ElfsightWidget'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Om oss',
  description: `${siteConfig.legalName} är marinelektriker på Hälsö i Göteborgs skärgård. Lär känna oss och hur vi arbetar.`,
}

// PLACEHOLDER COPY — the story below is written from what the current site
// says. Needs the customer's own words before launch, especially founding
// year and anything that reads as a credential.
const values = [
  {
    title: 'Gjort en gång, gjort rätt',
    text: 'Vi bygger installationer som går att förstå, felsöka och bygga vidare på. Märkta kablar, ritad dokumentation och komponenter som sitter där de ska — inte där det råkade finnas plats.',
  },
  {
    title: 'Ärlig bedömning',
    text: 'Ibland är svaret att något inte är värt att laga. Det säger vi hellre direkt än att fakturera dig för halva vägen dit. Du får ett pris innan vi sätter igång.',
  },
  {
    title: 'Komponenter som håller',
    text: 'Vi väljer marknadsledande marina varumärken framför det billigaste alternativet. Delar som finns kvar om fem år, och som går att serva av någon annan än oss.',
  },
  {
    title: 'Nära båten',
    text: 'Vi har basen på Hälsö och arbetar i Göteborg och Öckerö med omnejd. Det mesta löser vi där båten ligger — det blir smidigare och billigare för dig.',
  },
]

const stats = [
  { value: '25+', label: 'Varumärken' },
  { value: '4', label: 'Specialområden' },
  { value: 'Hälsö', label: 'Verkstad' },
  { value: 'F-skatt', label: 'Godkänt bolag' },
]

export default function AboutPage() {
  return (
    <PageTransition>
      {/* Header */}
      <div className="pt-32 pb-16" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container">
          <AnimatedSection>
            <p className="section-label mb-3">Vilka vi är</p>
            <h1 className="section-title mb-5">Om {siteConfig.name}</h1>
            <p className="section-subtitle">
              Marinelektriker med Göteborgs norra skärgård som arbetsplats — och elen ombord
              som specialitet.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Story — wide banner, then prose against a labelled rail */}
      <section className="section">
        <div className="container mx-auto px-6 max-w-container">
          <AnimatedSection direction="none" className="mb-16">
            <div className="aspect-[21/9] rounded-lg overflow-hidden relative">
              <Image
                src="/images/startpage-3.jpg"
                alt={`${siteConfig.legalName} arbetar med elinstallation ombord`}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-x-20">
            <AnimatedSection>
              <p className="section-label mb-4">Bakgrund</p>
              <span
                className="hidden lg:block h-px w-full mb-8"
                style={{ background: 'var(--color-gold)' }}
              />
            </AnimatedSection>

            <AnimatedSection delay={0.1} className="flex flex-col gap-6">
              <div
                className="space-y-5 text-base leading-loose max-w-2xl"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <p>
                  {siteConfig.legalName} sitter på Hälsö i Göteborgs norra skärgård och arbetar
                  med el och elektronik ombord. Fritidsbåtar, husbilar och campervans — allt från
                  ett enskilt fel som stoppat semestern till kompletta elsystem i ett nybygge.
                </p>
                <p>
                  Vi startade för att det är förvånansvärt svårt att få tag på någon som både kan
                  el och förstår vad som faktiskt händer med en installation som ligger i saltvatten
                  och vibrerar hela sommaren. Det är två olika saker, och båda behövs.
                </p>
                <p>
                  Det mesta av jobbet gör vi där båten ligger. Vi tar med oss verkstaden ut, felsöker
                  på plats och löser problemet direkt när det går. När det krävs mer planering —
                  en ny batteribank, solceller på taket, ett elsystem från grunden — börjar vi med
                  att prata igenom hur du använder båten eller bilen. Det avgör dimensioneringen
                  mer än något annat.
                </p>
                <p>
                  Vi arbetar med varumärken vi litar på: Victron, Mastervolt, Garmin, Raymarine
                  och ett tjugotal till. Inte för att namnen ser bra ut, utan för att delarna finns
                  kvar och går att serva om några år.
                </p>
              </div>

              <Link href="/kontakt" className="btn-primary mt-2 self-start">
                Kom i kontakt
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16" style={{ background: 'var(--color-primary)' }}>
        <div className="container mx-auto px-6 max-w-container">
          {/* Ruled band rather than centred cards — reads as an instrument panel */}
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => (
              <StaggerItem key={stat.label}>
                <div
                  className={`text-white px-6 py-2 h-full ${index === 0 ? '' : 'md:border-l'}`}
                  style={{ borderColor: 'rgba(255,255,255,0.15)' }}
                >
                  <p
                    className="font-heading font-semibold mb-1 tabular-nums"
                    style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', color: 'var(--color-gold)' }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-xs tracking-[0.16em] uppercase"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {stat.label}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container mx-auto px-6 max-w-container">
          <AnimatedSection className="mb-12">
            <p className="section-label mb-3">Vad vi står för</p>
            <h2 className="section-title">Så jobbar vi</h2>
          </AnimatedSection>

          {/* Numbered, ruled entries — same rhythm as the services panels */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-x-16">
            {values.map((v, index) => (
              <StaggerItem key={v.title}>
                <div
                  className="py-7 border-t h-full"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <span
                    className="font-heading text-xs tabular-nums tracking-[0.18em] block mb-3"
                    style={{ color: 'var(--color-gold-ink)' }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-heading text-xl font-semibold mb-3">{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {v.text}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Instagram — live proof of ongoing work, where static copy can't reach */}
      {siteConfig.elfsight.instagram && (
        <section className="section pt-0">
          <div className="container mx-auto px-6 max-w-container">
            <AnimatedSection className="mb-12">
              <p className="section-label mb-3">Instagram</p>
              <h2 className="section-title">Senast från jobbet</h2>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <ElfsightWidget appId={siteConfig.elfsight.instagram} />
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container text-center">
          <AnimatedSection>
            <h2 className="section-title mb-5">Något som krånglar ombord?</h2>
            <p className="section-subtitle mx-auto mb-8">
              Hör av dig så tittar vi på det tillsammans — beskriv problemet så gott du kan,
              vi reder ut resten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/kontakt" className="btn-primary">
                Kontakta oss
              </Link>
              <Link href="/tjanster" className="btn-outline">
                Se våra tjänster
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </PageTransition>
  )
}
