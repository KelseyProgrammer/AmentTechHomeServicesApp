'use client'

import { useState } from 'react'

// ─── Categories ───────────────────────────────────────────────────────────────

type Category = {
  id: string
  name: string
  desc: string
  icon: string
  startingAt: string
  featured?: boolean
}

const CATEGORIES: Category[] = [
  {
    id: 'security',
    name: 'Security & Surveillance',
    desc: 'CCTV systems, camera packages, smart locks, video doorbells, alarm systems',
    icon: '📷',
    startingAt: '',
    featured: true,
  },
  {
    id: 'ai',
    name: 'Smart Automation & AI',
    desc: 'AI home routines, whole-home automation, smart dashboards, business workflow',
    icon: '🤖',
    startingAt: '',
  },
  {
    id: 'connectivity',
    name: 'Connectivity & Setup',
    desc: 'TV mounting, Wi-Fi setup & optimization, streaming devices, cable concealment',
    icon: '📡',
    startingAt: '',
  },
  {
    id: 'smartHome',
    name: 'Smart Home & Pro Systems',
    desc: 'Full home automation, NVR/DVR systems, STR/Airbnb packages',
    icon: '🏠',
    startingAt: '',
  },
  {
    id: 'accessControl',
    name: 'Access Control & Entry',
    desc: 'Keypads, fob & card readers, app-based entry, door strikes, maglocks, gate access',
    icon: '🔐',
    startingAt: '',
  },
]

// ─── Questionnaires ───────────────────────────────────────────────────────────

type Question = {
  id: string
  label: string
  type: 'select' | 'multiselect' | 'textarea'
  options?: string[]
  optional?: boolean
}

