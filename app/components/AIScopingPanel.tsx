'use client'

import { useState } from 'react'

type Props = {
  onBriefGenerated: (brief: string) => void
}

const PRIORITY_OPTIONS = [
  'Reliability',
  'Ease of use',
  'Privacy / local control',
  'Expandability',
  'Speed of setup',
]

export default function AIScopingPanel({ onBriefGenerated }: Props) {
  const [description, setDescription] = useState('')
  const [size, setSize] = useState('')
  const [platform, setPlatform] = useState('')
  const [priorities, setPriorities] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [brief, setBrief] = useState('')
  const [error, setError] = useState('')

  function togglePriority(p: string) {
    setPriorities(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  async function generate() {
    if (!description.trim()) {
      setError('Please describe your project first.')
      return
    }
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/ai-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, size, platform, priorities }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to generate brief.')
      setBrief(data.brief)
      onBriefGenerated(data.brief)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="ai-scoping-panel">
      <h3>🤖 AI Project Scoping</h3>
      <p style={{ fontSize: 14, color: 'var(--text-mid)', marginBottom: 20 }}>
        Answer a few quick questions and we&apos;ll generate a project brief for Sarah before your consultation.
      </p>

      <div className="form-group full" style={{ marginBottom: 16 }}>
        <label>Describe what you&apos;d like to automate or improve *</label>
        <textarea
          rows={4}
          placeholder="E.g. I want my home to automatically adjust lighting, temperature, and security when I leave for work..."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="form-group">
          <label>Home / Office Size</label>
          <select value={size} onChange={e => setSize(e.target.value)}>
            <option value="">Select size...</option>
            <option>Studio</option>
            <option>1–2 Bedrooms</option>
            <option>3–4 Bedrooms</option>
            <option>5+ Bedrooms</option>
            <option>Small Office</option>
            <option>Large Office</option>
          </select>
        </div>
        <div className="form-group">
          <label>Current Platform</label>
          <select value={platform} onChange={e => setPlatform(e.target.value)}>
            <option value="">Select platform...</option>
            <option>None yet</option>
            <option>Google Home</option>
            <option>Amazon Alexa</option>
            <option>Apple HomeKit</option>
            <option>Home Assistant</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div className="form-group full" style={{ marginBottom: 20 }}>
        <label>Top Priorities</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
          {PRIORITY_OPTIONS.map(p => (
            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
              <input
                type="checkbox"
                checked={priorities.includes(p)}
                onChange={() => togglePriority(p)}
              />
              {p}
            </label>
          ))}
        </div>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 12 }}>⚠️ {error}</div>}

      <button
        className="generate-brief-btn"
        onClick={generate}
        disabled={generating}
        type="button"
      >
        {generating ? '⏳ Generating…' : '✨ Generate Project Brief'}
      </button>

      {brief && (
        <div className="ai-brief-card">
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--gold-light)' }}>
            Your Project Brief
          </div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{brief}</pre>
        </div>
      )}
    </div>
  )
}
