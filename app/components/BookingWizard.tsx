'use client'

import { useState, useRef } from 'react'
import ServiceTierCard, { type Tier, type Cart } from './ServiceTierCard'
import AIScopingPanel from './AIScopingPanel'

// ─── Data ────────────────────────────────────────────────────────────────────

const TIERS: Tier[] = [
  {
    tag: 'Tier 1',
    name: 'Ament Connect',
    subtitle: 'Entertainment & Connectivity',
    startingAt: 65,
    priceNote: 'per service / visit',
    services: [
      { id: 'tv-mount', name: 'TV Mounting (up to 65″)', price: 125 },
      { id: 'tv-sound', name: 'TV + Soundbar Setup', price: 200 },
      { id: 'wifi-setup', name: 'Wi-Fi Router Setup & Optimization', price: 125 },
      { id: 'device-setup', name: 'Device Setup & Network Connect', price: 100 },
      { id: 'streaming', name: 'Streaming Setup (Roku, Apple TV…)', price: 80 },
      { id: 'cable', name: 'Cable Concealment (in-wall/raceway)', price: 150 },
      { id: 'tech-orientation', name: 'Tech Orientation Session (1 hr)', price: 85 },
    ],
  },
  {
    tag: 'Tier 2',
    name: 'Ament Secure',
    subtitle: 'Security & Smart Access',
    startingAt: 100,
    priceNote: 'per service / visit',
    featured: true,
    services: [
      { id: 'doorbell', name: 'Video Doorbell Installation', price: 150 },
      { id: 'camera-single', name: 'Exterior Camera (per camera)', price: 125 },
      { id: 'camera-4pack', name: 'Full 4-Camera Package', price: 775 },
      { id: 'smart-lock', name: 'Smart Lock Installation & Setup', price: 150 },
      { id: 'mesh-wifi', name: 'Whole-Home Mesh Wi-Fi System', price: 287 },
      { id: 'alarm', name: 'Alarm System Setup (SimpliSafe…)', price: 225 },
      { id: 'net-audit', name: 'Network Security Audit & Hardening', price: 187 },
    ],
  },
  {
    tag: 'Tier 3',
    name: 'Ament Command',
    subtitle: 'Full Automation & Pro Systems',
    startingAt: 250,
    priceNote: 'per service / visit',
    services: [
      { id: 'smarthome-consult', name: 'Smart Home Consultation (2 hrs)', price: 300 },
      { id: 'automation', name: 'Whole-Home Automation (HomeKit…)', price: 1650 },
      { id: 'pro-cameras', name: 'Pro Camera System (NVR/DVR, 8+)', price: 2750 },
      { id: 'access-control', name: 'Access Control (keypad/app entry)', price: 650 },
      { id: 'str-package', name: 'STR/Airbnb Full Tech Package', price: 1275 },
      { id: 'smarthome-training', name: 'Smart Home Training Session', price: 200 },
      { id: 'biz-tech', name: 'Business Tech Setup (custom quote)', price: 1200 },
    ],
  },
  {
    tag: 'Tier 4',
    name: 'Ament AI Workflow',
    subtitle: 'Intelligent Automation & AI Integration',
    startingAt: 0,
    priceNote: 'custom quote',
    customQuote: true,
    services: [
      { id: 'ai-routines', name: 'AI Home Automation Routines', price: 0 },
      { id: 'ai-dashboard', name: 'Smart Dashboard Setup', price: 0 },
      { id: 'ai-security', name: 'AI-Assisted Security Monitoring', price: 0 },
      { id: 'ai-bizflow', name: 'Workflow Automation for Small Business', price: 0 },
      { id: 'ai-consulting', name: 'AI Device Integration Consulting', price: 0 },
    ],
  },
]

const AI_IDS = new Set(['ai-routines', 'ai-dashboard', 'ai-security', 'ai-bizflow', 'ai-consulting'])

