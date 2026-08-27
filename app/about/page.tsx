import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'About Us — Ament Home & Tech Services',
  description:
    'Ament Tech & Security Services is a family-owned smart home and security installation company serving St. Augustine, Ponte Vedra, Nocatee, and St. Johns County.',
}

const VALUES = [
  { icon: '👨‍👩‍👧', title: 'Family-Owned', sub: 'Husband-and-wife team, raising our family right here in St. Augustine' },
  { icon: '🔒', title: 'Licensed & Insured', sub: 'Professional-grade work, done right and done safely' },
  { icon: '🛡️', title: 'Pro Equipment', sub: 'NDAA-compliant security hardware through our trade distributor — not big-box kit' },
  { icon: '📍', title: 'Truly Local', sub: 'We know these neighborhoods, HOAs, and historic-district rules first-hand' },
]

export default function AboutPage() {
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
            <a href="/careers" className="header-nav-link">Careers</a>
            <a href="tel:+14079208035" className="phone-link">📞 (407) 920-8035</a>
          </div>
        </div>
      </header>

      <div className="hero">
        <h1>
          A Family Business,<br />
          <em>Built in St. Augustine</em>
        </h1>
        <p>
          Behind every Ament install is our family — working to make the homes of our
          neighbors safer, smarter, and simpler.
        </p>
      </div>

      <div className="main">
        <div className="about-grid">
          <div className="about-polaroid">
            <Image
              src="/family.jpeg"
              alt="Chris, Sarah, and their daughter — the Ament family"
              width={960}
              height={958}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div className="about-polaroid-caption">The Aments · St. Augustine, FL</div>
          </div>

          <div className="about-story">
            <p className="section-title" style={{ textAlign: 'left' }}>Meet the Aments</p>
            <p>
              Ament Tech &amp; Security Services is what it looks like: a family business.
              <strong> Christopher Ament</strong> founded the company and handles the hands-on
              side — camera systems, smart home installs, and the technical work in the field.
              <strong> Sarah Ament</strong> co-owns the business and runs everything you see
              before we show up: the website, the booking experience, scheduling, and the
              follow-up that makes sure nothing falls through the cracks.
            </p>
            <p>
              We started Ament because we kept watching neighbors choose between two bad
              options: big-box installers who send a different stranger every time, or wrestling
              with DIY equipment that never quite works. We believed a local family company —
              one that answers its own phone and stands behind its own work — could do better.
            </p>
            <p>
              We&apos;re raising our daughter in the same community we serve. When we install a
              camera system or a smart lock for you, we&apos;re doing it the way we&apos;d do it
              for our own home — because your neighborhood is our neighborhood.
            </p>
          </div>
        </div>

        <div className="about-values">
          {VALUES.map(v => (
            <div key={v.title} className="about-value">
              <div className="about-value-icon">{v.icon}</div>
              <strong>{v.title}</strong>
              <span>{v.sub}</span>
            </div>
          ))}
        </div>

        <div className="about-area">
          <p className="section-title">Where We Work</p>
          <p className="section-sub">
            St. Augustine · Ponte Vedra · Nocatee · Silverleaf · Beacon Lake · Palencia ·
            World Golf Village — all of St. Johns County.
          </p>
          <div className="about-cta-row">
            <a href="/book" className="submit-btn about-cta-btn">Get a Free Quote →</a>
            <a href="/careers" className="submit-btn about-cta-btn about-cta-btn--ghost">Join the Team</a>
          </div>
        </div>
      </div>

      <footer>
        <p>© 2025 Ament Home &amp; Tech Services · Greater St. Augustine, FL · <a href="tel:+14079208035">(407) 920-8035</a></p>
        <p style={{ marginTop: 6 }}>Licensed &amp; Insured · Smarter Living, Made Simple.</p>
      </footer>
    </>
  )
}
