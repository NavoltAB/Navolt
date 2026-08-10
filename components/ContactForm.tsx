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
  subject: z.string().min(2, 'Ange ett ämne'),
  message: z.string().min(10, 'Meddelandet är för kort'),
})

type FormData = z.infer<typeof schema>

export default function ContactForm() {
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <AnimatePresence mode="wait">
      {status === 'success' ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-12 text-center"
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--color-accent)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="font-heading text-2xl font-semibold mb-2">Meddelandet skickat!</p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Vi återkommer till dig inom ett par timmar under vardagar.
          </p>
          <button onClick={() => setStatus('idle')} className="btn-outline mt-6">
            Skicka ett nytt meddelande
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="label">Telefon</label>
              <input {...register('phone')} type="tel" placeholder="070 — xxx xx xx" className="input" />
            </div>
            <div>
              <label className="label">Ämne *</label>
              <input {...register('subject')} placeholder="Vad gäller ditt ärende?" className="input" />
              {errors.subject && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.subject.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Meddelande *</label>
            <textarea
              {...register('message')}
              rows={5}
              placeholder="Berätta mer om vad du önskar hjälp med..."
              className="input resize-none"
            />
            {errors.message && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.message.message}</p>}
          </div>

          {status === 'error' && (
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>
              Något gick fel. Försök igen eller ring oss direkt.
            </p>
          )}

          <button type="submit" disabled={status === 'sending'} className="btn-primary">
            {status === 'sending' ? 'Skickar...' : 'Skicka meddelande'}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
