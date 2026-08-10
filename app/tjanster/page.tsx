import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAllServices } from '@/sanity/queries'
import AnimatedSection from '@/components/AnimatedSection'
import PageTransition from '@/components/PageTransition'
import ServiceIndexRail from '@/components/ServiceIndexRail'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Tjänster',
  description:
    'Marinelektronik, elsystem i campervan, motorservice och båtrutor. Navolt hjälper dig med elen ombord i Göteborg och Öckerö.',
}

// PLACEHOLDER COPY — mirrors the four segments on Navolt's current site.
// Pending customer confirmation of both the split and the feature lists.
// Any `service` documents in Sanity override this entirely.
const defaultServices = [
  {
    _id: 'bat',
    slug: 'bat',
    title: 'Båt',
    shortDescription:
      'El och elektronik i fritidsbåten — från ett enskilt fel till ett helt nytt elsystem. Vi arbetar med både äldre båtar och nybyggen.',
    features: [
      'Felsökning av el- och laddsystem',
      'Navigation, plotter, radar och VHF',
      'Landström, laddare och batteribankar',
      'Belysning och inredningsel',
      'Bogpropeller och däcksutrustning',
    ],
    imageUrl: '/images/boat-img.jpg',
  },
  {
    _id: 'campervan',
    slug: 'campervan',
    title: 'Campervan',
    shortDescription:
      'Skräddarsytt elsystem i campervan och husbil. Vi dimensionerar efter hur du faktiskt använder bilen — inte efter en standardmall.',
    features: [
      'Solceller och laddregulatorer',
      'Litiumbank och batteriövervakning',
      'Växelriktare och 230 V ombord',
      'Värme och kyla',
      'Komplett installation från grunden',
    ],
    imageUrl: '/images/campervan-img.jpg',
  },
  {
    _id: 'motorservice',
    slug: 'motorservice',
    title: 'Motorservice',
    shortDescription:
      'Service och felsökning på båtmotorn. Vi tar hand om det löpande underhållet och letar rätt på felet när något krånglar.',
    features: [
      'Löpande service och underhåll',
      'Felsökning vid startproblem',
      'Byte av impeller, filter och olja',
      'Kontroll av drev och kylsystem',
      'Inför- och avrustning för säsong',
    ],
    imageUrl: '/images/motorservice.jpg',
  },
  {
    _id: 'batrutor',
    slug: 'batrutor',
    title: 'Båtrutor',
    shortDescription:
      'Byte och montering av båtrutor, med kompletta monteringspaket för de vanligaste båtmodellerna.',
    features: [
      'Byte av spruckna och immiga rutor',
      'Måttanpassad tillverkning',
      'Kompletta monteringspaket',
      'Tätning och efterkontroll',
    ],
    imageUrl: '/images/batrutor/batrutor-1.jpg',
  },
]

export default async function ServicesPage() {
  const sanityServices = await getAllServices()
  const services = sanityServices.length > 0 ? sanityServices : defaultServices

  return (
    <PageTransition>
      {/* Header */}
      <div className="pt-32 pb-16" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container">
          <AnimatedSection>
            <p className="section-label mb-3">Vad vi gör</p>
            <h1 className="section-title mb-5">Tjänster</h1>
            <p className="section-subtitle">
              El och elektronik ombord — i båt, husbil och campervan. Berätta vad som krånglar
              eller vad du vill bygga, så återkommer vi med en bedömning.
            </p>
          </AnimatedSection>
        </div>
      </div>

      {/* Services — sticky index rail beside stacked detail panels */}
      <section className="section">
        <div className="container mx-auto px-6 max-w-container">
          <div className="grid lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-x-20">
            <aside className="hidden lg:block">
              <div className="sticky top-32">
                <ServiceIndexRail
                  items={services.map((service) => ({
                    id: service.slug ?? service._id,
                    title: service.title,
                  }))}
                />
              </div>
            </aside>

            <div className="space-y-24 lg:space-y-32">
              {services.map((service, index) => (
                <AnimatedSection key={service._id}>
                  <article id={service.slug ?? service._id} className="scroll-mt-32">
                    <div className="aspect-[16/9] rounded-lg overflow-hidden relative mb-10">
                      {service.imageUrl ? (
                        <Image
                          src={service.imageUrl}
                          alt={service.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 800px"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%)`,
                            opacity: 0.5 + index * 0.1,
                          }}
                        >
                          <span className="font-heading text-xl text-white font-semibold opacity-40">
                            {service.title}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Number and rule — the panel's masthead */}
                    <div className="flex items-center gap-4 mb-4">
                      <span
                        className="font-heading text-xs tabular-nums tracking-[0.18em]"
                        style={{ color: 'var(--color-gold-ink)' }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
                    </div>

                    <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-5">
                      {service.title}
                    </h2>
                    {service.shortDescription && (
                      <p className="section-subtitle mb-10 max-w-2xl">{service.shortDescription}</p>
                    )}

                    {/* Spec-sheet list — ruled rows rather than icon bullets */}
                    {service.features && service.features.length > 0 && (
                      <ul className="grid sm:grid-cols-2 gap-x-10 mb-10">
                        {service.features.map((f, i) => (
                          <li
                            key={i}
                            className="py-3 text-sm border-t"
                            style={{
                              color: 'var(--color-text-muted)',
                              borderColor: 'var(--color-border)',
                            }}
                          >
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link href="/kontakt" className="btn-outline">
                      Fråga om {service.title.toLowerCase()}
                    </Link>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container text-center">
          <AnimatedSection>
            <p className="section-label mb-4">Osäker?</p>
            <h2 className="section-title mb-5">Vet du inte vad felet är?</h2>
            <p className="section-subtitle mx-auto mb-8">
              Det är helt okej — det är ofta därför man ringer en elektriker. Beskriv symptomen
              så gott du kan, så hör vi av oss och reder ut resten tillsammans.
            </p>
            <Link href="/kontakt" className="btn-primary">
              Kontakta oss
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </PageTransition>
  )
}
