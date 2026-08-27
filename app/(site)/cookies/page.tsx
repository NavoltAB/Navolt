import type { Metadata } from 'next'
import Link from 'next/link'
import PageTransition from '@/components/PageTransition'
import CookieSettingsButton from '@/components/CookieSettingsButton'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Cookiepolicy',
  description: `Vilka cookies ${siteConfig.legalName} använder, varför, och hur du ändrar ditt val.`,
}

const LAST_UPDATED = 'augusti 2026'

const heading = 'font-heading text-xl font-semibold mb-3'
const link = 'underline underline-offset-2 hover:text-primary transition-colors'

// What the site actually stores. Keep this table honest — it is the part a
// visitor (or a tillsynsmyndighet) checks against what the browser really does.
// Add a row here whenever something new is stored, and bump CONSENT_VERSION in
// CookieConsentContext if the categories themselves change.
const NECESSARY = [
  {
    name: 'navolt_cookie_consent',
    type: 'Local storage (förstapart)',
    purpose: 'Sparar ditt cookie-val så att du slipper svara vid varje besök.',
    retention: 'Tills du rensar webbläsaren eller ändrar ditt val',
  },
  {
    name: 'navolt-varukorg',
    type: 'Local storage (förstapart)',
    purpose: 'Håller reda på vad du lagt i varukorgen mellan sidbyten.',
    retention: 'Tills korgen töms eller webbläsaren rensas',
  },
]

const EXTERNAL = [
  {
    name: 'Elfsight',
    type: 'Tredjepartsskript och cookies',
    purpose:
      'Visar chatten, kundomdömena och Instagram-flödet. Elfsight laddar i sin tur innehåll från Facebook och Instagram, som kan sätta egna cookies och registrera att du besökt sidan.',
    retention: 'Enligt respektive leverantörs villkor',
  },
]

function Table({
  rows,
}: {
  rows: { name: string; type: string; purpose: string; retention: string }[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[520px]">
        <thead>
          <tr className="text-left">
            {['Namn', 'Typ', 'Syfte', 'Lagringstid'].map((h) => (
              <th
                key={h}
                className="py-2 pr-4 text-xs font-semibold uppercase tracking-widest border-b align-bottom"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td
                className="py-3 pr-4 align-top border-b font-medium"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                {row.name}
              </td>
              <td className="py-3 pr-4 align-top border-b" style={{ borderColor: 'var(--color-border)' }}>
                {row.type}
              </td>
              <td className="py-3 pr-4 align-top border-b leading-relaxed" style={{ borderColor: 'var(--color-border)' }}>
                {row.purpose}
              </td>
              <td className="py-3 align-top border-b" style={{ borderColor: 'var(--color-border)' }}>
                {row.retention}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function CookiesPage() {
  return (
    <PageTransition>
      <div className="pt-32 pb-16" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto px-6 max-w-container">
          <p className="section-label mb-3">Juridisk information</p>
          <h1 className="section-title mb-3">Cookiepolicy</h1>
          <p className="section-subtitle">Senast uppdaterad: {LAST_UPDATED}</p>
        </div>
      </div>

      <section className="section">
        <div className="container mx-auto px-6 max-w-container">
          <div className="max-w-3xl space-y-10" style={{ color: 'var(--color-text-muted)' }}>
            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Vad cookies är
              </h2>
              <p className="text-sm leading-relaxed">
                Cookies och liknande tekniker (t.ex. local storage) är små textfiler som sparas i
                din webbläsare när du besöker en webbplats. Enligt lagen om elektronisk
                kommunikation får vi bara lagra sådant som inte är nödvändigt för tjänsten om du
                har sagt ja till det först. Därför laddas ingenting från externa tjänster på den
                här sidan förrän du gett ditt samtycke.
              </p>
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Nödvändiga — alltid aktiva
              </h2>
              <p className="text-sm leading-relaxed mb-4">
                Krävs för att webbplatsen ska fungera. De sätts av oss, lagras enbart i din egen
                webbläsare och skickas aldrig vidare till någon annan.
              </p>
              <Table rows={NECESSARY} />
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Externa tjänster — endast med ditt samtycke
              </h2>
              <p className="text-sm leading-relaxed mb-4">
                Innehåll som hämtas från andra företag. Säger du nej visas innehållet inte, och
                inget av det laddas.
              </p>
              <Table rows={EXTERNAL} />
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Ändra ditt val
              </h2>
              <p className="text-sm leading-relaxed mb-4">
                Du kan när som helst ändra eller ta tillbaka ditt samtycke. Öppna inställningarna
                här, eller via länken &ldquo;Cookie-inställningar&rdquo; längst ned på varje sida.
                Tar du tillbaka samtycket laddas sidan om så att de externa skripten försvinner.
                Cookies som redan hunnit sättas av en extern tjänst raderar du i din webbläsares
                inställningar.
              </p>
              <CookieSettingsButton className="btn-outline !py-2 !px-5 !text-xs" />
            </div>

            <div>
              <h2 className={heading} style={{ color: 'var(--color-text)' }}>
                Frågor
              </h2>
              <p className="text-sm leading-relaxed">
                Hur vi behandlar personuppgifter i övrigt beskrivs i vår{' '}
                <Link href="/integritetspolicy" className={link}>
                  integritetspolicy
                </Link>
                . Har du frågor når du oss på{' '}
                <a href={`mailto:${siteConfig.contact.email}`} className={link}>
                  {siteConfig.contact.email}
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
