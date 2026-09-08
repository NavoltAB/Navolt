import type { Metadata } from 'next'
import Link from 'next/link'
import PageTransition from '@/components/PageTransition'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Köpvillkor',
  description: `Villkoren för beställningar hos ${siteConfig.legalName} — betalning, frakt, leverans, ångerrätt och reklamation.`,
}

// Static legal copy — deliberately not editable in Sanity, for the same reason
// the integritetspolicy isn't: villkor that can be changed without a record of
// what they said when the order was placed are worth less than no villkor.
// Update the date below whenever the text changes.
const LAST_UPDATED = 'september 2026'

const heading = 'font-heading text-xl font-semibold mb-3'
const link = 'underline underline-offset-2 hover:text-primary transition-colors'

export default function KopvillkorPage() {
  return (
    <PageTransition>
      <div className="pt-32 pb-16" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container">
          <p className="section-label mb-3">Juridisk information</p>
          <h1 className="section-title mb-3">Köpvillkor</h1>
          <p className="section-subtitle">Senast uppdaterad: {LAST_UPDATED}</p>
        </div>
      </div>

      <section className="section">
        <div className="container mx-auto px-6 max-w-container">
          <div className="max-w-2xl space-y-10" style={{ color: 'var(--color-text-muted)' }}>
            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Om {siteConfig.name}
              </h2>
              <p className="text-sm leading-relaxed mb-3">Försäljningen sker genom:</p>
              <ul className="text-sm space-y-1.5">
                <li>
                  <strong style={{ color: 'var(--color-text)' }}>{siteConfig.legalName}</strong>,
                  org.nr {siteConfig.company.orgNumber}
                </li>
                <li>
                  E-post:{' '}
                  <a href={`mailto:${siteConfig.contact.email}`} className={link}>
                    {siteConfig.contact.email}
                  </a>
                </li>
                <li>Telefon: {siteConfig.contact.phone}</li>
                <li>
                  Postadress:{' '}
                  <span className="whitespace-pre-line">{siteConfig.contact.postalAddress}</span>
                </li>
              </ul>
              <p className="text-sm leading-relaxed mt-3">
                Postadressen är inte en besöks- eller upphämtningsadress.
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Beställning och betalning
              </h2>
              <p className="text-sm leading-relaxed mb-3">
                När du skickar en beställning får du ett mejl som bekräftar att vi har tagit emot
                den. Vi går därefter igenom beställningen och skickar fakturan separat via mejl.
              </p>
              <p className="text-sm leading-relaxed">
                Beställningen blir bindande när fakturan är betald. {siteConfig.legalName} kan avstå
                från att genomföra beställningen före betalning, exempelvis om en produkt är slut
                eller om produkt- eller prisinformationen varit felaktig.
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Pris och frakt
              </h2>
              <p className="text-sm leading-relaxed mb-3">
                Alla priser anges i svenska kronor inklusive moms.
              </p>
              <p className="text-sm leading-relaxed">
                Frakt tillkommer och anges på fakturan. Fraktkostnaden beräknas utifrån
                beställningens storlek, vikt och leveransadress.
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Leverans och hämtning
              </h2>
              <p className="text-sm leading-relaxed mb-3">
                Vid leverans skickas produkterna efter att fakturan är betald.
              </p>
              <p className="text-sm leading-relaxed">
                Vid hämtning kontaktar vi dig för att komma överens om tid och plats för
                överlämning.
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Produktinformation och mått
              </h2>
              <p className="text-sm leading-relaxed mb-3">
                Båtar av samma modell kan skilja sig åt. Du ansvarar därför för att jämföra
                produktens angivna mått med båtens befintliga rutor före beställning.
              </p>
              <p className="text-sm leading-relaxed">
                <Link href="/kontakt" className={link}>
                  Kontakta oss
                </Link>{' '}
                om måtten avviker eller om du är osäker på om produkten passar.
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Ångerrätt och retur
              </h2>
              <p className="text-sm leading-relaxed mb-3">
                Som konsument har du normalt 14 dagars ångerrätt från dagen efter att du tagit emot
                produkten.
              </p>
              <p className="text-sm leading-relaxed mb-3">
                Om du vill ångra köpet kontaktar du{' '}
                <a href={`mailto:${siteConfig.contact.email}`} className={link}>
                  {siteConfig.contact.email}
                </a>{' '}
                och anger namn, beställningsnummer och vilka produkter det gäller.
              </p>
              <p className="text-sm leading-relaxed mb-3">
                Du ansvarar för att ordna och bekosta returtransporten. Kontakta oss före retur för
                att få rätt returadress. Produkter som innehåller farligt gods får inte skickas med
                vanlig post utan måste returneras på ett tillåtet sätt.
              </p>
              <p className="text-sm leading-relaxed">
                Ångerrätten gäller inte produkter som har tillverkats eller anpassats efter dina
                individuella mått eller önskemål. Om detta gäller ska det framgå före beställningen.
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Reklamation
              </h2>
              <p className="text-sm leading-relaxed mb-3">
                Om en produkt är felaktig har du rätt att reklamera den enligt konsumentköplagen.
                Kontakta{' '}
                <a href={`mailto:${siteConfig.contact.email}`} className={link}>
                  {siteConfig.contact.email}
                </a>
                , ange beställningsnummer och beskriv felet. Bifoga gärna bilder.
              </p>
              <p className="text-sm leading-relaxed">
                Skador som har uppstått genom felaktig montering eller användning räknas inte som
                ursprungliga fel på produkten.
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Tvist
              </h2>
              <p className="text-sm leading-relaxed">
                Om vi inte kan lösa en tvist tillsammans kan du vända dig till{' '}
                <strong style={{ color: 'var(--color-text)' }}>
                  Allmänna reklamationsnämnden
                </strong>{' '}
                på{' '}
                <a
                  href="https://www.arn.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={link}
                >
                  arn.se
                </a>
                . Svensk lag gäller för köpet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
