'use client'

import { useEffect, useRef } from 'react'

interface Props {
  frameDir:       string        // e.g. '/frames/house'
  frameCount:     number        // total frames, 1-indexed filenames: frame_001.jpg …
  eyebrow?:       string
  title:          React.ReactNode
  body:           React.ReactNode
  onBook?:        () => void
  ctaLabel?:      string
  showScrollCue?: boolean
  isHero?:        boolean
}

export default function ScrollVideoSection({
  frameDir,
  frameCount,
  eyebrow = 'Ament Home & Tech Services',
  title,
  body,
  onBook,
  ctaLabel = 'Book a Service',
  showScrollCue = false,
  isHero = false,
}: Props) {
  const containerRef   = useRef<HTMLDivElement>(null)
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const canvasWrapRef  = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // ── Preload all frames ─────────────────────────────────────────────────────
    const images: HTMLImageElement[] = []
    let loadedCount = 0
    let ready = false

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image()
      const n   = String(i).padStart(3, '0')
      img.src   = `${frameDir}/frame_${n}.jpg`
      img.onload = () => {
        loadedCount++
        if (loadedCount === frameCount) {
          ready = true
          sizeCanvas()
          drawFrame(0)
          const wrap = canvasWrapRef.current
          if (wrap) wrap.style.opacity = '1'
        }
      }
      images.push(img)
    }

    // ── Canvas sizing ──────────────────────────────────────────────────────────
    function sizeCanvas() {
      if (!canvas) return
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    function drawFrame(progress: number) {
      if (!ready || !canvas || !ctx) return
      const idx = Math.round(progress * (frameCount - 1))
      const img = images[Math.max(0, Math.min(idx, images.length - 1))]
      if (!img.complete) return

      // Cover-fit: fill canvas, center crop
      const cw = canvas.width
      const ch = canvas.height
      const iw = img.naturalWidth
      const ih = img.naturalHeight
      const scale  = Math.max(cw / iw, ch / ih)
      const dw     = iw * scale
      const dh     = ih * scale
      const dx     = (cw - dw) / 2
      const dy     = (ch - dh) / 2

      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(img, dx, dy, dw, dh)
    }

    // ── Scroll + rAF loop ──────────────────────────────────────────────────────
    let targetProgress  = 0
    let currentProgress = 0
    let rafId: number

    function onScroll() {
      const container = containerRef.current
      if (!container) return
      const rect       = container.getBoundingClientRect()
      const scrollable = container.offsetHeight - window.innerHeight
      targetProgress   = Math.min(1, Math.max(0, -rect.top / scrollable))
    }

    function tick() {
      const gap = targetProgress - currentProgress
      if (Math.abs(gap) < 0.001) {
        currentProgress = targetProgress
      } else {
        currentProgress += gap * 0.22
      }

      drawFrame(currentProgress)

      const bar = progressBarRef.current
      if (bar) bar.style.width = `${currentProgress * 100}%`

      rafId = requestAnimationFrame(tick)
    }

    const ro = new ResizeObserver(() => {
      sizeCanvas()
      drawFrame(currentProgress)
    })
    if (canvas) ro.observe(canvas)

    onScroll()
    rafId = requestAnimationFrame(tick)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [frameDir, frameCount])

  const Heading = isHero ? 'h1' : 'h2'

  return (
    <div ref={containerRef} style={{ height: '300vh', position: 'relative' }}>
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        background: '#04090f',
      }}>

        {/* ── Canvas ── */}
        <div
          ref={canvasWrapRef}
          style={{ position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 1s ease' }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* ── Scrim: base tint — just enough to desaturate harsh highlights ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'rgba(4,9,15,0.18)',
        }} />

        {/* ── Scrim: bottom gradient — tight, only covers text zone ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to top, rgba(4,9,15,0.88) 0%, rgba(4,9,15,0.55) 18%, rgba(4,9,15,0.10) 38%, transparent 52%)',
        }} />

        {/* ── Scrim: top edge ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(4,9,15,0.40) 0%, transparent 14%)',
        }} />

        {/* ── Text — anchored bottom-center ── */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: 'min(700px, 86vw)',
          pointerEvents: 'none',
        }}>
          {/* Gold accent line */}
          <div style={{
            width: 32, height: 2,
            background: 'var(--gold)',
            margin: '0 auto 22px',
            borderRadius: 1,
            boxShadow: '0 0 10px rgba(184,155,110,0.5)',
          }} />

          {/* Eyebrow */}
          <div style={{
            fontFamily: 'Lato, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '5px',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: 20,
            textShadow: '0 1px 8px rgba(0,0,0,1)',
          }}>
            {eyebrow}
          </div>

          {/* Heading */}
          <Heading style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(42px, 6.5vw, 84px)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.04,
            margin: '0 0 24px',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 2px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.9), 0 12px 48px rgba(0,0,0,0.7)',
          }}>
            {title}
          </Heading>

          {/* Body */}
          <p style={{
            fontFamily: 'Lato, sans-serif',
            fontSize: 17,
            color: 'rgba(255,255,255,0.92)',
            lineHeight: 1.8,
            fontWeight: 300,
            margin: '0 auto',
            maxWidth: 540,
            textShadow: '0 1px 6px rgba(0,0,0,1), 0 4px 20px rgba(0,0,0,0.95)',
          }}>
            {body}
          </p>

          {/* CTA */}
          {onBook && (
            <div style={{ marginTop: 36, pointerEvents: 'auto' }}>
              <button
                onClick={onBook}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '15px 42px',
                  background: 'var(--gold)',
                  color: '#fff',
                  fontFamily: 'Lato, sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRadius: 3,
                  cursor: 'pointer',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.6)',
                }}
              >
                {ctaLabel} →
              </button>
            </div>
          )}
        </div>

        {/* ── Scroll cue (hero only) ── */}
        {showScrollCue && (
          <div style={{
            position: 'absolute',
            top: '14%',
            right: 44,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            pointerEvents: 'none',
          }}>
            <div style={{
              width: 1, height: 52,
              background: 'linear-gradient(to bottom, transparent, rgba(184,155,110,0.9))',
              animation: 'svsPulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'Lato, sans-serif',
              fontSize: 9,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)',
              writingMode: 'vertical-rl',
            }}>Scroll</span>
          </div>
        )}

        {/* ── Progress bar ── */}
        <div
          ref={progressBarRef}
          style={{
            position: 'absolute',
            bottom: 0, left: 0,
            height: 2, width: '0%',
            background: 'linear-gradient(90deg, var(--gold), var(--gold-light))',
          }}
        />
      </div>
    </div>
  )
}
