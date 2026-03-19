'use client'

import Image from 'next/image'
import BookingWizard from '../components/BookingWizard'

export default function BookPage() {
  return (
    <>
      <header>
        <div className="header-inner">
          <div className="logo-wrap">
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
          </div>
          <div className="header-cta">
            <a href="tel:+14079208035" className="phone-link">📞 (407) 920-8035</a>
          </div>
        </div>
      </header>

      <div className="hero">
        <h1>
          Expert Smart Home &amp; Tech Services<br />
          <em>for Greater St. Augustine</em>
        </h1>
        <p>From TV mounting to whole-home automation — we make your technology work for you.</p>
        <div className="hero-badges">
          <span className="badge">⚡ Same-Week Availability</span>
          <span className="badge">🔒 Licensed &amp; Insured</span>
          <span className="badge">⭐ 5-Star Rated</span>
          <span className="badge">🏠 Locally Owned</span>
        </div>
      </div>

      <BookingWizard />

      <footer>
        <p>© 2025 Ament Home &amp; Tech Services · Greater St. Augustine, FL · <a href="tel:+14079208035">(407) 920-8035</a></p>
        <p style={{ marginTop: 6 }}>Licensed &amp; Insured · Smarter Living, Made Simple.</p>
      </footer>
    </>
  )
}
