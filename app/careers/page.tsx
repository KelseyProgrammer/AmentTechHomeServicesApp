'use client'

import { useState } from 'react'
import Image from 'next/image'

const LICENSE_TYPES = ['ES', 'EF', 'EC', 'EG', 'Other']
const EXPERIENCE_OPTIONS = ['Under 2 years', '2–5 years', '5–10 years', '10–15 years', '15+ years']

type ApplyForm = {
  name: string
  phone: string
  email: string
  licenseType: string
  licenseNumber: string
  yearsExperience: string
  currentlyQualifying: string
}

export default function CareersPage() {
  const [form, setForm] = useState<ApplyForm>({
    name: '', phone: '', email: '', licenseType: '', licenseNumber: '', yearsExperience: '', currentlyQualifying: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof ApplyForm>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Submission failed. Please call or text us instead.')
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <header>
        <div className="header-inner">
          <a href="/" className="logo-wrap" style={{ textDecoration: 'none' }}>
            <Image
              src="/logo.png"
              alt="Ament Logo"
              width={90}
              height={60}
              style={{ borderRadius: 6, background: '#fff', padding: 4, objectFit: 'contain' }}
            />
            <div className="logo-text">
              <span className="brand">AMENT</span>
              <span className="tagline">Home &amp; Tech Services</span>
            </div>
          </a>
          <div className="header-cta">
            <a href="/" className="header-nav-link">Home</a>
            <a href="/about" className="header-nav-link">About</a>
            <a href="tel:+14079208035" className="phone-link">📞 (407) 920-8035</a>
          </div>
        </div>
      </header>

      <div className="hero">
        <h1>
          Licensed Low-Voltage Technician<br />
          <em>St. Augustine &amp; St. Johns County</em>
        </h1>
        <p>
          Ament Tech &amp; Security Services is hiring a licensed limited energy / low-voltage
          technician to run CCTV, access control, and structured cabling installs — and QA the
          work of our install team as we grow.
        </p>
        <div className="hero-badges">
          <span className="badge">🔧 IP Camera &amp; NVR Systems</span>
          <span className="badge">🔐 Access Control</span>
          <span className="badge">🗺️ St. Johns County</span>
          <span className="badge">📄 W-2 Position</span>
        </div>
      </div>

      <div className="main">
        {submitted ? (
          <div className="confirmation">
            <div className="confirm-icon">✅</div>
            <div className="confirm-title">Application Received!</div>
            <div className="confirm-sub">
              Thanks, {form.name.split(' ')[0]}. Chris will verify your license and get back to
              you within 1–2 business days. Want to skip the wait?{' '}
              <a href="tel:+14079208035" style={{ color: 'var(--gold)' }}>Call</a> or{' '}
              <a href="sms:+14079208035" style={{ color: 'var(--gold)' }}>text</a> (407) 920-8035.
            </div>
          </div>
        ) : (
          <>
            <p className="section-title">The Work</p>
            <p className="section-sub" style={{ textAlign: 'left', maxWidth: 'none' }}>
              Residential and small-commercial installs across St. Augustine, Ponte Vedra, Nocatee,
              and the surrounding communities: IP camera systems with PoE NVRs, video doorbells,
              access control (keypads, readers, strikes, maglocks), and the cabling behind all of
              it. You&apos;ll run your own installs, supervise and sign off on the work of our
              install team, and help set the quality bar as the company grows.
            </p>
            <p className="section-sub" style={{ textAlign: 'left', maxWidth: 'none' }}>
              This is a <strong>W-2 position</strong> with competitive hourly pay, per-job QA fees,
              and qualifier compensation for the right candidate — not a 1099 license-rental
              arrangement. Steady booked work through our online booking pipeline, equipment
              supplied through our distributor account, no cold-calling and no sales quotas.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '28px 0 40px' }}>
              <a href="tel:+14079208035" className="submit-btn" style={{ flex: 1, minWidth: 200, textAlign: 'center', textDecoration: 'none' }}>
                📞 Call Chris — (407) 920-8035
              </a>
              <a href="sms:+14079208035" className="submit-btn" style={{ flex: 1, minWidth: 200, textAlign: 'center', textDecoration: 'none' }}>
                💬 Text Us
              </a>
            </div>

            <p className="section-title">Or Apply Online</p>
            <p className="section-sub">Prefer a form? Leave your details and we&apos;ll call you back.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input id="name" type="text" required placeholder="Your name"
                    value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <input id="phone" type="tel" required placeholder="(904) 555-0123"
                    value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input id="email" type="email" required placeholder="you@email.com"
                    value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="licenseType">License Type *</label>
                  <select id="licenseType" required value={form.licenseType}
                    onChange={e => set('licenseType', e.target.value)}>
                    <option value="">Select...</option>
                    {LICENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="licenseNumber">License Number *</label>
                  <input id="licenseNumber" type="text" required placeholder="e.g. ES12001234"
                    value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="yearsExperience">Years of Experience *</label>
                  <select id="yearsExperience" required value={form.yearsExperience}
                    onChange={e => set('yearsExperience', e.target.value)}>
                    <option value="">Select...</option>
                    {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="form-group full">
                  <label htmlFor="currentlyQualifying">Are you currently qualifying another business? *</label>
                  <select id="currentlyQualifying" required value={form.currentlyQualifying}
                    onChange={e => set('currentlyQualifying', e.target.value)}>
                    <option value="">Select...</option>
                    <option>No</option>
                    <option>Yes</option>
                    <option>Not sure what this means</option>
                  </select>
                </div>
              </div>

              {error && <div className="error-msg">⚠️ {error}</div>}

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting && <span className="loading-spinner" />}
                {submitting ? 'Sending…' : 'Submit Application →'}
              </button>
            </form>
          </>
        )}
      </div>

      <footer>
        <p>© 2025 Ament Home &amp; Tech Services · Greater St. Augustine, FL · <a href="tel:+14079208035">(407) 920-8035</a></p>
        <p style={{ marginTop: 6 }}>Licensed &amp; Insured · Smarter Living, Made Simple.</p>
      </footer>
    </>
  )
}
