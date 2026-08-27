'use client'
import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SUBJECTS,
  FIELDS_BY_SUBJECT,
  visibleFields,
  CONDITIONAL_KEYS,
  ACCEPTED_EXTENSIONS,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  isSubject,
  isAcceptedFile,
  formatBytes,
  prefillFromParam,
  type ContactField,
} from '@/lib/contactForm'

const schema = z.object({
  name: z.string().min(2, 'Ange ditt namn'),
  email: z.string().email('Ange en giltig e-postadress'),
  phone: z.string().min(6, 'Ange ditt telefonnummer'),
  // The `: boolean` is load-bearing. `isSubject` is a type guard, and TypeScript
  // infers a predicate for any arrow that just forwards to one — which sends
  // .refine() down its narrowing overload, so the schema's output type becomes
  // Subject while the form's value is still a plain string (empty until the
  // visitor picks). Annotating the return keeps the check and drops the
  // narrowing; `isSubject` is used directly where a narrowed type is wanted.
  subject: z.string().refine((v): boolean => isSubject(v), 'Välj vad din förfrågan gäller'),
  message: z.string().min(10, 'Meddelandet är för kort'),
  // Every follow-up question is optional: which ones are even on screen depends
  // on the subject, and none of them is worth blocking a submit over.
  boatHelp: z.string().optional(),
  boatModel: z.string().optional(),
  boatLocation: z.string().optional(),
  boatPlacement: z.string().optional(),
  windowRequest: z.string().optional(),
  windowMould: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleLocation: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Prefilled by the "Fråga om …" buttons on /tjanster, which link here as
  // /kontakt?amne=Motorservice. Anything that isn't one of the five subjects
  // leaves the select unchosen rather than inventing an option.
  const searchParams = useSearchParams()
  const prefill = prefillFromParam((searchParams.get('amne') ?? '').slice(0, 100))

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { subject: prefill.subject, boatHelp: prefill.boatHelp ?? '' },
  })

  const subject = watch('subject')
  // Watched so a question gated behind another answer appears the moment that
  // answer is picked. `watch()` with no argument re-renders on every keystroke,
  // so only the keys something is actually gated on are subscribed to.
  const windowRequest = watch('windowRequest')
  const conditionalFields = isSubject(subject)
    ? visibleFields(subject, { windowRequest })
    : []

  // A question that has been answered and then hidden again — Ja, answered, then
  // back to Nej — must not keep its answer. The submit already drops it, but
  // leaving it in form state means it silently reappears if the visitor flips
  // back, which reads as the form having answered for them.
  useEffect(() => {
    if (!isSubject(subject)) return
    const shown = visibleFields(subject, { windowRequest })
    for (const field of FIELDS_BY_SUBJECT[subject]) {
      const stillShown = shown.some((visible) => visible.key === field.key)
      if (!stillShown && getValues(field.key)) setValue(field.key, '')
    }
  }, [subject, windowRequest, getValues, setValue])


  /** Adds to the current selection, rejecting the whole batch with one readable
   *  reason rather than silently dropping files. */
  function addFiles(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return
    const next = [...files, ...Array.from(incoming)]

    const bad = next.find((f) => !isAcceptedFile(f))
    if (bad) {
      setFileError(`${bad.name} är inte en tillåten filtyp (${ACCEPTED_EXTENSIONS.join(', ')}).`)
      return
    }
    if (next.length > MAX_FILES) {
      setFileError(`Du kan bifoga högst ${MAX_FILES} filer.`)
      return
    }
    const total = next.reduce((sum, f) => sum + f.size, 0)
    if (total > MAX_TOTAL_BYTES) {
      setFileError(
        `Filerna är tillsammans ${formatBytes(total)} — högst ${formatBytes(MAX_TOTAL_BYTES)} går att bifoga.`
      )
      return
    }

    setFileError(null)
    setFiles(next)
  }

  function removeFile(index: number) {
    setFileError(null)
    setFiles((current) => current.filter((_, i) => i !== index))
  }

  async function onSubmit(data: FormData) {
    setStatus('sending')
    try {
      // Multipart rather than JSON, because of the attachments. The route reads
      // the same field names back off the FormData.
      const payload = new FormData()
      payload.append('name', data.name)
      payload.append('email', data.email)
      payload.append('phone', data.phone)
      payload.append('subject', data.subject)
      payload.append('message', data.message)
      // Only the questions that belong to the chosen subject. Switching subject
      // leaves the old answers in the form state, and they must not ride along.
      for (const field of conditionalFields) {
        const value = data[field.key]
        if (value) payload.append(field.key, value)
      }
      for (const file of files) payload.append('files', file)

      const res = await fetch('/api/contact', { method: 'POST', body: payload })
      if (!res.ok) throw new Error()
      setStatus('success')
      reset()
      setFiles([])
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
          <div>
            <label className="label">För- och efternamn *</label>
            <input {...register('name')} placeholder="Ange namn" className="input" />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="label">E-post *</label>
              <input {...register('email')} type="email" placeholder="Ange e-post" className="input" />
              <FieldError message={errors.email?.message} />
            </div>
            <div>
              <label className="label">Telefonnummer *</label>
              <input {...register('phone')} type="tel" placeholder="070 — xxx xx xx" className="input" />
              <FieldError message={errors.phone?.message} />
            </div>
          </div>

          <div>
            <label className="label">Vad gäller din förfrågan? *</label>
            <select {...register('subject')} className="input select">
              <option value="">Välj ett alternativ</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <FieldError message={errors.subject?.message} />
          </div>

          {/* The follow-up questions. AutoHeight glides everything below them
              — the rest of the form, the page, the footer — instead of letting
              a subject change snap the layout.

              No AnimatePresence around the swap: `mode="wait"` unmounts the old
              set before the new one enters, which collapses the height to 0 and
              back and reads as a squeeze. Swapping the children outright and
              letting the height tween carry the movement is steadier.

              `!mt-0` keeps the form's `space-y-6` from leaving 24px behind while
              this is collapsed; that spacing sits on the inner block instead, so
              it goes away with the content. */}
          <AutoHeight className="!mt-0">
            {conditionalFields.length > 0 && (
              <motion.div
                key={subject}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: 0.05 }}
                className="space-y-6 pt-6"
              >
                {groupRows(conditionalFields).map((row, i) => (
                  <div
                    key={i}
                    className={row.length > 1 ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : undefined}
                  >
                    {row.map((field) =>
                      field.options ? (
                        <fieldset key={field.key}>
                          <legend className="label">{field.label}</legend>
                          <div className="flex flex-wrap gap-x-8 gap-y-2 mt-1">
                            {field.options.map((option) => (
                              <label
                                key={option}
                                className="flex items-center gap-2.5 text-sm cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  value={option}
                                  {...register(field.key)}
                                  className="radio"
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      ) : (
                        <div key={field.key}>
                          <label className="label">{field.label}</label>
                          <input
                            {...register(field.key)}
                            placeholder={field.placeholder}
                            className="input"
                          />
                        </div>
                      )
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AutoHeight>

          <div>
            <label className="label">Meddelande *</label>
            <textarea
              {...register('message')}
              rows={5}
              placeholder="Skriv ditt meddelande…"
              className="input resize-none"
            />
            <FieldError message={errors.message?.message} />
          </div>

          <div>
            <label className="label">Ladda upp fil</label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                addFiles(e.dataTransfer.files)
              }}
              className="rounded-md border border-dashed px-6 py-8 text-center transition-colors"
              style={{
                borderColor: dragging ? 'var(--color-primary)' : 'var(--color-border)',
                background: dragging ? 'var(--color-accent)' : 'transparent',
              }}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium underline underline-offset-2 hover:text-primary transition-colors"
              >
                Välj fil
              </button>{' '}
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                eller släpp här
              </span>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                Bilder eller PDF, högst {MAX_FILES} filer och {formatBytes(MAX_TOTAL_BYTES)} totalt.
              </p>
              {/* Uncontrolled and cleared after every pick, so choosing the same
                  file again after removing it still fires a change event. */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ACCEPTED_EXTENSIONS.join(',')}
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>

            <AutoHeight>
              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <li
                    key={`${file.name}-${i}`}
                    className="flex items-center justify-between gap-4 text-sm rounded-sm border px-3 py-2"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="flex items-center gap-3 shrink-0">
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {formatBytes(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        aria-label={`Ta bort ${file.name}`}
                        className="hover:text-primary transition-colors"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  </li>
                  ))}
                </ul>
              )}
            </AutoHeight>

            <FieldError message={fileError ?? undefined} />
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

/**
 * Animates its own height to whatever its content currently measures, so a
 * child appearing or being swapped moves the page smoothly instead of snapping
 * it. Everything below — the rest of the form, the footer — rides along.
 *
 * Measured in pixels rather than animated to `height: 'auto'`: auto resolves
 * once, when the animation starts, so swapping between two children of
 * different heights would tween towards a stale target. The ResizeObserver
 * keeps the number honest through content swaps, validation messages and
 * reflow at a narrower width.
 */
function AutoHeight({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  // The first measurement lands without a tween — otherwise the block unfolds
  // on page load whenever the content is there from the start.
  const [measured, setMeasured] = useState(false)
  const [resizing, setResizing] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      setHeight(el.offsetHeight)
      setMeasured(true)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <motion.div
      initial={false}
      animate={{ height }}
      transition={measured ? { duration: 0.4, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
      onAnimationStart={() => setResizing(true)}
      onAnimationComplete={() => setResizing(false)}
      // Clipped only while moving. Left hidden, it would crop the focus ring of
      // whichever field sits against the edge.
      style={{ overflow: resizing ? 'hidden' : 'visible' }}
      className={className}
    >
      <div ref={ref}>{children}</div>
    </motion.div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
      {message}
    </p>
  )
}

/**
 * Packs the fields into rows: runs of `half` text fields pair up two-per-row,
 * everything else takes a row of its own. Keeps the two-column layout in the
 * data rather than hard-coding a grid per subject.
 */
function groupRows(fields: ContactField[]): ContactField[][] {
  const rows: ContactField[][] = []
  for (const field of fields) {
    const last = rows[rows.length - 1]
    if (field.half && last?.length === 1 && last[0].half) last.push(field)
    else rows.push([field])
  }
  return rows
}

// Compile-time check that the schema covers every conditional key. If a key is
// added to lib/contactForm.ts and not to the schema above, this stops building.
type _CoversAllKeys = (typeof CONDITIONAL_KEYS)[number] extends keyof FormData ? true : never
const _coversAllKeys: _CoversAllKeys = true
void _coversAllKeys
