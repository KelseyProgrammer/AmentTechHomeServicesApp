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
  const containerRef   = useRef<HTMLDivElement>(null)
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const canvasWrapRef  = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas?.getContext('2d', { alpha: false })
    if (!canvas || !ctx) return

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'low'   // 'low' is visually identical for video frames, faster

    let destroyed = false

    // ── prefers-reduced-motion: show last frame, skip scroll entirely ───────────
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      const n = String(frameCount).padStart(3, '0')
      fetch(`${frameDir}/frame_${n}.jpg`)
        .then(r => r.blob())
        .then(blob => createImageBitmap(blob))
        .then(bmp => {
          if (destroyed) { bmp.close(); return }
          canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
          canvas.height = canvas.offsetHeight * window.devicePixelRatio
          const cw = canvas.width, ch = canvas.height
          const sc = Math.max(cw / bmp.width, ch / bmp.height)
          ctx.drawImage(bmp, (cw - bmp.width * sc) / 2, (ch - bmp.height * sc) / 2, bmp.width * sc, bmp.height * sc)
          const wrap = canvasWrapRef.current
          if (wrap) wrap.style.opacity = '1'
          bmp.close()
        })
        .catch(() => {})
      return () => { destroyed = true }
    }

    // ── Frame step: load every Nth frame only ─────────────────────────────────
    // 121 source frames. At frameStep=4 we load 31 frames — visually identical
    // with nearest-frame fallback, but 4× less memory & network pressure.
    const isMobile  = window.matchMedia('(hover: none), (max-width: 768px)').matches
    const frameStep = isMobile ? 5 : 4

    // ── Build load order: keyframes first, then fill-in ───────────────────────
    // Loading quartile positions first means the animation looks smooth right
    // away while the rest of the frames trickle in.
    const framesToLoad: number[] = []
    const keyPositions = [1, Math.round(frameCount * 0.25), Math.round(frameCount * 0.5), Math.round(frameCount * 0.75), frameCount]
    const keySet = new Set<number>()
    for (const pos of keyPositions) {
      const snapped = Math.max(1, Math.min(frameCount, Math.round((pos - 1) / frameStep) * frameStep + 1))
      if (!keySet.has(snapped)) { keySet.add(snapped); framesToLoad.push(snapped) }
    }
    for (let i = 1; i <= frameCount; i += frameStep) {
      if (!keySet.has(i)) framesToLoad.push(i)
    }

    const bitmaps: ImageBitmap[] = new Array(frameCount)
    let ready       = false
    let loadStarted = false

    // ── Concurrency limiter: max 4 simultaneous fetches ───────────────────────
    // Without this, 31 fetches fire at once and stall the connection pool.
    const CONCURRENCY = 4
    let active = 0
    let queueIdx = 0

    function processQueue() {
      while (active < CONCURRENCY && queueIdx < framesToLoad.length) {
        const frameNum = framesToLoad[queueIdx++]
        active++
        const n    = String(frameNum).padStart(3, '0')
        const isFirst = frameNum === 1
        const opts = isFirst ? ({ priority: 'high' } as RequestInit) : {}

        fetch(`${frameDir}/frame_${n}.jpg`, opts)
          .then(r => r.blob())
          .then(blob => createImageBitmap(blob))
          .then(bmp => {
            if (destroyed) { bmp.close(); return }
            bitmaps[frameNum - 1] = bmp

            if (!ready) {
              ready = true
              sizeCanvas()
              drawFrame(currentProgress)
              const wrap = canvasWrapRef.current
              if (wrap) wrap.style.opacity = '1'
            } else {
              const targetIdx = Math.round(currentProgress * (frameCount - 1))
              if (frameNum - 1 === targetIdx) {
                lastDrawIdx = -1
                drawFrame(currentProgress)
              }
            }
          })
          .catch(() => {})
          .finally(() => {
            active--
            if (!destroyed) processQueue()
          })
      }
    }

    function startFrameLoad() {
      if (loadStarted) return
      loadStarted = true
      processQueue()
    }

    // Hero: load immediately. Others: defer until 120vh away.
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
        { rootMargin: '120% 0px' }
      )
      if (containerRef.current) loadObserver.observe(containerRef.current)
    }

    // ── Canvas sizing ─────────────────────────────────────────────────────────
    function sizeCanvas() {
      if (!canvas) return
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      dimCache.cw   = 0
    }

    // ── Cover-fit cache — skip recalculation unless dimensions change ─────────
    const dimCache = { cw: 0, ch: 0, bw: 0, bh: 0, dx: 0, dy: 0, dw: 0, dh: 0 }
    let lastDrawIdx = -1

    function drawFrame(progress: number) {
      if (!ready || !canvas || !ctx) return

      const targetIdx = Math.round(progress * (frameCount - 1))

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
      if (!bmp || drawIdx === lastDrawIdx) return
      lastDrawIdx = drawIdx

      const cw = canvas.width, ch = canvas.height

      if (cw !== dimCache.cw || ch !== dimCache.ch || bmp.width !== dimCache.bw || bmp.height !== dimCache.bh) {
        const scale = Math.max(cw / bmp.width, ch / bmp.height)
        dimCache.cw = cw; dimCache.ch = ch
        dimCache.bw = bmp.width; dimCache.bh = bmp.height
        dimCache.dw = bmp.width  * scale; dimCache.dh = bmp.height * scale
        dimCache.dx = (cw - dimCache.dw) / 2; dimCache.dy = (ch - dimCache.dh) / 2
      }

      // alpha:false — no clearRect needed; drawImage overwrites every pixel
      ctx.drawImage(bmp, dimCache.dx, dimCache.dy, dimCache.dw, dimCache.dh)
    }

    // ── Scroll → RAF pipeline ─────────────────────────────────────────────────
    let currentProgress = 0
    let rafPending      = false
    let visible         = false
    let containerTop    = 0
    let scrollableHeight = 0

    function updateDimensions() {
      const el = containerRef.current
      if (!el) return
      containerTop     = el.getBoundingClientRect().top + window.scrollY
      scrollableHeight = el.offsetHeight - window.innerHeight
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
      currentProgress = Math.min(1, Math.max(0, (window.scrollY - containerTop) / scrollableHeight))
      if (!rafPending) { rafPending = true; requestAnimationFrame(paint) }
    }

    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; if (visible) onScroll() },
      { threshold: 0 }
    )
    if (containerRef.current) io.observe(containerRef.current)

    const ro = new ResizeObserver(() => {
      lastDrawIdx = -1; sizeCanvas(); updateDimensions(); drawFrame(currentProgress)
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
    // 200vh container = 100vh of scroll-driven animation per section
    <div ref={containerRef} style={{ height: '200vh', position: 'relative' }}>
      <div style={{
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 60% 40%, #1a2d47 0%, #04090f 70%)',
      }}>

        {/* Canvas */}
        <div
          ref={canvasWrapRef}
          style={{
            position: 'absolute', inset: 0, opacity: 0,
            transition: 'opacity 0.8s ease',
            willChange: 'opacity', transform: 'translateZ(0)',
          }}
        >
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', willChange: 'transform', transform: 'translateZ(0)' }} />
        </div>

        {/* Scrim: base tint */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'rgba(4,9,15,0.22)' }} />

        {/* Scrim: strong bottom gradient for text legibility */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to top, rgba(4,9,15,0.94) 0%, rgba(4,9,15,0.7) 20%, rgba(4,9,15,0.18) 42%, transparent 56%)',
        }} />

        {/* Scrim: top edge */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(4,9,15,0.50) 0%, transparent 16%)',
        }} />

        {/* Text — anchored bottom-center */}
        <div style={{
          position: 'absolute', bottom: '9%', left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center', width: 'min(700px, 86vw)',
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 32, height: 2, background: 'var(--gold)',
            margin: '0 auto 20px', borderRadius: 1,
            boxShadow: '0 0 12px rgba(184,155,110,0.6)',
          }} />
          <div style={{
            fontFamily: 'var(--font-lato), sans-serif', fontSize: 11, fontWeight: 700,
            letterSpacing: '5px', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: 18,
            textShadow: '0 1px 10px rgba(0,0,0,1)',
          }}>
            {eyebrow}
          </div>
          <Heading style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 'clamp(40px, 6.5vw, 84px)',
            fontWeight: 700, color: '#fff', lineHeight: 1.05,
            margin: '0 0 22px', letterSpacing: '-0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 6px 24px rgba(0,0,0,1), 0 16px 56px rgba(0,0,0,0.9)',
          }}>
            {title}
          </Heading>
          <p style={{
            fontFamily: 'var(--font-lato), sans-serif', fontSize: 17,
            color: 'rgba(255,255,255,0.95)', lineHeight: 1.8, fontWeight: 300,
            margin: '0 auto', maxWidth: 520,
            textShadow: '0 1px 8px rgba(0,0,0,1), 0 4px 24px rgba(0,0,0,1)',
          }}>
            {body}
          </p>
          {onBook && (
            <div style={{ marginTop: 34, pointerEvents: 'auto' }}>
              <button
                onClick={onBook}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '15px 42px', background: 'var(--gold)', color: '#fff',
                  fontFamily: 'var(--font-lato), sans-serif', fontSize: 12, fontWeight: 700,
                  letterSpacing: '2.5px', textTransform: 'uppercase',
                  border: 'none', borderRadius: 3, cursor: 'pointer',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.7)',
                  transition: 'background 0.2s, transform 0.2s',
                }}
              >
                {ctaLabel} →
              </button>
            </div>
          )}
        </div>

        {/* Scroll cue (hero only) */}
        {showScrollCue && (
          <div style={{
            position: 'absolute', top: '14%', right: 44,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 12, pointerEvents: 'none',
          }}>
            <div style={{
              width: 2, height: 68,
              background: 'linear-gradient(to bottom, transparent, rgba(184,155,110,1))',
              animation: 'svsPulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: 'var(--font-lato), sans-serif', fontSize: 13, fontWeight: 700,
              letterSpacing: '4px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.9)', writingMode: 'vertical-rl',
              textShadow: '0 1px 6px rgba(0,0,0,0.8)',
            }}>Scroll</span>
          </div>
        )}

        {/* Progress bar */}
        <div
          ref={progressBarRef}
          style={{
            position: 'absolute', bottom: 0, left: 0,
            height: 2, width: '100%',
            background: 'linear-gradient(90deg, var(--gold), var(--gold-light))',
            transform: 'scaleX(0)', transformOrigin: 'left center',
            willChange: 'transform',
          }}
        />
      </div>
    </div>
  )
}

export default memo(ScrollVideoSection)
