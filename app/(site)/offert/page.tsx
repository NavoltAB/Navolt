'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'
import { MAX_QTY, missingKits, useCart } from '@/context/CartContext'
import { siteConfig } from '@/config/site'
import { DELIVERY_OPTIONS } from '@/lib/order'

const ease = [0.16, 1, 0.3, 1] as const

const schema = z
  .object({
    name: z.string().trim().min(2, 'Ange ditt namn'),
    email: z.string().trim().email('Ange en giltig e-postadress'),
    phone: z.string().optional(),
    delivery: z.enum(DELIVERY_OPTIONS),
    address: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    message: z.string().optional(),
  })
  // The address is only required for something being shipped. Asking someone
  // collecting in Hälsö for a delivery address is noise, so the fields are both
  // hidden and unvalidated in that case — and no stale address rides along in
  // the email either, because onSubmit strips them.
  .superRefine((data, ctx) => {
    if (data.delivery !== 'Leverans') return
    const demand = (field: 'address' | 'postalCode' | 'country', min: number, message: string) => {
      if ((data[field] ?? '').trim().length < min) {
        ctx.addIssue({ code: 'custom', path: [field], message })
      }
    }
    demand('address', 3, 'Ange leveransadress')
    // Deliberately not a Swedish five-digit pattern — the country is free text,
    // and rejecting a valid Norwegian postcode would be worse than accepting a
    // typo a human reads anyway.
    demand('postalCode', 4, 'Ange postnummer')
    demand('country', 2, 'Ange land')
  })

type FormData = z.infer<typeof schema>

/**
 * The basket, and the form that sends it.
 *
 * Entirely client-side — the basket lives in localStorage, so there is nothing
 * for the server to render and no flash of someone else's cart. `ready` gates
 * the first paint: without it the empty state shows for a frame before
 * localStorage is read, which reads as "we lost your basket".
 */
