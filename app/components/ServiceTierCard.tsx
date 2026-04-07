'use client'

export type Service = { id: string; name: string; price: number }
export type Tier = {
  tag: string
  name: string
  subtitle: string
  startingAt: number
  priceNote: string
  featured?: boolean
  customQuote?: boolean
  services: Service[]
}
export type CartItem = { name: string; price: number }
export type Cart = Record<string, CartItem>

type Props = {
  tier: Tier
  cart: Cart
  onToggle: (id: string, name: string, price: number) => void
  onSelectAll: (tier: Tier) => void
}

export default function ServiceTierCard({ tier, cart, onToggle, onSelectAll }: Props) {
  const isAI = tier.customQuote === true

  return (
    <div
      id={isAI ? 'ai-tier' : undefined}
      className={`tier-card${tier.featured ? ' featured' : ''}${isAI ? ' tier-card--ai' : ''}`}
    >
      {tier.featured && <div className="tier-badge-featured">Most Popular</div>}
      {isAI && <div className="tier-badge-ai">Custom Quote</div>}
      <div className="tier-header">
        <div className="tier-tag">{tier.tag}</div>
        <div className="tier-name">{tier.name}</div>
        <div className="tier-subtitle">{tier.subtitle}</div>
      </div>
      <div className="tier-price">
        {isAI ? (
          <span className="price-note" style={{ fontSize: 15 }}>Custom pricing — scoped to your project</span>
        ) : (
          <>
            <span className="price-from">From</span>
            <span className="price-amount">${tier.startingAt}</span>
            <span className="price-note">{tier.priceNote}</span>
          </>
        )}
      </div>
      <div className="tier-services">
        {tier.services.map(svc => (
          <div
            key={svc.id}
            className={`service-item${cart[svc.id] ? ' selected' : ''}`}
            onClick={() => onToggle(svc.id, svc.name, svc.price)}
          >
            <div className="service-check">{cart[svc.id] ? '✓' : ''}</div>
            <div className="service-name">{svc.name}</div>
            <div className="service-price">{isAI ? 'Custom' : `From $${svc.price.toLocaleString()}`}</div>
          </div>
        ))}
      </div>
      <button
        className="tier-select-btn"
        onClick={() => onSelectAll(tier)}
      >
        Select All {tier.name}
      </button>
    </div>
  )
}
