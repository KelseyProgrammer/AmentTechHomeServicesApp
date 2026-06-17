'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import ScrollVideoSection from './components/ScrollVideoSection'

const BookingModal = dynamic(() => import('./components/BookingModal'), { ssr: false })

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES_DATA = [
  {
    id: 'security',
    category: 'Security & Surveillance',
    eyebrow: 'Flagship Service',
    badge: 'Most Requested',
    featured: true,
    startingAt: 'Systems from $775',
    customQuote: false,
    services: [
      'CCTV Camera System Installation',
      'Video Doorbell Installation',
      'Exterior Camera Packages (4-cam, 8-cam, custom)',
      'Pro NVR/DVR Systems',
      'Smart Lock Installation & Setup',
      'Alarm System Setup (SimpliSafe & more)',
      'Network Security Audit & Hardening',
    ],
  },
  {
    id: 'ai',
    category: 'Smart Automation & AI',
    eyebrow: 'Now Offering',
    badge: null,
    featured: false,
    startingAt: null,
    customQuote: true,
    services: [
      'AI Home Automation Routines',
      'Smart Dashboard Setup',
      'AI-Assisted Security Monitoring',
      'Workflow Automation for Small Business',
      'AI Device Integration Consulting',
      'Whole-Home Automation (HomeKit, Google, Alexa)',
    ],
  },
  {
    id: 'connectivity',
    category: 'Connectivity & Setup',
    eyebrow: 'Entertainment & Network',
    badge: null,
    featured: false,
    startingAt: 'From $65',
    customQuote: false,
    services: [
      'TV Mounting & Soundbar Setup',
      'Wi-Fi Router Setup & Optimization',
      'Whole-Home Mesh Wi-Fi Systems',
      'Streaming Device Configuration',
      'Cable Concealment (in-wall/raceway)',
      'Device Setup & Tech Orientation',
    ],
  },
  {
    id: 'smartHome',
    category: 'Smart Home & Pro Systems',
    eyebrow: 'Full Installations',
    badge: null,
    featured: false,
    startingAt: 'From $250',
    customQuote: false,
    services: [
      'Whole-Home Automation (HomeKit/Google/Alexa)',
      'Smart Home Consultation',
      'Access Control Systems',
      'STR / Airbnb Full Tech Package',
      'Business Tech Setup',
    ],
  },
]

const PLANS_DATA = [
  {
    name: 'Connect Care',
    price: '$29',
    period: '/mo',
    annual: 'or $299/yr',
    perks: [
      'Priority scheduling',
      '10% off all labor',
      'Annual remote check-in',
      'Dedicated support line',
    ],
  },
  {
    name: 'Secure Care',
    price: '$59',
    period: '/mo',
    annual: 'or $599/yr',
    perks: [
      'All Connect Care benefits',
      'Annual on-site inspection',
      'Firmware & software updates',
      'Camera health monitoring',
    ],
  },
  {
    name: 'Command Care',
    price: '$99',
    period: '/mo',
    annual: 'or $999/yr',
    perks: [
      'All Secure Care benefits',
      'Quarterly on-site visits',
      '24-hour response guarantee',
      'Full system optimization',
    ],
  },
]

