import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

type BookingPayload = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  propertyType?: string
  preferredDate?: string
  notes?: string
  hearAbout?: string
  services: { name: string; price: number }[]
  total: number
  carePlan: string | null
}

export async function POST(req: NextRequest) {
  let payload: BookingPayload

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { firstName, lastName, email, phone, address, propertyType, preferredDate, notes, hearAbout, services, total, carePlan } = payload

  if (!firstName || !lastName || !email || !phone || !address) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const serviceLines = services
    .map(s => `<tr><td style="padding:6px 12px;border-bottom:1px solid #ede8e0">${s.name}</td><td style="padding:6px 12px;border-bottom:1px solid #ede8e0;color:#b89b6e;font-weight:bold">From $${s.price.toLocaleString()}</td></tr>`)
    .join('')

  const formattedDate = preferredDate
    ? new Date(preferredDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not specified'

  const carePlanLabel = carePlan
    ? `Ament ${carePlan.charAt(0).toUpperCase() + carePlan.slice(1)} Care Plan`
    : 'None selected'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:'Lato',Arial,sans-serif;background:#f7f3ed;margin:0;padding:0;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(30,45,71,0.12);">

    <div style="background:#1e2d47;padding:28px 32px;text-align:center;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;color:#fff;letter-spacing:2px;">AMENT</div>
      <div style="font-size:12px;color:#d4b98a;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Home &amp; Tech Services</div>
      <div style="margin-top:16px;font-size:18px;color:#d4b98a;font-weight:600;">📋 New Booking Request</div>
    </div>

    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr style="background:#f7f3ed;">
          <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a;width:40%">Name</td>
          <td style="padding:8px 12px;color:#1a1a2e">${firstName} ${lastName}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Email</td>
          <td style="padding:8px 12px;color:#1e2d47"><a href="mailto:${email}" style="color:#1e2d47">${email}</a></td>
        </tr>
        <tr style="background:#f7f3ed;">
          <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Phone</td>
          <td style="padding:8px 12px;color:#1a1a2e"><a href="tel:${phone}" style="color:#1e2d47">${phone}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Address</td>
          <td style="padding:8px 12px;color:#1a1a2e">${address}</td>
        </tr>
        ${propertyType ? `<tr style="background:#f7f3ed;"><td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Property Type</td><td style="padding:8px 12px;color:#1a1a2e">${propertyType}</td></tr>` : ''}
        <tr${propertyType ? '' : ' style="background:#f7f3ed;"'}>
          <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Preferred Date</td>
          <td style="padding:8px 12px;color:#1a1a2e">${formattedDate}</td>
        </tr>
        <tr style="background:#f7f3ed;">
          <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Care Plan</td>
          <td style="padding:8px 12px;color:#1a1a2e">${carePlanLabel}</td>
        </tr>
        ${hearAbout ? `<tr><td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Heard About Us</td><td style="padding:8px 12px;color:#1a1a2e">${hearAbout}</td></tr>` : ''}
        ${notes ? `<tr style="background:#f7f3ed;"><td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a;vertical-align:top">Notes</td><td style="padding:8px 12px;color:#1a1a2e">${notes.replace(/\n/g, '<br>')}</td></tr>` : ''}
      </table>

      <div style="background:#1e2d47;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <div style="font-family:'Playfair Display',Georgia,serif;font-size:16px;font-weight:600;color:#fff;margin-bottom:12px;">Selected Services</div>
        <table style="width:100%;border-collapse:collapse;color:#fff;">
          ${serviceLines}
          <tr>
            <td style="padding:10px 12px;font-weight:700;color:#d4b98a">Estimated Starting Total</td>
            <td style="padding:10px 12px;font-weight:700;color:#d4b98a;font-size:18px">From $${total.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px;color:#7a7a8a;line-height:1.6;">
        Reply directly to this email or call <a href="tel:${phone}" style="color:#b89b6e">${phone}</a> to confirm the appointment.
      </p>
    </div>

    <div style="background:#f7f3ed;padding:16px 32px;text-align:center;font-size:12px;color:#7a7a8a;">
      Ament Home &amp; Tech Services · Greater St. Augustine, FL · <a href="tel:+14079208035" style="color:#b89b6e">(407) 920-8035</a>
    </div>
  </div>
</body>
</html>
`

  // Also send a confirmation email to the customer
  const customerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:'Lato',Arial,sans-serif;background:#f7f3ed;margin:0;padding:0;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(30,45,71,0.12);">
    <div style="background:#1e2d47;padding:28px 32px;text-align:center;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;color:#fff;letter-spacing:2px;">AMENT</div>
      <div style="font-size:12px;color:#d4b98a;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Home &amp; Tech Services</div>
    </div>
    <div style="padding:32px;">
      <div style="font-size:28px;text-align:center;margin-bottom:16px;">✅</div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:26px;color:#1e2d47;text-align:center;margin-bottom:12px;">Request Received!</h1>
      <p style="font-size:15px;color:#4a4a5a;line-height:1.7;text-align:center;margin-bottom:28px;">
        Hi ${firstName}, thanks for booking with Ament Home &amp; Tech Services!<br>
        Sarah will reach out within <strong>24 hours</strong> to confirm your appointment.
      </p>
      <div style="background:#f7f3ed;border-radius:10px;padding:20px 24px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Your Services</p>
        ${services.map(s => `<p style="margin:4px 0;font-size:14px;color:#1a1a2e">• ${s.name}</p>`).join('')}
        <p style="margin:12px 0 0;font-size:14px;font-weight:700;color:#b89b6e">Estimated starting from $${total.toLocaleString()}</p>
      </div>
      <p style="margin-top:24px;font-size:13px;color:#7a7a8a;text-align:center;">
        Questions? Call us at <a href="tel:+14079208035" style="color:#b89b6e">(407) 920-8035</a>
      </p>
    </div>
  </div>
</body>
</html>
`

  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set')
      return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })
    }
    const resend = new Resend(apiKey)
    const recipientEmail = (process.env.BOOKING_RECIPIENT_EMAIL || 'chrisament45@gmail.com').split(',').map(e => e.trim())
    const fromEmail = process.env.BOOKING_FROM_EMAIL || 'onboarding@resend.dev'

    // Send notification to business
    const r1 = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      reply_to: email,
      subject: `New Booking Request — ${firstName} ${lastName} (${services.length} service${services.length !== 1 ? 's' : ''})`,
      html,
    })
    console.log('Business email result:', JSON.stringify(r1))

    // Send confirmation to customer
    const r2 = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Your Ament Service Request — We'll be in touch!",
      html: customerHtml,
    })
    console.log('Customer email result:', JSON.stringify(r2))

    if (r1.error || r2.error) {
      console.error('Resend error:', r1.error || r2.error)
      return NextResponse.json({ error: (r1.error || r2.error)?.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send confirmation email.' }, { status: 500 })
  }
}
