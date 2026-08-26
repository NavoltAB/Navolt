import type { Metadata } from 'next'
import Link from 'next/link'
import PageTransition from '@/components/PageTransition'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Integritetspolicy',
  description: `Så behandlar ${siteConfig.legalName} dina personuppgifter enligt GDPR.`,
}

// Static legal copy — deliberately not editable in Sanity. A policy that can be
// changed without a record of what it said before is worth less than no policy.
// Update the date below whenever the text changes.
const LAST_UPDATED = 'augusti 2026'

const heading = 'font-heading text-xl font-semibold mb-3'
const link = 'underline underline-offset-2 hover:text-primary transition-colors'

export default function IntegritetspolicyPage() {
  return (
    <PageTransition>
      <div className="pt-32 pb-16" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container">
          <p className="section-label mb-3">Juridisk information</p>
          <h1 className="section-title mb-3">Integritetspolicy</h1>
          <p className="section-subtitle">Senast uppdaterad: {LAST_UPDATED}</p>
        </div>
      </div>

      <section className="section">
        <div className="container mx-auto px-6 max-w-container">
          <div className="max-w-2xl space-y-10" style={{ color: 'var(--color-text-muted)' }}>
            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                1. Personuppgiftsansvarig
              </h2>
              <p className="text-sm leading-relaxed">
                {siteConfig.legalName} (org.nr {siteConfig.company.orgNumber}),{' '}
                <span className="whitespace-pre-line">{siteConfig.contact.address}</span>, är
                personuppgiftsansvarig för de uppgifter som behandlas via denna webbplats. Har du
                frågor om hur vi hanterar dina uppgifter når du oss på{' '}
                <a href={`mailto:${siteConfig.contact.email}`} className={link}>
                  {siteConfig.contact.email}
                </a>{' '}
                eller {siteConfig.contact.phone}.
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                2. Vilka uppgifter vi samlar in
              </h2>
              <p className="text-sm leading-relaxed mb-3">
                Vi samlar in de uppgifter du själv lämnar när du kontaktar oss via ett formulär på
                webbplatsen:
              </p>
              <ul className="text-sm space-y-1.5 list-disc pl-5">
                <li>Namn</li>
                <li>E-postadress</li>
                <li>Telefonnummer</li>
                <li>Vad förfrågan gäller, och dina svar på följdfrågorna om båten eller bilen</li>
                <li>Ditt meddelande</li>
                <li>Bilder eller dokument du själv väljer att bifoga</li>
                <li>De produkter du lagt i offertkorgen, om du begär en offert</li>
              </ul>
              <p className="text-sm leading-relaxed mt-3">
                Vi samlar inte in uppgifter om dig utan att du aktivt skickar in ett formulär, och
                vi använder inga analys- eller spårningsverktyg för besöksstatistik. Väljer du att
                tillåta externa tjänster kan dessa dock samla in uppgifter för egen räkning — se{' '}
                <Link href="/cookies" className={link}>
                  cookiepolicyn
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                3. Varför vi behandlar uppgifterna och rättslig grund
              </h2>
              <ul className="text-sm space-y-1.5 list-disc pl-5">
                <li>
                  För att besvara din förfrågan och lämna offert — berättigat intresse av att
                  hantera inkommande kundkontakter (art. 6.1 f GDPR), och inför ett avtal (art.
                  6.1 b GDPR).
                </li>
                <li>
                  För att utföra och fakturera ett uppdrag — fullgörande av avtal (art. 6.1 b
                  GDPR).
                </li>
                <li>
                  För att spara underlag till bokföringen — rättslig förpliktelse (art. 6.1 c
                  GDPR, bokföringslagen).
                </li>
                <li>
                  För att ladda innehåll från externa tjänster — ditt samtycke (art. 6.1 a GDPR),
                  som du när som helst kan ta tillbaka.
                </li>
              </ul>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                4. Hur länge vi sparar uppgifterna
              </h2>
              <p className="text-sm leading-relaxed">
                Förfrågningar som inte leder till uppdrag raderas löpande, senast inom tolv
                månader. Uppgifter som hör till ett utfört uppdrag sparas så länge det behövs för
                garanti- och serviceärenden, och underlag som utgör bokföringsmaterial sparas i sju
                år enligt bokföringslagen.
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                5. Vilka som får del av uppgifterna
              </h2>
              <p className="text-sm leading-relaxed mb-3">
                Vi säljer aldrig dina uppgifter. Vi anlitar följande leverantörer, som behandlar
                uppgifter för vår räkning:
              </p>
              <ul className="text-sm space-y-1.5 list-disc pl-5">
                <li>
                  <strong style={{ color: 'var(--color-text)' }}>Resend</strong> — levererar
                  e-posten från webbplatsens formulär till oss.
                </li>
                <li>
                  <strong style={{ color: 'var(--color-text)' }}>Vercel</strong> — driftar
                  webbplatsen och behandlar tekniska loggar, bl.a. IP-adress, för att sidan ska
                  fungera och vara säker.
                </li>
                <li>
                  <strong style={{ color: 'var(--color-text)' }}>Elfsight</strong> — levererar
                  chatt, recensioner och Instagram-flödet. Laddas bara om du samtyckt.
                </li>
              </ul>
              <p className="text-sm leading-relaxed mt-3">
                Vissa av dessa leverantörer kan behandla uppgifter utanför EU/EES. Överföringen
                sker i så fall med stöd av EU-kommissionens standardavtalsklausuler eller ett
                beslut om adekvat skyddsnivå. Utöver detta lämnar vi bara ut uppgifter när lagen
                kräver det.
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                6. Cookies
              </h2>
              <p className="text-sm leading-relaxed">
                Webbplatsen använder nödvändiga cookies och — bara med ditt samtycke — cookies från
                externa tjänster. Vad som lagras, hur länge och hur du ändrar ditt val står i{' '}
                <Link href="/cookies" className={link}>
                  cookiepolicyn
                </Link>
                .
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                7. Dina rättigheter
              </h2>
              <p className="text-sm leading-relaxed mb-3">Du har rätt att:</p>
              <ul className="text-sm space-y-1.5 list-disc pl-5">
                <li>Begära ett utdrag över de uppgifter vi har om dig</li>
                <li>Få felaktiga uppgifter rättade</li>
                <li>Begära radering (&ldquo;rätten att bli glömd&rdquo;)</li>
                <li>Invända mot behandling som stödjer sig på berättigat intresse</li>
                <li>Begära att behandlingen begränsas</li>
                <li>Få ut dina uppgifter i ett maskinläsbart format (dataportabilitet)</li>
                <li>När som helst ta tillbaka ett samtycke du lämnat</li>
              </ul>
              <p className="text-sm leading-relaxed mt-3">
                Kontakta oss på{' '}
                <a href={`mailto:${siteConfig.contact.email}`} className={link}>
                  {siteConfig.contact.email}
                </a>{' '}
                så svarar vi inom 30 dagar.
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                8. Klagomål
              </h2>
              <p className="text-sm leading-relaxed">
                Om du anser att vi behandlar dina uppgifter felaktigt har du rätt att lämna in ett
                klagomål till{' '}
                <strong style={{ color: 'var(--color-text)' }}>
                  Integritetsskyddsmyndigheten (IMY)
                </strong>
                :{' '}
                <a
                  href="https://www.imy.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={link}
                >
                  www.imy.se
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
