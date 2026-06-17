import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'

type QuotePayload = {
  category: string
  categoryName: string
  answers: Record<string, string | string[]>
  contact: {
    firstName: string
    lastName: string
    email: string
    phone: string
    serviceAddress?: string
    preferredDate?: string
    notes?: string
  }
}

type ClaudeEstimate = {
  scopeSummary: string
  complexityNotes: string
  recommendedPriceRange: string
  followUpQuestions: string[]
}

const PRICING_CONTEXT = `
AMENT PRICING REFERENCE (use as guardrails — actual quotes vary by property):

Security & Surveillance:
- Video Doorbell: from $150 installed
- Single exterior camera: from $125 installed
- 4-camera outdoor HD package: from $775 installed
- Pro NVR/DVR system (8+ cameras): from $2,750
- Smart lock installation: from $150
- Alarm system setup (SimpliSafe, Ring): from $225
- Network security audit & hardening: from $187

Smart Automation & AI:
- Smart home consultation (2 hrs): from $300
- Whole-home automation (HomeKit/Google/Alexa): from $1,650
- AI workflow automation for business: custom, typically $500–3,000+
- Access control (keypad/app entry): from $650
- STR/Airbnb full tech package: from $1,275

Connectivity & Setup:
- TV mounting (up to 65"): from $125
- TV + soundbar setup: from $200
- Wi-Fi router setup & optimization: from $125
- Whole-home mesh Wi-Fi system: from $287
- Streaming device setup: from $80
- Cable concealment (in-wall/raceway): from $150
- Tech orientation session (1 hr): from $85

Smart Home & Pro Systems:
- Whole-home automation: from $1,650
- Pro camera system (NVR/DVR, 8+): from $2,750
- Access control: from $650
- STR/Airbnb full package: from $1,275
- Business tech setup: from $1,200
`

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim()
}

