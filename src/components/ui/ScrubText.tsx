import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'

/** Paragraph whose words light up one by one as the reader scrolls through it. */
export function ScrubText({ text, className = '', accentWords = [] }: { text: string; className?: string; accentWords?: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '[data-w]',
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
        },
      )
    },
    { scope: ref },
  )

  return (
    <p ref={ref} className={className} aria-label={text}>
      {text.split(' ').map((w, i) => {
        const accent = accentWords.includes(w.replace(/[.,]/g, ''))
        return (
          <span key={i} aria-hidden>
            <span data-w className={accent ? 'italic text-accent' : ''}>
              {w}
            </span>{' '}
          </span>
        )
      })}
    </p>
  )
}
