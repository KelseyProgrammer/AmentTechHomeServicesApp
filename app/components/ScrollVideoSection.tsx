'use client'

import { memo, useEffect, useRef } from 'react'

interface Props {
  frameDir:       string
  frameCount:     number
  eyebrow?:       string
  title:          React.ReactNode
  body:           React.ReactNode
  onBook?:        () => void
  ctaLabel?:      string
  showScrollCue?: boolean
  isHero?:        boolean
}

function ScrollVideoSection({
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
  const containerRef  = useRef<HTMLDivElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    // alpha:false — browser skips alpha compositing, meaningful perf gain on canvas
    const ctx = canvas?.getContext('2d', { alpha: false })
    if (!canvas || !ctx) return

    // ── Mobile guard ────────────────────────────────────────────────────────────
    // 242 ImageBitmaps (121 frames × 2 sections) ≈ 2 GB uncompressed — crashes
    // iOS Safari. Touch/mobile devices get the dark background + text only.
    const isMobile = window.matchMedia('(hover: none), (max-width: 768px)').matches
    if (isMobile) return

    // Medium smoothing is visually identical for video frames but faster than 'high'
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'medium'

    // ── Frame loading ───────────────────────────────────────────────────────────
    const bitmaps: ImageBitmap[] = new Array(frameCount)
    let loadedCount = 0
    let ready       = false
    let loadStarted = false
    let destroyed   = false   // prevents callbacks from firing after unmount

    function startFrameLoad() {
      if (loadStarted) return
      loadStarted = true

      for (let i = 1; i <= frameCount; i++) {
        const n    = String(i).padStart(3, '0')
        // Priority hint: frame 1 loads first so canvas reveals immediately
        const opts = i === 1 ? ({ priority: 'high' } as RequestInit) : {}

        fetch(`${frameDir}/frame_${n}.jpg`, opts)
          .then(r => r.blob())
          .then(blob => createImageBitmap(blob))
          .then(bmp => {
            if (destroyed) { bmp.close(); return }
            bitmaps[i - 1] = bmp
            loadedCount++

            if (!ready) {
              // ✦ Show canvas as soon as the very first frame arrives
              ready = true
              sizeCanvas()
              drawFrame(currentProgress)
              const wrap = canvasWrapRef.current
              if (wrap) wrap.style.opacity = '1'
            } else {
              // Redraw only if this newly decoded frame is the exact target
              const targetIdx = Math.round(currentProgress * (frameCount - 1))
              if (i - 1 === targetIdx) {
                lastDrawIdx = -1
                drawFrame(currentProgress)
              }
            }
          })
          .catch(() => { /* individual frame failures are silent */ })
      }
    }

    // Hero: load immediately. Other sections: defer until 150vh away.
    let loadObserver: IntersectionObserver | null = null
    if (isHero) {
      startFrameLoad()
    } else {
      loadObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            startFrameLoad()
            loadObserver?.disconnect()
            loadObserver = null
          }
        },
        { rootMargin: '150% 0px' }
      )
      if (containerRef.current) loadObserver.observe(containerRef.current)
    }

    // ── Canvas sizing ───────────────────────────────────────────────────────────
    function sizeCanvas() {
      if (!canvas) return
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      dimCache.cw   = 0  // invalidate draw-dimension cache on resize
    }

    // ── Cover-fit cache — recalculate only when canvas or bitmap size changes ──
    const dimCache = { cw: 0, ch: 0, bw: 0, bh: 0, dx: 0, dy: 0, dw: 0, dh: 0 }
    let lastDrawIdx = -1

    function drawFrame(progress: number) {
      if (!ready || !canvas || !ctx) return

      const targetIdx = Math.round(progress * (frameCount - 1))

      // Use target frame if loaded, else find nearest available
      let bmp     = bitmaps[targetIdx]
      let drawIdx = targetIdx
      if (!bmp) {
        for (let d = 1; d < frameCount; d++) {
          if (targetIdx - d >= 0 && bitmaps[targetIdx - d]) {
            bmp = bitmaps[targetIdx - d]; drawIdx = targetIdx - d; break
          }
          if (targetIdx + d < frameCount && bitmaps[targetIdx + d]) {
            bmp = bitmaps[targetIdx + d]; drawIdx = targetIdx + d; break
          }
        }
      }
      if (!bmp) return
      if (drawIdx === lastDrawIdx) return   // nothing changed — skip paint
      lastDrawIdx = drawIdx

      const cw = canvas.width
      const ch = canvas.height

      // Recompute cover-fit only when dimensions change
      if (cw !== dimCache.cw || ch !== dimCache.ch || bmp.width !== dimCache.bw || bmp.height !== dimCache.bh) {
        const scale   = Math.max(cw / bmp.width, ch / bmp.height)
        dimCache.cw   = cw;  dimCache.ch = ch
        dimCache.bw   = bmp.width;  dimCache.bh = bmp.height
        dimCache.dw   = bmp.width  * scale
        dimCache.dh   = bmp.height * scale
        dimCache.dx   = (cw - dimCache.dw) / 2
        dimCache.dy   = (ch - dimCache.dh) / 2
      }

      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(bmp, dimCache.dx, dimCache.dy, dimCache.dw, dimCache.dh)
    }

    // ── Scroll handler ──────────────────────────────────────────────────────────
    let currentProgress = 0
    let rafPending      = false
    let visible         = false
    let containerTop    = 0
    let scrollableHeight = 0

    function updateDimensions() {
      const container = containerRef.current
      if (!container) return
      const rect    = container.getBoundingClientRect()
      containerTop     = rect.top + window.scrollY
      scrollableHeight = container.offsetHeight - window.innerHeight
    }

    function paint() {
      rafPending = false
      if (destroyed) return
      drawFrame(currentProgress)
      const bar = progressBarRef.current
      if (bar) bar.style.transform = `scaleX(${currentProgress})`
    }

    function onScroll() {
      if (!visible || scrollableHeight === 0) return
      const scrolled  = window.scrollY - containerTop
      currentProgress = Math.min(1, Math.max(0, scrolled / scrollableHeight))
      if (!rafPending) {
        rafPending = true
        requestAnimationFrame(paint)
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) onScroll()
      },
      { threshold: 0 }
    )
    if (containerRef.current) io.observe(containerRef.current)

    const ro = new ResizeObserver(() => {
      lastDrawIdx = -1
      sizeCanvas()
      updateDimensions()
      drawFrame(currentProgress)
    })
    ro.observe(canvas)

    updateDimensions()
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      destroyed = true
      loadObserver?.disconnect()
      window.removeEventListener('scroll', onScroll)
      ro.disconnect()
      io.disconnect()
      bitmaps.forEach(bmp => bmp?.close())
    }
  }, [frameDir, frameCount, isHero])

  const Heading = isHero ? 'h1' : 'h2'

  return (
    <div ref={containerRef} style={{ height: '300vh', position: 'relative' }}>
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 60% 40%, #1a2d47 0%, #04090f 70%)',
      }}>

        {/* ── Canvas ── */}
        <div
          ref={canvasWrapRef}
          style={{ position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 1s ease', willChange: 'transform', transform: 'translateZ(0)' }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* ── Scrim: base tint ── */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'rgba(4,9,15,0.18)' }} />

        {/* ── Scrim: bottom gradient ── */}
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
          <div style={{
            width: 32, height: 2,
            background: 'var(--gold)',
            margin: '0 auto 22px',
            borderRadius: 1,
            boxShadow: '0 0 10px rgba(184,155,110,0.5)',
          }} />
          <div style={{
            fontFamily: 'Lato, sans-serif', fontSize: 11, fontWeight: 700,
            letterSpacing: '5px', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: 20,
            textShadow: '0 1px 8px rgba(0,0,0,1)',
          }}>
            {eyebrow}
          </div>
          <Heading style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 'clamp(42px, 6.5vw, 84px)',
            fontWeight: 700, color: '#fff', lineHeight: 1.04,
            margin: '0 0 24px', letterSpacing: '-0.5px',
            textShadow: '0 2px 2px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.9), 0 12px 48px rgba(0,0,0,0.7)',
          }}>
            {title}
          </Heading>
          <p style={{
            fontFamily: 'Lato, sans-serif', fontSize: 17,
            color: 'rgba(255,255,255,0.92)', lineHeight: 1.8, fontWeight: 300,
            margin: '0 auto', maxWidth: 540,
            textShadow: '0 1px 6px rgba(0,0,0,1), 0 4px 20px rgba(0,0,0,0.95)',
          }}>
            {body}
          </p>
          {onBook && (
            <div style={{ marginTop: 36, pointerEvents: 'auto' }}>
              <button
                onClick={onBook}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '15px 42px', background: 'var(--gold)', color: '#fff',
                  fontFamily: 'Lato, sans-serif', fontSize: 12, fontWeight: 700,
                  letterSpacing: '2.5px', textTransform: 'uppercase',
                  border: 'none', borderRadius: 3, cursor: 'pointer',
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
            position: 'absolute', top: '14%', right: 44,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 10, pointerEvents: 'none',
          }}>
            <div style={{
              width: 1, height: 52,
              background: 'linear-gradient(to bottom, transparent, rgba(184,155,110,0.9))',
              animation: 'svsPulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'Lato, sans-serif', fontSize: 9,
              letterSpacing: '3px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.45)', writingMode: 'vertical-rl',
            }}>Scroll</span>
          </div>
        )}

        {/* ── Progress bar ── */}
        <div
          ref={progressBarRef}
          style={{
            position: 'absolute', bottom: 0, left: 0,
            height: 2, width: '100%',
            background: 'linear-gradient(90deg, var(--gold), var(--gold-light))',
            transform: 'scaleX(0)',
            transformOrigin: 'left center',
            willChange: 'transform',
          }}
        />
      </div>
    </div>
  )
}

export default memo(ScrollVideoSection)
