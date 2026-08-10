'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'

const schema = z.object({
  name: z.string().min(2, 'Ange ditt namn'),
  email: z.string().email('Ange en giltig e-postadress'),
  phone: z.string().optional(),
  quantity: z.string().min(1, 'Ange antal'),
  message: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface OrderFormProps {
  productName: string
  productSlug: string
}

export default function OrderForm({ productName }: OrderFormProps) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setStatus('sending')
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, productName }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="card p-6 md:p-8">
      <h2 className="font-heading text-2xl font-semibold mb-1">Beställ {productName}</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        Fyll i formuläret så återkommer vi med bekräftelse och faktura.
      </p>

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8 text-center"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--color-accent)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="font-heading text-xl font-semibold mb-2">Tack för din beställning!</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Vi har tagit emot din förfrågan och återkommer inom kort.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="btn-outline mt-6"
            >
              Skicka en till
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Namn *</label>
                <input {...register('name')} placeholder="För- och efternamn" className="input" />
                {errors.name && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">E-postadress *</label>
                <input {...register('email')} type="email" placeholder="din@email.se" className="input" />
                {errors.email && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Telefon</label>
                <input {...register('phone')} type="tel" placeholder="070 — xxx xx xx" className="input" />
              </div>

              <div>
                <label className="label">Antal / Mängd *</label>
                <input {...register('quantity')} placeholder='T.ex. "3 st" eller "2 säckar"' className="input" />
                {errors.quantity && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.quantity.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Meddelande</label>
              <textarea
                {...register('message')}
                rows={4}
                placeholder="Övriga önskemål, leveransadress eller frågor..."
                className="input resize-none"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm" style={{ color: 'var(--color-error)' }}>
                Något gick fel. Försök igen eller kontakta oss direkt.
              </p>
            )}

            <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
              {status === 'sending' ? 'Skickar...' : 'Skicka beställning'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
