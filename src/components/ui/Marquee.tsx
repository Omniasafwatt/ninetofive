import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'

type Props = {
  items: string[]
  className?: string
  speed?: number
  reverse?: boolean
}

/**
 * Endless type band. Base drift runs on CSS; scroll velocity skews and accelerates it
 * through a single GSAP quickTo so it feels physically connected to the page.
 */
export function Marquee({ items, className = '', speed = 40, reverse }: Props) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const track = root.current?.querySelector<HTMLElement>('[data-track]')
      if (!track) return
      const skew = gsap.quickTo(track, 'skewX', { duration: 0.6, ease: 'power3' })
      let last = window.scrollY
      const onScroll = () => {
        const v = window.scrollY - last
        last = window.scrollY
        skew(gsap.utils.clamp(-8, 8, v * -0.25))
        track.style.animationDuration = `${Math.max(12, speed - Math.abs(v) * 0.6)}s`
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    },
    { scope: root },
  )

  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-[0.35em]">{t}</span>
          <span className="mx-[0.35em] inline-block size-[0.14em] rounded-full bg-accent" />
        </span>
      ))}
    </div>
  )

  return (
    <div ref={root} className={`relative flex overflow-hidden select-none ${className}`} aria-hidden>
      <div
        data-track
        className="flex w-max will-change-transform"
        style={{ animation: `marquee ${speed}s linear infinite`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {row}
        {row}
      </div>
    </div>
  )
}
