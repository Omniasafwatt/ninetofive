import { useEffect, useRef, useState } from 'react'
import { useFinePointer } from '../../hooks/useMediaQuery'

/**
 * Two-part cursor. The dot is exact; the ring trails, stretches along the direction
 * of travel, and expands into a labelled disc over anything with data-cursor="…".
 * data-cursor="hide" tucks it away (buttons already have their own hover drama).
 */
export function Cursor() {
  const fine = useFinePointer()
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState<string | null>(null)
  const [mode, setMode] = useState<'idle' | 'label' | 'hide' | 'link'>('idle')
  const [down, setDown] = useState(false)

  useEffect(() => {
    if (!fine) return
    document.documentElement.classList.add('has-cursor')
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const pos = { ...target }
    let raf = 0
    let visible = false

    const move = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (!visible && dot.current && ring.current) {
        visible = true
        pos.x = target.x
        pos.y = target.y
        dot.current.style.opacity = '1'
        ring.current.style.opacity = '1'
      }
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor], a, button, input, label, select')
      const value = el?.dataset.cursor
      if (value === 'hide') setMode('hide')
      else if (value) {
        setMode('label')
        setLabel(value)
      } else if (el) setMode('link')
      else setMode('idle')
    }
    const leave = () => {
      visible = false
      if (dot.current) dot.current.style.opacity = '0'
      if (ring.current) ring.current.style.opacity = '0'
    }
    const onDown = () => setDown(true)
    const onUp = () => setDown(false)

    const loop = () => {
      const dx = target.x - pos.x
      const dy = target.y - pos.y
      pos.x += dx * 0.16
      pos.y += dy * 0.16
      const speed = Math.min(Math.hypot(dx, dy) / 180, 0.55)
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI
      if (dot.current) dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`
      if (ring.current)
        ring.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${1 + speed}, ${1 - speed * 0.6})`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [fine])

  if (!fine) return null

  const ringSize = mode === 'label' ? 96 : mode === 'link' ? 56 : mode === 'hide' ? 8 : 34

  return (
    <>
      <div
        ref={ring}
        className={`pointer-events-none fixed left-0 top-0 z-[200] opacity-0 transition-opacity duration-300 ${mode === 'label' ? '' : 'mix-blend-difference'}`}
        aria-hidden
      >
        <div
          className={`flex items-center justify-center rounded-full transition-[width,height,background-color,border-color] duration-500 ease-lux ${
            mode === 'label' ? 'border-transparent bg-accent' : 'border border-white bg-transparent'
          } ${mode === 'hide' ? 'opacity-0' : ''}`}
          style={{ width: ringSize * (down ? 0.85 : 1), height: ringSize * (down ? 0.85 : 1) }}
        />
      </div>
      <div
        ref={dot}
        className={`pointer-events-none fixed left-0 top-0 z-[201] opacity-0 transition-opacity duration-300 ${mode === 'label' ? '' : 'mix-blend-difference'}`}
        aria-hidden
      >
        {mode === 'label' ? (
          <span className="eyebrow block whitespace-nowrap text-[0.6rem] text-accent-ink">{label}</span>
        ) : (
          <span className={`block size-[6px] rounded-full bg-white transition-transform duration-300 ${mode === 'hide' ? 'scale-0' : ''}`} />
        )}
      </div>
    </>
  )
}
