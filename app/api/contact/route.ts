import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(1),
})

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

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'kontakt@navolt.se',
      to: process.env.CONTACT_EMAIL || 'info@navolt.se',
      subject: `Kontaktförfrågan: ${data.subject}`,
      replyTo: data.email,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #12304A; margin-bottom: 4px;">Nytt meddelande</h2>
          <p style="color: #566A79; margin-top: 0; margin-bottom: 24px;">via kontaktformuläret på navolt.se</p>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6; color: #566A79; width: 140px;">Namn</td>
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
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6; color: #566A79;">Ämne</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #C7D1D6; font-weight: 600;">${esc(data.subject)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #566A79; vertical-align: top;">Meddelande</td>
              <td style="padding: 10px 0; white-space: pre-wrap;">${esc(data.message)}</td>
            </tr>
          </table>

          <p style="margin-top: 24px; font-size: 12px; color: #566A79;">
            Svara direkt på detta e-postmeddelande för att kontakta avsändaren.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ogiltiga formuläruppgifter' }, { status: 400 })
    }
    console.error('contact route error:', error)
    return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 })
  }
}
