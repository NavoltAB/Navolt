import Image from 'next/image'
import AnimatedSection, { StaggerContainer, StaggerItem } from '@/components/AnimatedSection'
import { getAllBrands } from '@/sanity/queries'
import { urlFor } from '@/sanity/imageUrl'

// Fallback list — used until "Varumärken" is populated in Sanity, and whenever
// Sanity isn't configured at all. Logo files live in /public/brands; filenames
// are slugified because the originals contained spaces, ampersands and
// diacritics. Mirrored in scripts/seed-brands.mjs, which uploads these to Sanity.
const defaultBrands: { name: string; file: string; scale?: number }[] = [
  { name: 'B&G', file: 'bochg.png' },
  { name: 'BEP', file: 'bep.png' },
  { name: 'Blue Sea Systems', file: 'blue-sea-systems.png' },
  { name: 'Dometic', file: 'dometic.png' },
  { name: 'Eberspächer', file: 'eberspacher.png' },
  { name: 'Fusion', file: 'fusion.png' },
  { name: 'Garmin', file: 'garmin.png' },
  { name: 'Isotemp', file: 'isotemp.png' },
  { name: 'Isotherm', file: 'isotherm.png' },
  // These two ship with a lot of internal padding — scaled up to match the rest.
  { name: 'Lewmar', file: 'lewmar.png', scale: 1.85 },
  { name: 'Lowrance', file: 'lowrance.png' },
  { name: 'Mastervolt', file: 'mastervolt-ny.png' },
  { name: 'Nexa', file: 'nexa.png' },
  { name: 'Nordmax', file: 'nordmax.png' },
  { name: 'Quick', file: 'quick.png' },
  { name: 'Raymarine', file: 'raymarine.png' },
  { name: 'Renogy', file: 'renogy.png' },
  { name: 'Sika', file: 'sika.png' },
  { name: 'Simrad', file: 'simrad.png' },
  { name: 'Skanbatt', file: 'skanbatt.jpg' },
  { name: 'Skyllermarks', file: 'skyllermarks.png' },
  { name: 'Sleipner', file: 'sleipner.jpg', scale: 1.7 },
  { name: 'Sutars', file: 'sutars.png' },
  { name: 'Teltonika', file: 'teltonika.png' },
  { name: 'Victron Energy', file: 'victron-energy.png' },
]

export default async function Brands() {
  const cmsBrands = await getAllBrands()

  const logos =
    cmsBrands.length > 0
      ? cmsBrands.map((brand) => ({
          key: brand._id,
          name: brand.name,
          // 170px box on a 2x screen — no logo needs more than this.
          src: urlFor(brand.logo).width(340).url(),
          scale: brand.scale,
        }))
      : defaultBrands.map((brand) => ({
          key: brand.name,
          name: brand.name,
          src: `/brands/${brand.file}`,
          scale: brand.scale,
        }))

  return (
    <section className="section" style={{ borderTop: '1px solid var(--color-border)' }}>
      <div className="container mx-auto px-6" style={{ maxWidth: 'var(--container-max)' }}>
        <AnimatedSection className="mb-12 text-center">
          <p className="section-label mb-3">Leverantörer</p>
          <h2 className="section-title">Varumärken vi arbetar med</h2>
        </AnimatedSection>

        {/* Tight stagger — the shared ripple, but stepped down so 25 logos
            settle in ~1.4s rather than the ~3s a 0.1s step would take. */}
        <StaggerContainer
          stagger={0.035}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 items-center justify-items-center"
        >
          {logos.map((logo) => (
            <StaggerItem key={logo.key} className="w-full flex justify-center">
              <div className="w-full max-w-[170px] h-[84px] relative flex items-center justify-center">
                <Image
                  src={logo.src}
                  alt={logo.name}
                  fill
                  sizes="(max-width: 640px) 45vw, 170px"
                  className="object-contain opacity-80 transition-opacity duration-300 hover:opacity-100"
                  style={
                    logo.scale && logo.scale !== 1
                      ? { transform: `scale(${logo.scale})` }
                      : undefined
                  }
                />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
