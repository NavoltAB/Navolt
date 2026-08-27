import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  visibleFields,
  SUBJECTS,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  isAcceptedFile,
  formatBytes,
} from '@/lib/contactForm'

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(1).max(60),
  // An enum, not free text: the form offers five options and the follow-up
  // questions are keyed off the answer, so anything else has no meaning here.
  subject: z.enum(SUBJECTS),
  message: z.string().min(1).max(4000),
  boatHelp: z.string().max(120).optional(),
  boatModel: z.string().max(200).optional(),
  boatLocation: z.string().max(200).optional(),
  boatPlacement: z.string().max(120).optional(),
  windowRequest: z.string().max(120).optional(),
  windowMould: z.string().max(120).optional(),
  vehicleModel: z.string().max(200).optional(),
  vehicleLocation: z.string().max(200).optional(),
})

// Subject lines are read at a glance in a shared inbox, so they all take the
// same shape: a bracketed type, the thing it's about, then who sent it. The
// bracket is what makes them sort and filter cleanly — "Ny beställning" and
// "Ny offertförfrågan" used to interleave under N.
//
// Values going into a header get flattened first: a subject is a single line,
// and anything the visitor typed may not be.
function oneLine(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

// Form input is interpolated into the email body — escape it so a submission
// can't inject markup into the inbox.
function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// A filename arrives from the client and ends up as an attachment name in a
// mail client. Strip anything that could read as a path or a control character,
// and keep it short enough not to break the header.
function safeFilename(name: string) {
  const cleaned = name
    .replace(/[\\/]/g, '-')
    .replace(/[\x00-\x1f\x7f]/g, '')
    .trim()
  return (cleaned || 'bilaga').slice(0, 120)
}

const CELL = 'padding: 10px 0; border-bottom: 1px solid #C7D1D6;'
const KEY_CELL = `${CELL} color: #566A79; width: 160px; vertical-align: top;`

function row(label: string, value: string) {
  return `<tr><td style="${KEY_CELL}">${esc(label)}</td><td style="${CELL}">${value}</td></tr>`
}

export async function POST(req: NextRequest) {
  try {
    // Multipart, because the form can carry attachments. Text fields come back
    // as strings; empty ones are dropped so zod's `.optional()` sees undefined
    // rather than "".
    const form = await req.formData()
    const fields: Record<string, string> = {}
    for (const [key, value] of form.entries()) {
      if (typeof value === 'string' && value.trim() !== '') fields[key] = value.trim()
    }
    const data = schema.parse(fields)

    const files = form
      .getAll('files')
      .filter((entry): entry is File => entry instanceof File && entry.size > 0)

    // Re-checked here, not just in the form: the route is reachable directly.
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: 'För många bifogade filer' }, { status: 400 })
    }
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0)
    if (totalBytes > MAX_TOTAL_BYTES) {
      return NextResponse.json({ error: 'De bifogade filerna är för stora' }, { status: 413 })
    }
    if (files.some((f) => !isAcceptedFile(f))) {
      return NextResponse.json({ error: 'Otillåten filtyp' }, { status: 400 })
    }

    // Without a key there is nothing to send with. Caught here so the log says
    // which piece of configuration is missing, instead of the SDK throwing a
    // generic error further down and surfacing as "Internt serverfel".
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('contact route: RESEND_API_KEY is not set — nothing was sent')
      return NextResponse.json({ error: 'E-post är inte konfigurerad' }, { status: 503 })
    }

    // Only the follow-up questions that belong to the chosen subject, in the
    // order they were asked, and only the ones actually answered. Driving this
    // off the shared map is what keeps the email's labels identical to the
    // form's — and what stops a hand-crafted POST attaching "Båtmodell" to an
    // enquiry about a husbil.
    const detailRows = visibleFields(data.subject, data)
      .map((field) => {
        const value = data[field.key]
        return value ? row(field.label, esc(value)) : ''
      })
      .join('')

    const attachments = await Promise.all(
      files.map(async (file) => ({
        filename: safeFilename(file.name),
        content: Buffer.from(await file.arrayBuffer()),
      }))
    )

    const resend = new Resend(apiKey)
    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'kontakt@navolt.se',
      to: process.env.CONTACT_EMAIL || 'info@navolt.se',
      subject: `[Fråga] ${data.subject} – ${oneLine(data.name)}`,
      replyTo: data.email,
      ...(attachments.length > 0 ? { attachments } : {}),
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #12304A; margin-bottom: 4px;">Nytt meddelande</h2>
          <p style="color: #566A79; margin-top: 0; margin-bottom: 24px;">via kontaktformuläret på navolt.se</p>

          <table style="width: 100%; border-collapse: collapse;">
            ${row('Namn', esc(data.name))}
            ${row('E-post', `<a href="mailto:${esc(data.email)}" style="color: #12304A;">${esc(data.email)}</a>`)}
            ${row('Telefon', `<a href="tel:${esc(data.phone)}" style="color: #12304A;">${esc(data.phone)}</a>`)}
            ${row('Förfrågan gäller', `<strong>${esc(data.subject)}</strong>`)}
            ${detailRows}
            ${row('Meddelande', `<span style="white-space: pre-wrap;">${esc(data.message)}</span>`)}
            ${
              attachments.length > 0
                ? row(
                    'Bifogade filer',
                    attachments
                      .map((a, i) => `${esc(a.filename)} (${formatBytes(files[i].size)})`)
                      .join('<br>')
                  )
                : ''
            }
          </table>

          <p style="margin-top: 24px; font-size: 12px; color: #566A79;">
            Svara direkt på detta e-postmeddelande för att kontakta avsändaren.
          </p>
        </div>
      `,
    })

    // resend.emails.send resolves with { data, error } rather than throwing, so
    // a rejected send (unverified sending domain, bad recipient, quota) lands
    // here looking like success. Without this check the visitor gets a thank-you
    // for a message that never arrived.
    if (sendError) {
      console.error('contact route: Resend rejected the send:', sendError)
      return NextResponse.json({ error: 'Kunde inte skicka meddelandet' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ogiltiga formuläruppgifter' }, { status: 400 })
    }
    console.error('contact route error:', error)
    return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 })
  }
}