export default function OffertPage() {
  const { items, ready, addItem, removeItem, setQuantity, clearCart, count } = useCart()

  // A reminder, never a gate. Someone who already owns the kit, or whose varv
  // fits it, still has to be able to send the order — so this never touches the
  // submit button.
  const missing = missingKits(items)
  const reduceMotion = useReducedMotion()
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    // Leverans first so the address block is open by default — most orders ship,
    // and a form that starts collapsed hides what it is going to ask for.
    defaultValues: { delivery: 'Leverans', country: 'Sverige' },
  })

  const delivery = watch('delivery')
  const shipping = delivery === 'Leverans'

  const priced = items.filter((i) => i.price != null)
  const total = priced.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0)

  async function onSubmit(data: FormData) {
    setStatus('sending')
    try {
      const res = await fetch('/api/offert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          // Collected orders carry no address, whatever is still sitting in the
          // form state from before the visitor switched.
          ...(shipping ? {} : { address: undefined, postalCode: undefined, country: undefined }),
          items: items.map(({ slug, name, quantity, price, unit }) => ({
            slug,
            name,
            quantity,
            price,
            unit,
          })),
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      // Cleared only after the send succeeds — a failed request must not eat
      // the basket the customer spent time filling.
      clearCart()
    } catch {
      setStatus('error')
    }
  }

  return (
    <PageTransition>
      <div className="pt-32 pb-16" style={{ background: 'var(--color-surface)' }}>
        <div className="container mx-auto max-w-container px-6">
          <nav
            aria-label="Brödsmulor"
            className="mb-8 flex items-center gap-2 text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Link href="/produkter" className="transition-colors hover:text-primary">
              Produkter
            </Link>
            <span aria-hidden className="opacity-50">/</span>
            <span style={{ color: 'var(--color-text)' }}>Varukorg</span>
          </nav>

          <p className="section-label mb-3">Din beställning</p>
          <h1 className="section-title mb-4">Varukorg</h1>
          <p className="section-subtitle">
            Gå igenom delarna, fyll i dina uppgifter och skicka. Du får en bekräftelse med
            pris, frakt och leveranstid tillbaka — ingenting skickas innan du sagt ja.
          </p>
        </div>
      </div>

      <section className="section pt-14">
        <div className="container mx-auto max-w-container px-6">
          <AnimatePresence mode="wait" initial={false}>
            {!ready ? (
              // Reserves height while localStorage resolves, so the page doesn't
              // lurch a frame later.
              <div key="loading" className="min-h-[40vh]" aria-hidden />
            ) : status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease }}
                className="mx-auto max-w-lg text-center"
              >
                <motion.span
                  className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: 'rgba(192,138,62,0.14)', color: 'var(--color-gold-ink)' }}
                  initial={reduceMotion ? false : { scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 22 }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <motion.polyline
                      points="20 6 9 17 4 12"
                      initial={reduceMotion ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, ease, delay: 0.15 }}
                    />
                  </svg>
                </motion.span>
                <h2 className="section-title mb-4">Tack — vi har din beställning</h2>
                <p className="section-subtitle mx-auto mb-8">
                  Vi läser igenom den och återkommer med en bekräftelse, oftast inom en arbetsdag.
                  Är det bråttom är det snabbaste att ringa.
                </p>
                <Link href="/produkter" className="btn-primary">
                  Tillbaka till produkterna
                </Link>
              </motion.div>
            ) : items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease }}
                className="flex flex-col items-start rounded-lg border border-dashed px-8 py-16"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span
                  aria-hidden
                  className="mb-5 block h-px w-12"
                  style={{ background: 'var(--color-gold)' }}
                />
                <p className="font-heading text-2xl font-semibold">Korgen är tom</p>
                <p className="mt-3 max-w-md" style={{ color: 'var(--color-text-muted)' }}>
                  Lägg till delarna du är intresserad av, så samlar vi ihop dem till en
                  beställning. Vet du redan vad du behöver går det lika bra att höra av sig direkt.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/produkter" className="btn-primary">
                    Se produkterna
                  </Link>
                  <Link href="/kontakt" className="btn-outline">
                    Kontakta oss
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="basket"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease }}
                className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-14"
              >
                {/* ── Rows ─────────────────────────────────── */}
                <div>
                  {missing.length > 0 && (
                    <div
                      className="mb-6 rounded-[var(--radius-md)] p-5"
                      style={{
                        background: 'rgba(192,138,62,0.08)',
                        border: '1px solid rgba(192,138,62,0.32)',
                      }}
                    >
                      <p className="font-heading font-semibold">
                        {missing.length === 1
                          ? 'Ett monteringspaket saknas'
                          : `${missing.length} monteringspaket saknas`}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Rutorna i korgen kräver varsitt monteringspaket för att kunna monteras.
                        Har du redan ett kan du strunta i den här rutan.
                      </p>

                      <ul className="mt-4 space-y-2.5">
                        {missing.map((row) => {
                          const short = row.needed - row.inCart
                          return (
                            <li
                              key={row.kit.slug}
                              className="flex flex-wrap items-center justify-between gap-3"
                            >
                              <Link
                                href={`/produkter/${row.kit.slug}`}
                                className="min-w-0 flex-1 text-sm font-medium underline underline-offset-4 transition-colors hover:text-[var(--color-gold-ink)]"
                                style={{ color: 'var(--color-primary)' }}
                              >
                                {row.kit.name}
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  addItem({
                                    slug: row.kit.slug,
                                    name: row.kit.name,
                                    quantity: short,
                                    price: row.kit.price,
                                    unit: row.kit.unit,
                                    image: row.kit.image,
                                  })
                                }
                                className="btn-gold shrink-0 !px-4 !py-2 text-sm"
                              >
                                Lägg till {short} st
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  <div className="card">
                    <AnimatePresence initial={false} mode="popLayout">
                      {items.map((item) => (
                        <motion.div
                          key={item.slug}
                          layout={!reduceMotion}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={
                            reduceMotion
                              ? { opacity: 0 }
                              : { opacity: 0, x: -24, transition: { duration: 0.28, ease: 'easeOut' } }
                          }
                          transition={{ duration: 0.45, ease }}
                          className="flex items-center gap-4 p-4 sm:gap-5 sm:p-5"
                          style={{ borderBottom: '1px solid var(--color-border)' }}
                        >
                          <Link
                            href={`/produkter/${item.slug}`}
                            className="relative h-16 w-16 shrink-0 overflow-hidden sm:h-20 sm:w-20"
                            style={{
                              background: 'var(--color-bg)',
                              borderRadius: 'var(--radius-sm)',
                            }}
                          >
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            ) : (
                              <span
                                className="flex h-full w-full items-center justify-center font-heading text-xl font-semibold"
                                style={{ color: 'var(--color-border)' }}
                              >
                                {item.name.charAt(0)}
                              </span>
                            )}
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/produkter/${item.slug}`}
                              className="font-heading font-semibold leading-snug transition-colors hover:text-[var(--color-gold-ink)]"
                              style={{ color: 'var(--color-primary)' }}
                            >
                              {item.name}
                            </Link>
                            <p
                              className="mt-1 text-sm tabular-nums"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              {item.price != null
                                ? `${item.price.toLocaleString('sv-SE')} kr${
                                    item.unit ? ` / ${item.unit}` : ''
                                  }`
                                : 'Pris på förfrågan'}
                            </p>
                          </div>

                          <div
                            className="flex shrink-0 items-center gap-0.5"
                            style={{
                              border: '1px solid var(--color-border)',
                              borderRadius: '100px',
                              padding: '2px',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setQuantity(item.slug, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label={`Minska antal ${item.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-base leading-none transition-colors duration-200 disabled:opacity-30 enabled:hover:bg-[rgba(18,48,74,0.06)]"
                              style={{ color: 'var(--color-primary)' }}
                            >
                              −
                            </button>
                            <span
                              className="w-7 text-center font-heading text-sm font-semibold tabular-nums"
                              style={{ color: 'var(--color-primary)' }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity(item.slug, item.quantity + 1)}
                              disabled={item.quantity >= MAX_QTY}
                              aria-label={`Öka antal ${item.name}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-base leading-none transition-colors duration-200 disabled:opacity-30 enabled:hover:bg-[rgba(18,48,74,0.06)]"
                              style={{ color: 'var(--color-primary)' }}
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.slug)}
                            aria-label={`Ta bort ${item.name}`}
                            className="shrink-0 rounded-full p-2 transition-colors duration-200 hover:bg-[rgba(176,58,46,0.08)]"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <div
                      className="flex items-center justify-between gap-4 p-4 sm:p-5"
                      style={{ background: 'var(--color-bg)' }}
                    >
                      <span
                        className="text-sm tabular-nums"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {count} {count === 1 ? 'artikel' : 'artiklar'}
                      </span>
                      <Link
                        href="/produkter"
                        className="text-sm font-medium underline underline-offset-4 transition-colors hover:text-[var(--color-gold-ink)]"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Lägg till fler
                      </Link>
                    </div>
                  </div>

                  {priced.length > 0 && (
                    <div
                      className="mt-6 flex items-baseline justify-between gap-4 pt-5"
                      style={{ borderTop: '2px solid var(--color-primary)' }}
                    >
                      <div>
                        <p className="font-heading text-lg font-semibold">Pris</p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {priced.length < items.length
                            ? 'Exklusive delar med pris på förfrågan. Frakt tillkommer.'
                            : 'Exklusive frakt. Slutpriset bekräftas innan vi skickar.'}
                        </p>
                      </div>
                      <p
                        className="font-heading font-semibold tabular-nums"
                        style={{ fontSize: 'var(--text-2xl)', color: 'var(--color-primary)' }}
                      >
                        {total.toLocaleString('sv-SE')} kr
                      </p>
                    </div>
                  )}
                </div>

                {/* ── Form ─────────────────────────────────── */}
                {/* The stretched grid item is this outer div; the card sticks
                    inside it. `sticky` on the grid item itself would stretch the
                    card to the full height of the basket list beside it. */}
                <div>
                  <div className="card p-6 md:p-7 lg:sticky lg:top-32">
                    <h2 className="font-heading text-xl font-semibold">Dina uppgifter</h2>
                    <p className="mb-6 mt-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      Berätta gärna vilken båt eller bil det gäller — det gör beställningen
                      träffsäkrare.
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                      <div>
                        <label htmlFor="offert-name" className="label">Namn *</label>
                        <input
                          id="offert-name"
                          {...register('name')}
                          placeholder="För- och efternamn"
                          autoComplete="name"
                          className="input"
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="offert-email" className="label">E-postadress *</label>
                        <input
                          id="offert-email"
                          {...register('email')}
                          type="email"
                          placeholder="din@email.se"
                          autoComplete="email"
                          className="input"
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="offert-phone" className="label">Telefon</label>
                        <input
                          id="offert-phone"
                          {...register('phone')}
                          type="tel"
                          placeholder="070 — xxx xx xx"
                          autoComplete="tel"
                          className="input"
                        />
                      </div>

                      <fieldset>
                        <legend className="label">Leveranssätt *</legend>
                        <div className="mt-1 flex flex-wrap gap-x-8 gap-y-2">
                          {DELIVERY_OPTIONS.map((option) => (
                            <label
                              key={option}
                              className="flex cursor-pointer items-center gap-2.5 text-sm"
                            >
                              <input
                                type="radio"
                                value={option}
                                {...register('delivery')}
                                className="radio"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </fieldset>

                      {/* Height-animated rather than toggled outright, so the
                          card doesn't snap open and shut under the cursor when
                          the visitor switches between the two. */}
                      <AnimatePresence initial={false} mode="wait">
                        {shipping ? (
                          <motion.div
                            key="address"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: reduceMotion ? 0 : 0.35, ease }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-4 pt-1">
                              <div>
                                <label htmlFor="offert-address" className="label">Adress *</label>
                                <input
                                  id="offert-address"
                                  {...register('address')}
                                  placeholder="Gatuadress"
                                  autoComplete="street-address"
                                  className="input"
                                />
                                {errors.address && (
                                  <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>
                                    {errors.address.message}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                  <label htmlFor="offert-postal" className="label">Postnummer *</label>
                                  <input
                                    id="offert-postal"
                                    {...register('postalCode')}
                                    placeholder="475 50"
                                    inputMode="numeric"
                                    autoComplete="postal-code"
                                    className="input"
                                  />
                                  {errors.postalCode && (
                                    <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>
                                      {errors.postalCode.message}
                                    </p>
                                  )}
                                </div>

                                <div>
                                  <label htmlFor="offert-country" className="label">Land *</label>
                                  <input
                                    id="offert-country"
                                    {...register('country')}
                                    placeholder="Sverige"
                                    autoComplete="country-name"
                                    className="input"
                                  />
                                  {errors.country && (
                                    <p className="mt-1 text-xs" style={{ color: 'var(--color-error)' }}>
                                      {errors.country.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.p
                            key="pickup"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: reduceMotion ? 0 : 0.35, ease }}
                            className="overflow-hidden text-sm leading-relaxed"
                            style={{ color: 'var(--color-text-muted)' }}
                          >
                            Du hämtar hos oss på{' '}
                            {siteConfig.contact.address.split('\n').join(', ')}. Vi hör av
                            oss när beställningen är klar att hämta.
                          </motion.p>
                        )}
                      </AnimatePresence>

                      <div>
                        <label htmlFor="offert-message" className="label">Meddelande</label>
                        <textarea
                          id="offert-message"
                          {...register('message')}
                          rows={4}
                          placeholder="Båtmodell, vad som ska installeras, leveransadress…"
                          className="input resize-none"
                        />
                      </div>

                      {status === 'error' && (
                        <motion.p
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm"
                          style={{ color: 'var(--color-error)' }}
                        >
                          Något gick fel — din korg är kvar. Försök igen, eller ring oss.
                        </motion.p>
                      )}

                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="btn-gold mt-1 w-full"
                      >
                        {status === 'sending' ? 'Skickar…' : 'Skicka beställning'}
                      </button>

                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        Beställningen är inte bindande förrän vi bekräftat den. Vi hör av oss med
                        pris, frakt och leveranstid innan något skickas.
                      </p>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageTransition>
  )
}