const QUESTIONNAIRES: Record<string, Question[]> = {
  security: [
    {
      id: 'propertyType',
      label: 'Property type',
      type: 'select',
      options: ['Primary Residence', 'Short-Term Rental / Airbnb', 'Vacation Home', 'Small Business / Office', 'Other'],
    },
    {
      id: 'cameraCount',
      label: 'Number of cameras needed',
      type: 'select',
      options: ['1–2 cameras', '3–4 cameras', '5–8 cameras', '8+ cameras', 'Not sure yet'],
    },
    {
      id: 'cameraPlacement',
      label: 'Camera placement',
      type: 'select',
      options: ['Outdoor only', 'Indoor only', 'Both indoor & outdoor'],
    },
    {
      id: 'existingRecorder',
      label: 'Existing NVR/DVR or recorder?',
      type: 'select',
      options: ['No — starting fresh', 'Yes — keep existing', 'Yes — want to replace it'],
    },
    {
      id: 'equipmentSource',
      label: 'Equipment preference',
      type: 'select',
      options: ['Ament supplies everything (recommended)', 'I already have my equipment', 'Mix of both / not sure yet'],
    },
    {
      id: 'storagePreference',
      label: 'Storage / monitoring preference',
      type: 'select',
      options: ['Local storage only', 'Cloud + local backup', 'Cloud only', 'Not sure yet'],
    },
    {
      id: 'coverageScope',
      label: 'Coverage scope',
      type: 'select',
      options: ['1–2 entry points', '3–5 areas or zones', 'Whole property', 'Multiple buildings / large property'],
    },
    {
      id: 'notes',
      label: 'Anything else we should know?',
      type: 'textarea',
      optional: true,
    },
  ],
  ai: [
    {
      id: 'automationType',
      label: 'What would you like automated? (select all that apply)',
      type: 'multiselect',
      options: ['Lighting', 'Climate / Thermostat', 'Security & cameras', 'Voice assistant integration', 'Business workflow / scheduling', 'Other'],
    },
    {
      id: 'existingDevices',
      label: 'Current smart devices',
      type: 'select',
      options: ['None yet', 'A few (1–5 devices)', 'Quite a few (6–15 devices)', 'Fully equipped already'],
    },
    {
      id: 'currentPlatform',
      label: 'Current smart home platform',
      type: 'select',
      options: ['None yet', 'Google Home', 'Amazon Alexa', 'Apple HomeKit', 'Home Assistant', 'Other / multiple'],
    },
    {
      id: 'zones',
      label: 'Rooms / zones to cover',
      type: 'select',
      options: ['1–2 rooms', '3–5 rooms', '6–10 rooms', 'Whole property + outdoors'],
    },
    {
      id: 'installPreference',
      label: 'Preferred involvement',
      type: 'select',
      options: ['Full white-glove install', 'Setup & configuration help only', 'Consultation — I want to plan it myself'],
    },
    {
      id: 'primaryGoal',
      label: 'Primary goal',
      type: 'select',
      options: ['Save energy', 'Improve security', 'Everyday convenience', 'Business efficiency', 'Build a complete smart home'],
    },
    {
      id: 'notes',
      label: 'Anything else we should know?',
      type: 'textarea',
      optional: true,
    },
  ],
  connectivity: [
    {
      id: 'services',
      label: 'Which services do you need? (select all that apply)',
      type: 'multiselect',
      options: ['TV Mounting', 'Wi-Fi Setup & Optimization', 'Streaming Device Setup', 'Cable Concealment', 'Device Setup & Network Connect', 'Tech Orientation Session'],
    },
    {
      id: 'tvSize',
      label: 'TV size (if mounting)',
      type: 'select',
      options: ['Under 50"', '50–65"', '65–85"', '85"+', 'Multiple TVs', 'Not mounting a TV'],
    },
    {
      id: 'wifiSituation',
      label: 'Current Wi-Fi situation',
      type: 'select',
      options: ['Works fine (just need device help)', 'Has dead zones / weak spots', 'Needs full upgrade or replacement', 'New home — starting fresh'],
    },
    {
      id: 'deviceCount',
      label: 'Devices needing setup',
      type: 'select',
      options: ['1–2 devices', '3–5 devices', '6+ devices'],
    },
    {
      id: 'propertySize',
      label: 'Home / office size',
      type: 'select',
      options: ['Studio or 1 bedroom', '2–3 bedrooms', '4+ bedrooms', 'Office or commercial space'],
    },
    {
      id: 'notes',
      label: 'Anything else?',
      type: 'textarea',
      optional: true,
    },
  ],
  smartHome: [
    {
      id: 'projectType',
      label: 'Primary project type',
      type: 'select',
      options: [
        'Full home automation (HomeKit, Google, Alexa)',
        'Pro camera system (NVR/DVR, 8+ cameras)',
        'Access control (keypad / app-based entry)',
        'STR / Airbnb full tech package',
        'Business tech setup',
      ],
    },
    {
      id: 'propertySize',
      label: 'Property / business size',
      type: 'select',
      options: ['Under 2,000 sq ft', '2,000–4,000 sq ft', 'Over 4,000 sq ft', 'Multiple units or buildings'],
    },
    {
      id: 'currentEcosystem',
      label: 'Current smart home ecosystem',
      type: 'select',
      options: ['None yet', 'Google Home', 'Amazon Alexa', 'Apple HomeKit', 'Home Assistant', 'Multiple / mixed'],
    },
    {
      id: 'equipmentSource',
      label: 'Equipment preference',
      type: 'select',
      options: ['Ament supplies everything (recommended)', 'I already have my equipment', 'Mix of both / not sure yet'],
    },
    {
      id: 'timeline',
      label: 'Timeline',
      type: 'select',
      options: ['ASAP', 'Within the next month', 'Just exploring options'],
    },
    {
      id: 'budgetRange',
      label: 'Approximate budget',
      type: 'select',
      options: ['$500–1,500', '$1,500–3,000', '$3,000–6,000', '$6,000+', 'Need guidance on budget'],
    },
    {
      id: 'propertyType',
      label: 'Property type',
      type: 'select',
      options: ['Primary Residence', 'Short-Term Rental / Airbnb', 'Vacation Home', 'Small Business / Office'],
    },
    {
      id: 'notes',
      label: 'Anything else?',
      type: 'textarea',
      optional: true,
    },
  ],
  accessControl: [
    {
      id: 'propertyType',
      label: 'Property type',
      type: 'select',
      options: ['Primary Residence', 'Short-Term Rental / Airbnb', 'Small Business / Office', 'Multi-Unit / Commercial', 'Church / Nonprofit', 'Other'],
    },
    {
      id: 'doorCount',
      label: 'Doors or entry points to control',
      type: 'select',
      options: ['1 door', '2–3 doors', '4–8 doors', '9+ doors', 'Gate or garage entry'],
    },
    {
      id: 'entryMethods',
      label: 'Preferred entry methods (select all that apply)',
      type: 'multiselect',
      options: ['Keypad / PIN code', 'Key fob or card', 'Smartphone app', 'Video intercom', 'Fingerprint / biometric', 'Not sure yet'],
    },
    {
      id: 'doorTypes',
      label: 'Door types (select all that apply)',
      type: 'multiselect',
      options: ['Standard wood / metal doors', 'Glass storefront doors', 'Exterior gates', 'Garage / overhead doors', 'Not sure yet'],
    },
    {
      id: 'existingSystem',
      label: 'Existing access control system?',
      type: 'select',
      options: ['No — starting fresh', 'Yes — want to expand it', 'Yes — want to replace it'],
    },
    {
      id: 'remoteManagement',
      label: 'Remote management needs',
      type: 'select',
      options: ['Manage from my phone (grant/revoke access remotely)', 'On-site management is fine', 'Need audit logs / entry history', 'Not sure yet'],
    },
    {
      id: 'timeline',
      label: 'Timeline',
      type: 'select',
      options: ['ASAP', 'Within the next month', 'Just exploring options'],
    },
    {
      id: 'notes',
      label: 'Anything else we should know?',
      type: 'textarea',
      optional: true,
    },
  ],
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceAddress: string
  preferredDate: string
  notes: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BookingWizard({ inModal = false }: { inModal?: boolean }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '', serviceAddress: '', preferredDate: '', notes: '',
  })

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const selectedCat = CATEGORIES.find(c => c.id === selectedCategory)
  const questions = selectedCategory ? QUESTIONNAIRES[selectedCategory] : []

  function allRequiredAnswered(): boolean {
    if (!selectedCategory) return false
    return questions.every(q => {
      if (q.optional) return true
      const val = answers[q.id]
      if (Array.isArray(val)) return val.length > 0
      return !!val
    })
  }

  function toggleMulti(qId: string, option: string, checked: boolean) {
    setAnswers(prev => {
      const current = (prev[qId] as string[]) || []
      return {
        ...prev,
        [qId]: checked ? [...current, option] : current.filter(x => x !== option),
      }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')

    const payload = {
      category: selectedCategory,
      categoryName: selectedCat?.name,
      answers,
      contact: {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        serviceAddress: form.serviceAddress || undefined,
        preferredDate: form.preferredDate || undefined,
        notes: form.notes || undefined,
      },
    }

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Submission failed. Please try again.')
      }
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const answeredCount = Object.entries(answers).filter(([, val]) =>
    Array.isArray(val) ? val.length > 0 : !!val
  ).length

  return (
    <div className="main">

      {/* ── PROGRESS BAR ── */}
      {!submitted && (
        <div className="progress-bar">
          <div className="progress-step">
            <div className={`step-circle ${step === 1 ? 'active' : 'done'}`}>
              {step > 1 ? '✓' : '1'}
            </div>
            <span className={`step-label ${step === 1 ? 'active' : ''}`}>Your Project</span>
          </div>
          <div className={`step-connector ${step > 1 ? 'done' : ''}`} />
          <div className="progress-step">
            <div className={`step-circle ${step === 2 ? 'active' : ''}`}>2</div>
            <span className={`step-label ${step === 2 ? 'active' : ''}`}>Your Details</span>
          </div>
        </div>
      )}

      {/* ── STEP 1: CATEGORY PICKER + QUESTIONNAIRE ── */}
      {step === 1 && (
        <div>
          <p className="section-title">What service do you need?</p>
          <p className="section-sub">
            Pick a category — then answer a few quick questions so we can scope your quote accurately.
          </p>

          <div className={`bw-cat-grid${inModal ? ' bw-cat-grid--modal' : ''}`}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`bw-cat-card${selectedCategory === cat.id ? ' bw-cat-card--selected' : ''}${cat.featured ? ' bw-cat-card--featured' : ''}`}
                onClick={() => { setSelectedCategory(cat.id); setAnswers({}) }}
              >
                {selectedCategory === cat.id && <div className="bw-cat-check">✓</div>}
                <div className="bw-cat-icon">{cat.icon}</div>
                <div className="bw-cat-name">{cat.name}</div>
                <div className="bw-cat-desc">{cat.desc}</div>
              </button>
            ))}
          </div>

          {/* ── Questionnaire ── */}
          {selectedCategory && (
            <div className="bw-questionnaire">
              <div className="bw-q-header">
                <span className="bw-q-icon">{selectedCat?.icon}</span>
                <div>
                  <div className="bw-q-title">{selectedCat?.name}</div>
                  <div className="bw-q-sub">Answer the questions below so we can scope your quote</div>
                </div>
              </div>

              <div className="form-grid">
                {questions.map(q => (
                  <div
                    key={q.id}
                    className={`form-group${q.type !== 'select' ? ' full' : ''}`}
                  >
                    <label htmlFor={q.id}>
                      {q.label}{!q.optional && ' *'}
                    </label>

                    {q.type === 'select' && (
                      <select
                        id={q.id}
                        value={(answers[q.id] as string) || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      >
                        <option value="">Select...</option>
                        {q.options!.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {q.type === 'multiselect' && (
                      <div className="bw-checkbox-group">
                        {q.options!.map(opt => {
                          const checked = ((answers[q.id] as string[]) || []).includes(opt)
                          return (
                            <label
                              key={opt}
                              className={`bw-checkbox-label${checked ? ' bw-checkbox-label--checked' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={e => toggleMulti(q.id, opt, e.target.checked)}
                              />
                              {opt}
                            </label>
                          )
                        })}
                      </div>
                    )}

                    {q.type === 'textarea' && (
                      <textarea
                        id={q.id}
                        rows={3}
                        placeholder="Optional — any details that would help us scope your project accurately"
                        value={(answers[q.id] as string) || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 28 }}>
                <button
                  type="button"
                  className="submit-btn"
                  disabled={!allRequiredAnswered()}
                  onClick={() => {
                    setStep(2)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Continue to Your Details →
                </button>
                {!allRequiredAnswered() && (
                  <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-light)', textAlign: 'center' }}>
                    Complete the required questions above to continue.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: CONTACT FORM ── */}
      {step === 2 && !submitted && (
        <div>
          <button
            type="button"
            className="bw-back-btn"
            onClick={() => setStep(1)}
          >
            ← Back
          </button>

          <p className="section-title">Your Details</p>
          <p className="section-sub">
            A few contact details so Sarah can follow up within 24 hours.
          </p>

          {/* Service summary chip */}
          <div className="bw-summary">
            <span className="bw-summary-icon">{selectedCat?.icon}</span>
            <div>
              <div className="bw-summary-name">{selectedCat?.name}</div>
              <div className="bw-summary-count">{answeredCount} question{answeredCount !== 1 ? 's' : ''} answered</div>
            </div>
          </div>

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
                <input id="phone" type="tel" required placeholder="(904) 555-0123"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="form-group full">
                <label htmlFor="serviceAddress">Service Address *</label>
                <input id="serviceAddress" type="text" required placeholder="123 Main St, St. Augustine, FL 32080"
                  value={form.serviceAddress}
                  onChange={e => setForm(f => ({ ...f, serviceAddress: e.target.value }))} />
              </div>
              <div className="form-group full">
                <label htmlFor="preferredDate">Preferred Date</label>
                <input id="preferredDate" type="date" min={minDate}
                  value={form.preferredDate}
                  onChange={e => setForm(f => ({ ...f, preferredDate: e.target.value }))} />
              </div>
              <div className="form-group full">
                <label htmlFor="formNotes">Anything else to add?</label>
                <textarea id="formNotes" rows={3}
                  placeholder="Property address, gate codes, scheduling constraints, or any other details..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            {submitError && <div className="error-msg">⚠️ {submitError}</div>}

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting && <span className="loading-spinner" />}
              {submitting ? 'Sending…' : 'Submit My Quote Request →'}
            </button>
            <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-light)', textAlign: 'center' }}>
              No payment required — Sarah will follow up within 24 hours.
            </p>
          </form>
        </div>
      )}

      {/* ── CONFIRMATION (inline, no page transition) ── */}
      {submitted && (
        <div className="confirmation">
          <div className="confirm-icon">✅</div>
          <div className="confirm-title">Request Received!</div>
          <div className="confirm-sub">
            Sarah will review your {selectedCat?.name.toLowerCase()} project details and reach out within 24 hours with pricing and next steps.
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
              <span className="confirm-label">Service</span>
              <span className="confirm-value">{selectedCat?.name}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