const CARE_PLANS = [
  {
    id: 'connect',
    name: 'Connect Care',
    price: '$29/mo or $299/yr',
    perks: 'Priority scheduling · 10% off labor · Annual remote check-in',
  },
  {
    id: 'secure',
    name: 'Secure Care',
    price: '$59/mo or $599/yr',
    perks: 'All above · Annual on-site inspection · Firmware updates',
  },
  {
    id: 'command',
    name: 'Command Care',
    price: '$99/mo or $999/yr',
    perks: 'All above · Quarterly visits · 24hr response guarantee',
  },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type CartItem = { name: string; price: number }

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  propertyType: string
  preferredDate: string
  notes: string
  hearAbout: string
  aiProjectBrief?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookingWizard({ inModal = false }: { inModal?: boolean }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [cart, setCart] = useState<Cart>({})
  const [carePlan, setCarePlan] = useState<string | null>(null)
  const [carePlanSkipped, setCarePlanSkipped] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [aiProjectBrief, setAiProjectBrief] = useState('')
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', propertyType: '', preferredDate: '', notes: '', hearAbout: '',
  })
  const cartRef = useRef<HTMLDivElement>(null)

  const cartItems = Object.entries(cart).map(([id, item]) => ({ id, ...item }))
  const cartTotal = cartItems.reduce((s, i) => s + i.price, 0)
  const cartCount = cartItems.length
  const hasCustomQuote = cartItems.some(i => AI_IDS.has(i.id))

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  function toggleService(id: string, name: string, price: number) {
    setCart(prev => {
      const next = { ...prev }
      if (next[id]) delete next[id]
      else next[id] = { name, price }
      return next
    })
  }

  function removeFromCart(id: string) {
    setCart(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function scrollToCart() {
    cartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')

    const payload = {
      ...form,
      services: cartItems.map(i => ({ name: i.name, price: i.price })),
      total: cartTotal,
      carePlan,
      hasCustomQuote,
      aiProjectBrief: aiProjectBrief || undefined,
    }

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Submission failed. Please try again.')
      }
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const formattedDate = form.preferredDate
    ? new Date(form.preferredDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'To be confirmed'

  const carePlanLabel = carePlan
    ? `Ament ${carePlan.charAt(0).toUpperCase() + carePlan.slice(1)} Care Plan`
    : 'None'

  return (
    <>
      <div className="main">
        {/* PROGRESS BAR */}
        <div className="progress-bar">
          <div className="progress-step">
            <div className={`step-circle ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className={`step-label ${step === 1 ? 'active' : ''}`}>Services</span>
          </div>
          <div className={`step-connector ${step > 1 ? 'done' : ''}`} />
          <div className="progress-step">
            <div className={`step-circle ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <span className={`step-label ${step === 2 ? 'active' : ''}`}>Your Details</span>
          </div>
          <div className={`step-connector ${step > 2 ? 'done' : ''}`} />
          <div className="progress-step">
            <div className={`step-circle ${step === 3 ? 'active' : ''}`}>3</div>
            <span className={`step-label ${step === 3 ? 'active' : ''}`}>Confirmation</span>
          </div>
        </div>

        {/* ── STEP 1: SERVICE SELECTION ── */}
        {step === 1 && (
          <div id="step1">
            <p className="section-title">Select Your Services</p>
            <p className="section-sub">Choose from our service tiers — mix and match anything below.</p>

            <div className={`tier-grid${inModal ? ' tier-grid--in-modal' : ''}`}>
              {TIERS.map(tier => (
                <ServiceTierCard
                  key={tier.tag}
                  tier={tier}
                  cart={cart}
                  onToggle={toggleService}
                  onSelectAll={(t) => {
                    t.services.forEach(svc => {
                      if (!cart[svc.id]) toggleService(svc.id, svc.name, svc.price)
                    })
                  }}
                />
              ))}
            </div>

            {cartCount > 0 && (
              <div ref={cartRef} className="cart-panel">
                <div className="cart-title">🛒 Your Selected Services</div>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-right">
                        <span className="cart-item-price">
                          {AI_IDS.has(item.id) ? 'Custom' : `From $${item.price.toLocaleString()}`}
                        </span>
                        <button className="cart-remove" onClick={() => removeFromCart(item.id)}>×</button>
                      </span>
                    </div>
                  ))}
                </div>
                {hasCustomQuote ? (
                  <div className="cart-custom-quote-note">
                    Includes custom-scoped service — pricing determined after consultation
                  </div>
                ) : (
                  <div className="cart-total">
                    <span>Estimated Starting Total</span>
                    <span className="cart-total-amount">${cartTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button
                className="submit-btn"
                disabled={cartCount === 0}
                onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              >
                Continue to Booking Details →
              </button>
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-light)' }}>
                We&apos;ll follow up to confirm your appointment time.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2: BOOKING FORM ── */}
        {step === 2 && (
          <div id="step2">
            <p className="section-title">Your Details</p>
            <p className="section-sub">Tell us a bit about yourself and we&apos;ll reach out to schedule your visit.</p>

            {hasCustomQuote && (
              <AIScopingPanel onBriefGenerated={setAiProjectBrief} />
            )}

            {!carePlanSkipped && (
              <div className="care-plan-box">
                <div className="care-plan-title">⭐ Add an Ament Care Plan</div>
                <div className="care-plan-desc">
                  Priority scheduling, discounted labor, and proactive system check-ins — cancel anytime.
                </div>
                <div className="care-plans">
                  {CARE_PLANS.map(plan => (
                    <div
                      key={plan.id}
                      className={`care-plan-option ${carePlan === plan.id ? 'selected' : ''}`}
                      onClick={() => setCarePlan(prev => prev === plan.id ? null : plan.id)}
                    >
                      <div className="care-plan-name">{plan.name}</div>
                      <div className="care-plan-price">{plan.price}</div>
                      <div className="care-plan-perks">{plan.perks}</div>
                    </div>
                  ))}
                </div>
                <button className="care-plan-skip" onClick={() => { setCarePlanSkipped(true); setCarePlan(null) }}>
                  No thanks, not right now
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input id="firstName" type="text" required placeholder="Chris"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input id="lastName" type="text" required placeholder="Smith"
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input id="email" type="email" required placeholder="you@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input id="phone" type="tel" required placeholder="(407) 920-8035"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-group full">
                  <label htmlFor="address">Service Address *</label>
                  <input id="address" type="text" required placeholder="123 Palm Ave, St. Augustine, FL 32080"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label htmlFor="propertyType">Property Type</label>
                  <select id="propertyType" value={form.propertyType}
                    onChange={e => setForm(f => ({ ...f, propertyType: e.target.value }))}>
                    <option value="">Select type...</option>
                    <option>Primary Residence</option>
                    <option>Short-Term Rental / Airbnb</option>
                    <option>Vacation Home</option>
                    <option>Small Business / Office</option>
                    <option>New Construction</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="preferredDate">Preferred Date</label>
                  <input id="preferredDate" type="date" min={minDate}
                    value={form.preferredDate}
                    onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))} />
                </div>
                <div className="form-group full">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea id="notes"
                    placeholder="Any details about your home, specific concerns, or questions for our team..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>
                <div className="form-group full">
                  <label htmlFor="hearAbout">How did you hear about us?</label>
                  <select id="hearAbout" value={form.hearAbout}
                    onChange={e => setForm(f => ({ ...f, hearAbout: e.target.value }))}>
                    <option value="">Select...</option>
                    <option>Nextdoor</option>
                    <option>Google Search</option>
                    <option>Facebook / Social Media</option>
                    <option>Friend or Neighbor Referral</option>
                    <option>Yard Sign / Flyer</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {submitError && <div className="error-msg">⚠️ {submitError}</div>}

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? <span className="loading-spinner" /> : '📋'}
                {submitting ? 'Submitting…' : 'Request My Appointment'}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 3: CONFIRMATION ── */}
        {step === 3 && (
          <div className="confirmation">
            <div className="confirm-icon">✅</div>
            <div className="confirm-title">Request Received!</div>
            <div className="confirm-sub">
              {hasCustomQuote
                ? <>Sarah will review your project brief and reach out within 24 hours with a custom quote.</>
                : <>Thank you for choosing Ament Home &amp; Tech Services.<br />Sarah will reach out within 24 hours to confirm your appointment.</>
              }
            </div>
            <div className="confirm-details">
              <div className="confirm-row">
                <span className="confirm-label">Name</span>
                <span className="confirm-value">{form.firstName} {form.lastName}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Email</span>
                <span className="confirm-value">{form.email}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Phone</span>
                <span className="confirm-value">{form.phone}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Address</span>
                <span className="confirm-value">{form.address}</span>
              </div>
              {form.propertyType && (
                <div className="confirm-row">
                  <span className="confirm-label">Property Type</span>
                  <span className="confirm-value">{form.propertyType}</span>
                </div>
              )}
              <div className="confirm-row">
                <span className="confirm-label">Services</span>
                <span className="confirm-value" style={{ textAlign: 'right', maxWidth: '60%' }}>
                  {cartItems.map(i => i.name).join(', ')}
                </span>
              </div>
              {!hasCustomQuote && (
                <div className="confirm-row">
                  <span className="confirm-label">Est. Starting Price</span>
                  <span className="confirm-value">From ${cartTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="confirm-row">
                <span className="confirm-label">Care Plan</span>
                <span className="confirm-value">{carePlanLabel}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Preferred Date</span>
                <span className="confirm-value">{formattedDate}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING CART FAB — only outside modal context */}
      {!inModal && step === 1 && cartCount > 0 && (
        <button className="cart-fab" onClick={scrollToCart}>
          <span>🛒 Your Services</span>
          <span className="cart-count">{cartCount}</span>
        </button>
      )}
    </>
  )
}
