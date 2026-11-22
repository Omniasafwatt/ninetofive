import { useEffect, useRef, useState } from 'react'
import { useContent } from '../../context/ContentContext'
import { gsap, useGSAP } from '../../lib/gsap'

/**
 * The first impression. A cream room, the wordmark rises letter by letter, a single
 * accent line draws itself underneath while the clock counts 09:00 → 17:00, then
 * everything fades into the showroom.
 */
export function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [hour, setHour] = useState(9)
  const lead = useContent().collections[0]

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [])

  useGSAP(
    () => {
      const counter = { v: 9 }
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: onDone })
      tl.from('[data-letter]', { yPercent: 115, rotate: 6, duration: 1.3, stagger: 0.07 }, 0.15)
        .from('[data-meta]', { opacity: 0, y: 12, duration: 1, stagger: 0.08 }, 0.5)
        .fromTo('[data-line]', { scaleX: 0 }, { scaleX: 1, duration: 1.9, ease: 'power3.inOut' }, 0.55)
        .to(counter, { v: 17, duration: 1.9, ease: 'power3.inOut', onUpdate: () => setHour(Math.round(counter.v)) }, 0.55)
        .to('[data-letter]', { yPercent: -115, duration: 0.9, stagger: 0.04, ease: 'expo.in' }, '+=0.25')
        .to('[data-meta], [data-line]', { opacity: 0, duration: 0.5 }, '<')
        .to(root.current, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, '-=0.35')
    },
    { scope: root },
  )

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-paper text-ink"
      role="status"
      aria-label="Loading 9TO5"
    >
      <div className="relative">
        <h1 className="display flex overflow-hidden text-[clamp(6rem,26vw,24rem)] leading-[0.8]" aria-hidden>
          {'9TO5'.split('').map((l, i) => (
            <span key={i} data-letter className={`inline-block ${l === 'T' || l === 'O' ? 'italic' : ''}`}>
              {l}
            </span>
          ))}
        </h1>
        <div data-line className="mt-4 h-[2px] w-full origin-left bg-accent" />
        <div className="mt-5 flex justify-between gap-6 text-ink/55">
          <span data-meta className="eyebrow">
            {String(hour).padStart(2, '0')}:00
          </span>
          <span data-meta className="eyebrow hidden sm:inline">{lead && `Collection ${lead.number} — ${lead.name}`}</span>
          <span data-meta className="eyebrow">Built for every hour</span>
        </div>
      </div>
    </div>
  )
}
