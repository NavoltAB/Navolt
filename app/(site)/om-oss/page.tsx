import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAboutPage } from '@/sanity/queries'
import { list, paragraphs, text } from '@/sanity/fallback'
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/AnimatedSection'
import PageTransition from '@/components/PageTransition'
import Brands from '@/components/Brands'
import ElfsightWidget from '@/components/ElfsightWidget'
import { siteConfig } from '@/config/site'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Om oss',
  description: `${siteConfig.legalName} är marinelektriker på Hälsö i Göteborgs skärgård. Lär känna oss och hur vi arbetar.`,
}

// Every string and image on this page is editable in Sanity under "Om oss".
// This object is what renders until someone fills a field in — the page must
// stand up with no Sanity project configured at all.
//
// PLACEHOLDER COPY — the story below is written from what the current site
// says. Needs the customer's own words before launch, especially founding
// year and anything that reads as a credential.
const defaults = {
  pageLabel: 'Vilka vi är',
  pageTitle: `Om ${siteConfig.name}`,
  pageSubtitle:
    'Marinelektriker med Göteborgs norra skärgård som arbetsplats — och elen ombord som specialitet.',

  mainImageUrl: '/images/startpage-3.jpg',
  storyLabel: 'Bakgrund',
  storyParagraphs: [
    `${siteConfig.legalName} sitter på Hälsö i Göteborgs norra skärgård och arbetar med el och elektronik ombord. Fritidsbåtar, husbilar och campervans — allt från ett enskilt fel som stoppat semestern till kompletta elsystem i ett nybygge.`,
    'Vi startade för att det är förvånansvärt svårt att få tag på någon som både kan el och förstår vad som faktiskt händer med en installation som ligger i saltvatten och vibrerar hela sommaren. Det är två olika saker, och båda behövs.',
    'Det mesta av jobbet gör vi där båten ligger. Vi tar med oss verkstaden ut, felsöker på plats och löser problemet direkt när det går. När det krävs mer planering — en ny batteribank, solceller på taket, ett elsystem från grunden — börjar vi med att prata igenom hur du använder båten eller bilen. Det avgör dimensioneringen mer än något annat.',
    'Vi arbetar med varumärken vi litar på: Victron, Mastervolt, Garmin, Raymarine och ett tjugotal till. Inte för att namnen ser bra ut, utan för att delarna finns kvar och går att serva om några år.',
  ],
  storyCtaLabel: 'Kom i kontakt',

  stats: [
    { value: '25+', label: 'Varumärken' },
    { value: '4', label: 'Specialområden' },
    { value: 'Hälsö', label: 'Verkstad' },
    { value: 'F-skatt', label: 'Godkänt bolag' },
  ],

  valuesLabel: 'Vad vi står för',
  valuesTitle: 'Så jobbar vi',
  values: [
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
  ],

  instagramLabel: 'Instagram',
  instagramTitle: 'Senast från jobbet',

  ctaTitle: 'Något som krånglar ombord?',
  ctaText:
    'Hör av dig så tittar vi på det tillsammans — beskriv problemet så gott du kan, vi reder ut resten.',
  ctaPrimaryLabel: 'Kontakta oss',
  ctaSecondaryLabel: 'Se våra tjänster',
} as const

export default async function AboutPage() {
  const page = await getAboutPage()

  const stats = list(page?.stats, defaults.stats)
  const storyParagraphs = paragraphs(page?.storyText, defaults.storyParagraphs)
  // An entry with no heading has nothing to number, so it's dropped rather than
  // rendered as a bare paragraph beside an orphaned "05".
  const values = list(page?.values, defaults.values).filter((v) => v.title)

  return (
    <PageTransition>
      {/* Header */}
      <div className="pt-32 pb-16" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container">
          <AnimatedSection>
            <p className="section-label mb-3">{text(page?.pageLabel, defaults.pageLabel)}</p>
            <h1 className="section-title mb-5">{text(page?.pageTitle, defaults.pageTitle)}</h1>
            <p className="section-subtitle">
              {text(page?.pageSubtitle, defaults.pageSubtitle)}
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
                src={text(page?.mainImageUrl, defaults.mainImageUrl)}
                alt={`${siteConfig.legalName} arbetar med elinstallation ombord`}
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-x-20">
            <AnimatedSection>
              <p className="section-label mb-4">{text(page?.storyLabel, defaults.storyLabel)}</p>
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
                {storyParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <Link href="/kontakt" className="btn-primary mt-2 self-start">
                {text(page?.storyCtaLabel, defaults.storyCtaLabel)}
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
              <StaggerItem key={`${stat.label}-${index}`}>
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
            <p className="section-label mb-3">{text(page?.valuesLabel, defaults.valuesLabel)}</p>
            <h2 className="section-title">{text(page?.valuesTitle, defaults.valuesTitle)}</h2>
          </AnimatedSection>

          {/* Numbered, ruled entries — same rhythm as the services panels */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-x-16">
            {values.map((v, index) => (
              <StaggerItem key={`${v.title}-${index}`}>
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

      {/* Brands — moved off the landing page. It belongs here: the Bakgrund
          copy above already names Victron, Mastervolt, Garmin and Raymarine,
          so the logo grid reads as evidence for a claim rather than filler. */}
      <Brands />

      {/* Instagram — live proof of ongoing work, where static copy can't reach */}
      {siteConfig.elfsight.instagram && (
        <section className="section pt-0">
          <div className="container mx-auto px-6 max-w-container">
            <AnimatedSection className="mb-12">
              <p className="section-label mb-3">
                {text(page?.instagramLabel, defaults.instagramLabel)}
              </p>
              <h2 className="section-title">
                {text(page?.instagramTitle, defaults.instagramTitle)}
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <ElfsightWidget
                appId={siteConfig.elfsight.instagram}
                fallbackLabel="Vårt Instagram-flöde visas via en extern tjänst (Elfsight)."
              />
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container text-center">
          <AnimatedSection>
            <h2 className="section-title mb-5">{text(page?.ctaTitle, defaults.ctaTitle)}</h2>
            <p className="section-subtitle mx-auto mb-8">
              {text(page?.ctaText, defaults.ctaText)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/kontakt" className="btn-primary">
                {text(page?.ctaPrimaryLabel, defaults.ctaPrimaryLabel)}
              </Link>
              <Link href="/tjanster" className="btn-outline">
                {text(page?.ctaSecondaryLabel, defaults.ctaSecondaryLabel)}
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </PageTransition>
  )
}
