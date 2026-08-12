import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getKontaktPage, getSiteSettings } from '@/sanity/queries'
import { text } from '@/sanity/fallback'
import AnimatedSection from '@/components/AnimatedSection'
import ContactForm from '@/components/ContactForm'
import PageTransition from '@/components/PageTransition'
import { siteConfig } from '@/config/site'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Kontakt',
  description: `Kontakta ${siteConfig.legalName} — marinelektriker i Göteborg och Öckerö. Ring, mejla eller besök oss på Hälsö.`,
}

// Editable in Sanity under "Kontakt". These render until someone fills the
// fields in — the page has to stand up with no Sanity project configured.
const defaults = {
  pageLabel: 'Hör av dig',
  pageTitle: 'Kontakt',
  pageSubtitle:
    'Ring, mejla eller skicka ett meddelande här. Beskriv gärna båten eller bilen och vad som krånglar — då kan vi ge dig ett rakare svar direkt.',
  contactInfoTitle: 'Uppgifter',
  openingHoursTitle: 'Öppettider',
  freeConsultationTitle: 'Pris innan vi börjar',
  freeConsultationText:
    'Du får alltid en bedömning och ett pris innan vi sätter igång. Är felet inte värt att laga säger vi det direkt.',
  formTitle: 'Skicka ett meddelande',
} as const

export default async function ContactPage() {
  const [sanitySettings, page] = await Promise.all([getSiteSettings(), getKontaktPage()])

  // Sanity wins where it has a value; config/site.ts is the fallback so the
  // page still shows real details before the CMS is populated.
  const settings = {
    phone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: siteConfig.contact.address,
    openingHours: siteConfig.contact.openingHours,
    mapsUrl: siteConfig.contact.mapsUrl as string | undefined,
    ...Object.fromEntries(Object.entries(sanitySettings ?? {}).filter(([, v]) => v)),
  }

  const contactItems = [
    settings?.phone && {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.56 2 2 0 0 1 3.6 1.37h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.15 6.15l1.96-1.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      label: 'Telefon',
      value: settings.phone,
      href: `tel:${settings.phone}`,
    },
    settings?.email && {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      label: 'E-post',
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    settings?.address && {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      label: 'Adress',
      value: settings.address,
      href: settings.mapsUrl ?? null,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string; href: string | null }[]

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

      <section className="section">
        <div className="container mx-auto px-6 max-w-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact info */}
            <AnimatedSection direction="left" className="lg:col-span-2 flex flex-col gap-8">
              <div>
                <h2 className="font-heading text-2xl font-semibold mb-6">
                  {text(page?.contactInfoTitle, defaults.contactInfoTitle)}
                </h2>

                {contactItems.length > 0 ? (
                  <div className="space-y-5">
                    {contactItems.map((item) => (
                      <div key={item.label} className="flex items-start gap-4">
                        <span className="mt-0.5 p-2.5 rounded-full shrink-0"
                          style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}>
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-xs font-semibold tracking-widest uppercase mb-1"
                            style={{ color: 'var(--color-text-muted)' }}>
                            {item.label}
                          </p>
                          {item.href ? (
                            <a
                              href={item.href}
                              {...(item.href.startsWith('http')
                                ? { target: '_blank', rel: 'noopener noreferrer' }
                                : {})}
                              className="text-sm leading-relaxed hover:text-primary transition-colors whitespace-pre-line"
                            >
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-line">{item.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Kontaktuppgifter läggs till via CMS-studion på /studio.
                  </p>
                )}
              </div>

              {settings?.openingHours && (
                <div>
                  <h3 className="font-heading text-lg font-semibold mb-3">
                    {text(page?.openingHoursTitle, defaults.openingHoursTitle)}
                  </h3>
                  <p className="text-sm leading-loose whitespace-pre-line" style={{ color: 'var(--color-text-muted)' }}>
                    {settings.openingHours}
                  </p>
                </div>
              )}

              <div className="p-5 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                <p className="font-heading text-base font-semibold mb-2">
                  {text(page?.freeConsultationTitle, defaults.freeConsultationTitle)}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {text(page?.freeConsultationText, defaults.freeConsultationText)}
                </p>
              </div>
            </AnimatedSection>

            {/* Form */}
            <AnimatedSection direction="right" className="lg:col-span-3">
              <h2 className="font-heading text-2xl font-semibold mb-6">
                {text(page?.formTitle, defaults.formTitle)}
              </h2>
              {/* ContactForm reads ?amne= to prefill the subject, so it needs a
                  Suspense boundary to keep this page statically rendered. */}
              <Suspense fallback={<div className="h-[520px]" />}>
                <ContactForm />
              </Suspense>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
