import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(60).optional(),
  message: z.string().max(4000).optional(),
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        slug: z.string().max(200),
        quantity: z.number().int().min(1).max(99),
        price: z.number().optional(),
        unit: z.string().max(40).optional(),
      })
    )
    .min(1)
    .max(50),
})

// Form input is interpolated into the email body — escape it so a submission
// can't inject markup into the inbox. Same helper as /api/contact and /api/send.
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

    // The basket is a client-side snapshot, so these prices are whatever the
    // catalogue said when the customer added the item. Totalled here only as a
    // reading aid — the quote that goes back out is priced by hand.
    const total = data.items.reduce(
      (sum, item) => sum + (item.price != null ? item.price * item.quantity : 0),
      0
    )
    const anyPriced = data.items.some((item) => item.price != null)

    const cell = 'padding: 10px 0; border-bottom: 1px solid #C7D1D6;'
    const itemRows = data.items
      .map(
        (item) => `
            <tr>
              <td style="${cell} font-weight: 600;">${esc(item.name)}</td>
              <td style="${cell} color: #566A79; white-space: nowrap;">${item.quantity} ${esc(item.unit || 'st')}</td>
              <td style="${cell} color: #566A79; white-space: nowrap; text-align: right;">${
                item.price != null
                  ? `${(item.price * item.quantity).toLocaleString('sv-SE')} kr`
                  : 'Pris på förfrågan'
              }</td>
            </tr>`
      )
      .join('')

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'bestallning@navolt.se',
      to: process.env.CONTACT_EMAIL || 'info@navolt.se',
      subject: `Ny offertförfrågan från ${data.name}`,
      replyTo: data.email,
      html: `
        <div style="font-family: sans-serif; max-width: 640px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #12304A; margin-bottom: 4px;">Ny offertförfrågan</h2>
          <p style="color: #566A79; margin-top: 0; margin-bottom: 24px;">via navolt.se</p>

          <h3 style="color: #12304A; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Produkter</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid #12304A; color: #566A79; font-size: 12px;">Produkt</th>
                <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid #12304A; color: #566A79; font-size: 12px;">Antal</th>
                <th style="text-align: right; padding: 8px 0; border-bottom: 2px solid #12304A; color: #566A79; font-size: 12px;">Cirkapris</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
          ${
            anyPriced
              ? `<p style="text-align: right; margin: 0 0 24px; font-weight: 600; color: #12304A;">
                   Summa cirkapris: ${total.toLocaleString('sv-SE')} kr
                 </p>
                 <p style="margin: -16px 0 24px; font-size: 12px; color: #566A79; text-align: right;">
                   Priser från katalogen när kunden lade varorna i korgen.
                 </p>`
              : '<div style="margin-bottom: 24px;"></div>'
          }

          <h3 style="color: #12304A; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Kunduppgifter</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="${cell} color: #566A79; width: 140px;">Namn</td>
              <td style="${cell}">${esc(data.name)}</td>
            </tr>
            <tr>
              <td style="${cell} color: #566A79;">E-post</td>
              <td style="${cell}"><a href="mailto:${esc(data.email)}" style="color: #12304A;">${esc(data.email)}</a></td>
            </tr>
            ${
              data.phone
                ? `<tr>
                     <td style="${cell} color: #566A79;">Telefon</td>
                     <td style="${cell}">${esc(data.phone)}</td>
                   </tr>`
                : ''
            }
            ${
              data.message
                ? `<tr>
                     <td style="padding: 10px 0; color: #566A79; vertical-align: top;">Meddelande</td>
                     <td style="padding: 10px 0; white-space: pre-wrap;">${esc(data.message)}</td>
                   </tr>`
                : ''
            }
          </table>

          <p style="margin-top: 24px; font-size: 12px; color: #566A79;">
            Svara direkt på detta e-postmeddelande för att kontakta kunden.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ogiltiga formuläruppgifter' }, { status: 400 })
    }
    console.error('offert route error:', error)
    return NextResponse.json({ error: 'Internt serverfel' }, { status: 500 })
  }
}
