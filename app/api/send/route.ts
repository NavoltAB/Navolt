import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().optional(),
  quantity: z.string().trim().min(1),
  message: z.string().optional(),
  productName: z.string().trim().min(1),
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    // Without a key there is nothing to send with. Caught here so the log says
    // which piece of configuration is missing, instead of the SDK throwing a
    // generic error further down and surfacing as "Internt serverfel".
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('send route: RESEND_API_KEY is not set — nothing was sent')
      return NextResponse.json({ error: 'E-post är inte konfigurerad' }, { status: 503 })
    }

    const resend = new Resend(apiKey)
    const { error: sendError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'bestallning@navolt.se',
      to: process.env.CONTACT_EMAIL || 'info@navolt.se',
      subject: `[Beställning] ${oneLine(data.productName)} ×${oneLine(data.quantity)} – ${oneLine(data.name)}`,
      replyTo: data.email,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #12304A; margin-bottom: 4px;">Ny beställning</h2>
          <p style="color: #566A79; margin-top: 0; margin-bottom: 24px;">via navolt.se</p>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6; color: #566A79; width: 140px;">Produkt</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6; font-weight: 600;">${esc(data.productName)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6; color: #566A79;">Antal / mängd</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6;">${esc(data.quantity)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6; color: #566A79;">Kund</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6;">${esc(data.name)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6; color: #566A79;">E-post</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6;">
                <a href="mailto:${esc(data.email)}" style="color: #12304A;">${esc(data.email)}</a>
              </td>
            </tr>
            ${data.phone ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6; color: #566A79;">Telefon</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6;">${esc(data.phone)}</td>
            </tr>` : ''}
            ${data.message ? `
            <tr>
              <td style="padding: 10px 0; color: #566A79; vertical-align: top;">Meddelande</td>
              <td style="padding: 10px 0; white-space: pre-wrap;">${esc(data.message)}</td>
            </tr>` : ''}
          </table>

          <p style="margin-top: 24px; font-size: 12px; color: #566A79;">
            Svara direkt på detta e-postmeddelande för att kontakta kunden.
          </p>
        </div>
      `,
    })

    // resend.emails.send resolves with { data, error } rather than throwing, so
    // a rejected send (unverified sending domain, bad recipient, quota) lands
    // here looking like success. Without this check the visitor gets a thank-you
    // for a message that never arrived.
    if (sendError) {
      console.error('send route: Resend rejected the send:', sendError)
      return NextResponse.json({ error: 'Kunde inte skicka meddelandet' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ogiltiga formuläruppgifter' }, { status: 400 })
    }
    console.error('send route error:', error)
    return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 })
  }
}