const TRUST_ITEMS = [
  { icon: '⚡', title: 'Same-Week Availability', sub: 'Fast scheduling, no long waits' },
  { icon: '🔒', title: 'Licensed & Insured', sub: 'Fully covered for your peace of mind' },
  { icon: '⭐', title: '5-Star Rated', sub: 'Consistent excellence, every visit' },
  { icon: '🏠', title: 'Locally Owned', sub: 'Proud to serve Greater St. Augustine' },
]

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const openModal = useCallback(() => setModalOpen(true), [])

  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle('lp-nav--scrolled', window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* ── FLOATING NAV ── */}
      <nav ref={navRef} className="lp-nav">
        <div className="logo-wrap">
          <Image
            src="/logo.png"
            alt="Ament"
            width={72}
            height={72}
            priority
            style={{ borderRadius: 6, background: '#fff', padding: 3, objectFit: 'contain' }}
          />
          <div className="logo-text">
            <span className="brand">AMENT</span>
            <span className="tagline">Home &amp; Tech Services</span>
          </div>
        </div>
        <div className="lp-nav-links">
          <a href="#services">Services</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#care-plans">Care Plans</a>
          <a href="tel:+14079208035">(407) 920-8035</a>
        </div>
        <button className="lp-nav-cta" onClick={openModal}>
          Get a Quote
        </button>
      </nav>

      {/* ── SCROLL VIDEO HERO ── */}
      <ScrollVideoSection
        frameDir="/frames/house"
        frameCount={121}
        title={<>CCTV & Smart Home<br />Specialists</>}
        body="From professional security camera systems to AI-powered home automation — Ament delivers expert technology upgrades to homes and businesses across St. Augustine."
        onBook={openModal}
        showScrollCue
        isHero
      />

      {/* ── SCROLL VIDEO SECTION 2 ── */}
      <ScrollVideoSection
        frameDir="/frames/devices"
        frameCount={121}
        title={<>Every Device,<br />One Ecosystem</>}
        body="From your doorbell to your thermostat, Ament connects your home's technology into a single intelligent system — installed right, the first time."
        onBook={openModal}
      />

      {/* ── TRUST STRIP ── */}
      <div className="lp-trust">
        <div className="lp-trust-inner">
          {TRUST_ITEMS.map(item => (
            <div key={item.title} className="lp-trust-item">
              <div className="lp-trust-icon">{item.icon}</div>
              <div className="lp-trust-text">
                <strong>{item.title}</strong>
                <span>{item.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERVICES ── */}
      <section className="lp-services" id="services">
        <div className="lp-section-inner">
          <div className="reveal">
            <div className="lp-eyebrow">What We Do</div>
            <h2 className="lp-section-title">Security, Automation<br />&amp; Everything In Between</h2>
            <p className="lp-section-sub">
              CCTV installation and AI automation are our flagship services — backed by a full catalog of smart home and connectivity work. Get a custom quote scoped to your property.
            </p>
          </div>
          <div className="lp-tier-bento lp-tier-bento--2col">
            {SERVICES_DATA.map((svc, i) => (
              <div
                key={svc.id}
                className={`lp-tier-card${svc.featured ? ' lp-tier-card--featured' : ''} reveal reveal-delay-${i + 1}`}
              >
                <div className="lp-tier-card-header">
                  {svc.badge && <div className="lp-tier-featured-badge">{svc.badge}</div>}
                  <div className="lp-tier-number">{svc.eyebrow}</div>
                  <div className="lp-tier-name">{svc.category}</div>
                </div>
                <div className="lp-tier-card-body">
                  <ul className="lp-tier-list">
                    {svc.services.map(s => <li key={s}>{s}</li>)}
                  </ul>
                  <button className="lp-tier-cta" onClick={openModal}>
                    Get a Free Quote →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-hiw" id="how-it-works">
        <div className="lp-section-inner">
          <div className="reveal lp-hiw-header">
            <div className="lp-eyebrow">Simple Process</div>
            <h2 className="lp-section-title">From Request<br />to Installation</h2>
            <p className="lp-section-sub lp-section-sub--center">
              Two steps — that&apos;s it.
            </p>
          </div>
          <div className="lp-hiw-steps lp-hiw-steps--two">
            {[
              {
                n: '1',
                title: 'Describe Your Project',
                desc: 'Answer a short questionnaire about your property and what you need. Our smart form scopes the job so we arrive prepared — no surprises.',
              },
              {
                n: '2',
                title: 'We Install. You Relax.',
                desc: 'Sarah will call within 24 hours to confirm your appointment. Our tech arrives on time, installs everything correctly, and walks you through it.',
              },
            ].map((step, i) => (
              <div key={step.n} className={`lp-hiw-step reveal reveal-delay-${i + 1}`}>
                <div className="lp-hiw-number">{step.n}</div>
                <h3 className="lp-hiw-step-title">{step.title}</h3>
                <p className="lp-hiw-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARE PLANS ── */}
      <section className="lp-plans" id="care-plans">
        <div className="lp-section-inner">
          <div className="reveal">
            <div className="lp-eyebrow lp-eyebrow--light">Ongoing Support</div>
            <h2 className="lp-section-title lp-section-title--light">Protect Your Investment</h2>
            <p className="lp-section-sub lp-section-sub--light">
              Keep your smart home running perfectly with an Ament Care Plan.
              Priority service, proactive check-ins, cancel any time.
            </p>
          </div>
          <div className="lp-plans-grid">
            {PLANS_DATA.map((plan, i) => (
              <div key={plan.name} className={`lp-plan-card reveal reveal-delay-${i + 1}`}>
                <div className="lp-plan-name">{plan.name}</div>
                <div className="lp-plan-price">
                  {plan.price}<span className="lp-plan-period">{plan.period}</span>
                </div>
                <div className="lp-plan-annual">{plan.annual}</div>
                <ul className="lp-plan-perks">
                  {plan.perks.map(p => <li key={p}>{p}</li>)}
                </ul>
                <button className="lp-plan-cta" onClick={openModal}>
                  Get Started →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="lp-cta">
        <div className="lp-cta-inner reveal">
          <h2 className="lp-cta-title">
            Ready to Upgrade<br />
            <em>Your Home?</em>
          </h2>
          <p className="lp-cta-sub">
            Join St. Augustine homeowners and businesses who trust Ament for
            expert CCTV installation, smart home automation, and tech support.
          </p>
          <div className="lp-cta-actions">
            <button className="lp-btn-primary-dark" onClick={openModal}>
              Get a Free Quote →
            </button>
            <a href="tel:+14079208035" className="lp-btn-ghost-dark">
              Call (407) 920-8035
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-section-inner">
          <div className="lp-footer-grid">
            <div>
              <div className="lp-footer-brand-name">AMENT</div>
              <div className="lp-footer-brand-tag">Home &amp; Tech Services</div>
              <p className="lp-footer-tagline">
                Expert CCTV installation, AI home automation, and smart home technology
                serving Greater St. Augustine, Florida.
              </p>
            </div>
            <div>
              <div className="lp-footer-col-title">Services</div>
              <ul className="lp-footer-links">
                <li><a href="#services">Security & Surveillance</a></li>
                <li><a href="#services">Smart Automation & AI</a></li>
                <li><a href="#services">Connectivity & Setup</a></li>
                <li><a href="#care-plans">Care Plans</a></li>
              </ul>
            </div>
            <div>
              <div className="lp-footer-col-title">Contact</div>
              <ul className="lp-footer-links">
                <li><a href="tel:+14079208035">(407) 920-8035</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li>St. Augustine, FL 32080</li>
              </ul>
            </div>
          </div>
          <hr className="lp-footer-divider" />
          <div className="lp-footer-bottom">
            <span>© 2025 Ament Home &amp; Tech Services · Licensed &amp; Insured</span>
            <span>Smarter Living, Made Simple.</span>
          </div>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      <BookingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
