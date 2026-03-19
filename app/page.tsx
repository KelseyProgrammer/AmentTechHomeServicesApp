'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import BookingModal from './components/BookingModal'
import ScrollVideoSection from './components/ScrollVideoSection'

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES_DATA = [
  {
    number: 'Tier 1',
    name: 'Ament Connect',
    subtitle: 'Entertainment & Connectivity',
    from: 65,
    featured: false,
    services: [
      'TV Mounting & Soundbar Setup',
      'Wi-Fi Router Setup & Optimization',
      'Streaming Device Configuration',
      'Cable Concealment (in-wall/raceway)',
      'Device Setup & Network Connect',
      'Tech Orientation Sessions',
    ],
  },
  {
    number: 'Tier 2',
    name: 'Ament Secure',
    subtitle: 'Security & Smart Access',
    from: 100,
    featured: true,
    services: [
      'Video Doorbell Installation',
      'Exterior Camera Systems',
      'Full 4-Camera Packages',
      'Smart Lock Installation & Setup',
      'Whole-Home Mesh Wi-Fi',
      'Network Security Audit & Hardening',
    ],
  },
  {
    number: 'Tier 3',
    name: 'Ament Command',
    subtitle: 'Full Automation & Pro Systems',
    from: 250,
    featured: false,
    services: [
      'Whole-Home Automation (HomeKit…)',
      'Pro NVR/DVR Camera Systems',
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
  const [scrolled, setScrolled] = useState(false)

  // Solid nav after scrolling past hero
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll-triggered reveal animation
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
      <nav className={`lp-nav ${scrolled ? 'lp-nav--scrolled' : ''}`}>
        <div className="logo-wrap">
          <Image
            src="/logo.png"
            alt="Ament"
            width={48}
            height={48}
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
        <button className="lp-nav-cta" onClick={() => setModalOpen(true)}>
          Book a Service
        </button>
      </nav>

      {/* ── SCROLL VIDEO HERO ── */}
      <ScrollVideoSection
        frameDir="/frames/house"
        frameCount={121}
        title={<>Built Into<br />Every Layer</>}
        body="Behind every wall and above every ceiling, Ament designs smart home systems that disappear into your home — until the moment you need them."
        onBook={() => setModalOpen(true)}
        showScrollCue
        isHero
      />

      {/* ── SCROLL VIDEO SECTION 2 ── */}
      <ScrollVideoSection
        frameDir="/frames/devices"
        frameCount={121}
        title={<>Every Device,<br />One Ecosystem</>}
        body="From your doorbell to your thermostat, Ament connects your home's technology into a single intelligent system — installed right, the first time."
        onBook={() => setModalOpen(true)}
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
            <h2 className="lp-section-title">Services Tailored<br />to Your Home</h2>
            <p className="lp-section-sub">
              Three tiers, one trusted team. Mix and match services across any tier
              to build your perfect installation.
            </p>
          </div>
          <div className="lp-tier-bento">
            {SERVICES_DATA.map((tier, i) => (
              <div
                key={tier.name}
                className={`lp-tier-card${tier.featured ? ' lp-tier-card--featured' : ''} reveal reveal-delay-${i + 1}`}
              >
                <div className="lp-tier-card-header">
                  {tier.featured && <div className="lp-tier-featured-badge">Most Popular</div>}
                  <div className="lp-tier-number">{tier.number}</div>
                  <div className="lp-tier-name">{tier.name}</div>
                  <div className="lp-tier-subtitle">{tier.subtitle}</div>
                </div>
                <div className="lp-tier-card-body">
                  <ul className="lp-tier-list">
                    {tier.services.map(s => <li key={s}>{s}</li>)}
                  </ul>
                  <div className="lp-tier-price-row">
                    <span className="lp-tier-from">From</span>
                    <span className="lp-tier-price">${tier.from}</span>
                    <span className="lp-tier-price-note">per service</span>
                  </div>
                  <button className="lp-tier-cta" onClick={() => setModalOpen(true)}>
                    Book {tier.name} →
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
            <h2 className="lp-section-title">From Inquiry<br />to Installation</h2>
            <p className="lp-section-sub lp-section-sub--center">
              We keep things simple. Three easy steps and your home is upgraded.
            </p>
          </div>
          <div className="lp-hiw-steps">
            {[
              {
                n: '1',
                title: 'Select Your Services',
                desc: 'Browse our service tiers and build your custom installation list. Mix and match anything across all three tiers.',
              },
              {
                n: '2',
                title: 'We Reach Out & Schedule',
                desc: 'Sarah will contact you within 24 hours to confirm your appointment window and answer any questions.',
              },
              {
                n: '3',
                title: 'We Install. You Relax.',
                desc: 'Our expert technician arrives on time, completes the job cleanly, and walks you through everything when finished.',
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
                <button className="lp-plan-cta" onClick={() => setModalOpen(true)}>
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
            Join hundreds of St. Augustine homeowners who trust Ament for
            expert, reliable smart home technology.
          </p>
          <div className="lp-cta-actions">
            <button className="lp-btn-primary-dark" onClick={() => setModalOpen(true)}>
              Book a Service Today →
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
                Expert smart home technology installation and ongoing support
                serving Greater St. Augustine, Florida.
              </p>
            </div>
            <div>
              <div className="lp-footer-col-title">Services</div>
              <ul className="lp-footer-links">
                <li><a href="#services">Ament Connect</a></li>
                <li><a href="#services">Ament Secure</a></li>
                <li><a href="#services">Ament Command</a></li>
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