export async function POST(req: NextRequest) {
  let payload: QuotePayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { category, categoryName, answers, contact } = payload
  const { firstName, lastName, email, phone, serviceAddress, preferredDate, notes } = contact

  if (!firstName || !lastName || !email || !phone || !category || !categoryName) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  // Format questionnaire answers for display
  const answerLines = Object.entries(answers)
    .filter(([, val]) => val !== '' && (!Array.isArray(val) || val.length > 0))
    .map(([key, val]) => ({
      label: formatKey(key),
      value: Array.isArray(val) ? val.join(', ') : String(val),
    }))

  const formattedDate = preferredDate
    ? new Date(preferredDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'Not specified'

  // ── Try Claude estimate ──────────────────────────────────────────────────────
  let estimate: ClaudeEstimate | null = null
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (anthropicKey) {
    try {
      const client = new Anthropic({ apiKey: anthropicKey })
      const answersText = [
        ...(serviceAddress ? [`Service address: ${serviceAddress}`] : []),
        ...answerLines.map(a => `${a.label}: ${a.value}`),
        ...(notes ? [`Additional notes: ${notes}`] : []),
      ].join('\n')

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: `You are an estimator for Ament Home & Tech Services, a premium smart home and security installation company in St. Augustine, FL. Based on the customer's questionnaire answers, return ONLY a JSON object with exactly these fields:
{
  "scopeSummary": "2-3 sentences describing what the customer needs",
  "complexityNotes": "1-2 sentences about complexity or special considerations the tech should know",
  "recommendedPriceRange": "e.g. '$775–1,200' — a realistic installed range based on the answers and pricing reference",
  "followUpQuestions": ["specific question 1", "specific question 2", "specific question 3", "specific question 4"]
}

Factor in all questionnaire answers (property size, camera count, existing equipment, timeline, etc.). If a service address is provided, note if it falls outside St. Augustine proper (may require multi-day travel). Use the pricing reference as guardrails. Return ONLY valid JSON — no markdown, no extra text.

${PRICING_CONTEXT}`,
        messages: [{
          role: 'user',
          content: `Service category: ${categoryName}\n\nCustomer questionnaire answers:\n${answersText}`,
        }],
      })

      const raw = (message.content[0] as { type: string; text: string }).text.trim()
      // Strip any markdown code fences if present
      const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
      estimate = JSON.parse(jsonStr) as ClaudeEstimate
    } catch (err) {
      console.error('Claude estimate error — sending raw answers only:', err)
    }
  }

  // ── Email config ─────────────────────────────────────────────────────────────
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

  // ── Build questionnaire rows ─────────────────────────────────────────────────
  const answerRowsHtml = answerLines
    .map(({ label, value }, i) => `
      <tr${i % 2 === 0 ? ' style="background:#f7f3ed;"' : ''}>
        <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a;width:38%;vertical-align:top">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;color:#1a1a2e;font-size:14px">${escapeHtml(value)}</td>
      </tr>`)
    .join('')

  // ── Claude estimate block ─────────────────────────────────────────────────────
  const estimateHtml = estimate
    ? `<div style="background:#f0f7ee;border-radius:10px;padding:20px 24px;margin:24px 0;border-left:4px solid #2d7a4f;">
        <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#1e2d47;margin-bottom:16px;">AI Estimate (Claude)</div>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0 6px;vertical-align:top;font-weight:700;color:#1e2d47;font-size:13px;width:36%">Scope</td>
            <td style="padding:6px 0 6px;font-size:13px;color:#4a4a5a;line-height:1.6">${escapeHtml(estimate.scopeSummary)}</td>
          </tr>
          <tr>
            <td style="padding:6px 0 6px;vertical-align:top;font-weight:700;color:#1e2d47;font-size:13px">Complexity</td>
            <td style="padding:6px 0 6px;font-size:13px;color:#4a4a5a;line-height:1.6">${escapeHtml(estimate.complexityNotes)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0 4px;vertical-align:top;font-weight:700;color:#1e2d47;font-size:13px">Price Range</td>
            <td style="padding:10px 0 4px;font-size:22px;font-weight:700;color:#b89b6e">${escapeHtml(estimate.recommendedPriceRange)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0 6px;vertical-align:top;font-weight:700;color:#1e2d47;font-size:13px">Ask Before Quoting</td>
            <td style="padding:10px 0 6px;font-size:13px;color:#4a4a5a">
              <ul style="margin:0;padding-left:18px;line-height:1.7">
                ${estimate.followUpQuestions.map(q => `<li style="margin-bottom:4px">${escapeHtml(q)}</li>`).join('')}
              </ul>
            </td>
          </tr>
        </table>
      </div>`
    : `<div style="background:#fff8f0;border-radius:8px;padding:14px 18px;margin:20px 0;font-size:13px;color:#7a7a8a;font-style:italic;">AI estimate unavailable — review the raw questionnaire answers above before calling.</div>`

  // ── Business notification email ───────────────────────────────────────────────
  const businessHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:'Lato',Arial,sans-serif;background:#f7f3ed;margin:0;padding:0;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(30,45,71,0.12);">
    <div style="background:#1e2d47;padding:24px 32px;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:#fff;letter-spacing:2px;">AMENT</div>
      <div style="font-size:11px;color:#d4b98a;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Home &amp; Tech Services</div>
      <div style="margin-top:14px;font-size:17px;color:#d4b98a;font-weight:600;">📋 Quote Request — ${escapeHtml(categoryName)}</div>
    </div>
    <div style="padding:28px 32px;">

      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a;margin-bottom:10px;">Customer</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr style="background:#f7f3ed;">
          <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a;width:38%">Name</td>
          <td style="padding:8px 12px;color:#1a1a2e">${escapeHtml(firstName)} ${escapeHtml(lastName)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Email</td>
          <td style="padding:8px 12px;"><a href="mailto:${escapeHtml(email)}" style="color:#1e2d47">${escapeHtml(email)}</a></td>
        </tr>
        <tr style="background:#f7f3ed;">
          <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Phone</td>
          <td style="padding:8px 12px;"><a href="tel:${escapeHtml(phone)}" style="color:#1e2d47">${escapeHtml(phone)}</a></td>
        </tr>
        ${serviceAddress ? `<tr>
          <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Service Address</td>
          <td style="padding:8px 12px;color:#1a1a2e"><a href="https://maps.google.com/?q=${encodeURIComponent(serviceAddress)}" style="color:#b89b6e">${escapeHtml(serviceAddress)}</a></td>
        </tr>` : ''}
        <tr${serviceAddress ? ' style="background:#f7f3ed;"' : ''}>
          <td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Preferred Date</td>
          <td style="padding:8px 12px;color:#1a1a2e">${formattedDate}</td>
        </tr>
        ${notes ? `<tr style="background:#f7f3ed;"><td style="padding:8px 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a;vertical-align:top">Notes</td><td style="padding:8px 12px;color:#1a1a2e">${escapeHtml(notes).replace(/\n/g, '<br>')}</td></tr>` : ''}
      </table>

      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a;margin-bottom:10px;">Questionnaire — ${escapeHtml(categoryName)}</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
        ${answerRowsHtml}
      </table>

      ${estimateHtml}

      <p style="font-size:13px;color:#7a7a8a;line-height:1.6;margin-top:20px;">
        Reply directly to this email or call <a href="tel:${escapeHtml(phone)}" style="color:#b89b6e">${escapeHtml(phone)}</a> to follow up.
      </p>
    </div>
    <div style="background:#f7f3ed;padding:14px 32px;text-align:center;font-size:12px;color:#7a7a8a;">
      Ament Home &amp; Tech Services · St. Augustine, FL · <a href="tel:+14079208035" style="color:#b89b6e">(407) 920-8035</a>
    </div>
  </div>
</body>
</html>`

  // ── Customer confirmation email (no price disclosed) ──────────────────────────
  const customerHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:'Lato',Arial,sans-serif;background:#f7f3ed;margin:0;padding:0;">
  <div style="max-width:540px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(30,45,71,0.12);">
    <div style="background:#1e2d47;padding:24px 32px;text-align:center;">
      <div style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:700;color:#fff;letter-spacing:2px;">AMENT</div>
      <div style="font-size:11px;color:#d4b98a;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">Home &amp; Tech Services</div>
    </div>
    <div style="padding:32px;">
      <div style="font-size:36px;text-align:center;margin-bottom:16px;">✅</div>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#1e2d47;text-align:center;margin-bottom:12px;">Request Received!</h1>
      <p style="font-size:15px;color:#4a4a5a;line-height:1.75;text-align:center;margin-bottom:28px;">
        Hi ${escapeHtml(firstName)}, thanks for reaching out to Ament!<br>
        Sarah will review your ${escapeHtml(categoryName.toLowerCase())} project details and get back to you within <strong>24 hours</strong> with pricing and next steps.
      </p>
      <div style="background:#f7f3ed;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#7a7a8a">Your Request</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#1e2d47">${escapeHtml(categoryName)}</p>
        ${preferredDate ? `<p style="margin:8px 0 0;font-size:13px;color:#7a7a8a">Preferred date: ${formattedDate}</p>` : ''}
      </div>
      <p style="margin:0;font-size:13px;color:#7a7a8a;text-align:center;line-height:1.6;">
        Questions? Call us at <a href="tel:+14079208035" style="color:#b89b6e">(407) 920-8035</a>
      </p>
    </div>
  </div>
</body>
</html>`

  // ── Send both emails ─────────────────────────────────────────────────────────
  try {
    const [r1, r2] = await Promise.all([
      resend.emails.send({
        from: fromEmail,
        to: businessEmails,
        reply_to: email,
        subject: `Quote Request — ${categoryName} — ${firstName} ${lastName}`,
        html: businessHtml,
      }),
      resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Your Ament Quote Request — We'll be in touch!",
        html: customerHtml,
      }),
    ])

    if (r1.error || r2.error) {
      const err = r1.error || r2.error
      console.error('Resend error:', err)
      return NextResponse.json({ error: err?.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 })
  }
}
