import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

type ApplyPayload = {
  name?: string
  phone?: string
  email?: string
  licenseType?: string
  licenseNumber?: string
  yearsExperience?: string
  currentlyQualifying?: string
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function POST(req: NextRequest) {
  let payload: ApplyPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { name, phone, email, licenseType, licenseNumber, yearsExperience, currentlyQualifying } = payload
  if (!name || !phone || !email || !licenseType || !licenseNumber || !yearsExperience || !currentlyQualifying) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    console.error('RESEND_API_KEY not set')
    return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })
  }

  const resend = new Resend(resendKey)
  const businessEmails = (
    process.env.BUSINESS_NOTIFY_EMAIL ||
    process.env.BOOKING_RECIPIENT_EMAIL ||
    'chrisament45@gmail.com'
  ).split(',').map((e: string) => e.trim())
  const fromEmail = process.env.BOOKING_FROM_EMAIL || 'onboarding@resend.dev'

  const rows: [string, string][] = [
    ['Name', name],
    ['Phone', phone],
    ['Email', email],
    ['License Type', licenseType],
    ['License Number', licenseNumber],
    ['Years of Experience', yearsExperience],
    ['Currently Qualifying Another Business', currentlyQualifying],
  ]

  const rowsHtml = rows
    .map(([label, value], i) => `
      <tr${i % 2 === 0 ? ' style="background:#f7f3ed;"' : ''}>
        <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a;width:42%;vertical-align:top">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;color:#1a1a2e;font-size:14px">${escapeHtml(value)}</td>
      </tr>`)
    .join('')

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:'Lato',Arial,sans-serif;background:#f7f3ed;margin:0;padding:0;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(30,45,71,0.12);">
    <div style="background:#1e2d47;padding:24px 32px;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:#fff;letter-spacing:2px;">AMENT</div>
      <div style="font-size:11px;color:#d4b98a;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Home &amp; Tech Services</div>
      <div style="margin-top:14px;font-size:17px;color:#d4b98a;font-weight:600;">👷 Technician Application — ${escapeHtml(licenseType)} License</div>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        ${rowsHtml}
      </table>
      <p style="font-size:13px;color:#7a7a8a;line-height:1.6;">
        Verify the license on DBPR before calling back:
        <a href="https://www.myfloridalicense.com/wl11.asp" style="color:#b89b6e">myfloridalicense.com license search</a><br>
        Reply to this email, or call/text <a href="tel:${escapeHtml(phone)}" style="color:#b89b6e">${escapeHtml(phone)}</a>.
      </p>
    </div>
    <div style="background:#f7f3ed;padding:14px 32px;text-align:center;font-size:12px;color:#7a7a8a;">
      Ament Home &amp; Tech Services · St. Augustine, FL
    </div>
  </div>
</body>
</html>`

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: businessEmails,
      reply_to: email,
      subject: `Technician Application — ${licenseType} — ${name}`,
      html,
    })
    if (result.error) {
      console.error('Resend error:', result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Application email error:', err)
    return NextResponse.json({ error: 'Failed to send application.' }, { status: 500 })
  }
}
