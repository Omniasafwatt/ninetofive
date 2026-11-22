import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { NAV } from '../../data/nav'
import { useAccent } from '../../context/AccentContext'
import { useClock } from '../../hooks/useClock'
import { gsap, useGSAP } from '../../lib/gsap'

/** Magazine back page: masthead-sized wordmark that rises out of the floor as you arrive. */
export function Footer() {
  const root = useRef<HTMLElement>(null)
  const { hh, mm, ss, label } = useClock()
  const { setAccent } = useAccent()
  const { collections } = useContent()
  const year = new Date().getFullYear()

  useGSAP(
    () => {
      gsap.from('[data-mark] span', {
        yPercent: 100,
        stagger: 0.06,
        ease: 'expo.out',
        duration: 1.6,
        scrollTrigger: { trigger: '[data-mark]', start: 'top 95%' },
      })
    },
    { scope: root },
  )

  return (
    <footer ref={root} className="relative overflow-hidden bg-ink text-paper">
      <div className="gutter grid grid-cols-2 gap-x-6 gap-y-12 pt-24 pb-10 md:grid-cols-12">
        <div className="col-span-2 md:col-span-4">
          <p className="eyebrow mb-6 text-paper/40">Issue 01 — Autumn / Winter</p>
          <p className="display max-w-md text-[clamp(2.4rem,4.5vw,4rem)] leading-[0.95]">
            Same clothes. <span className="italic">Every</span> hour.
          </p>
          <p className="eyebrow mt-8 flex items-center gap-3 tabular-nums text-paper/60">
            <span className="pulse-dot size-1.5 rounded-full bg-accent" />
            {hh}:{mm}:{ss} — {label}
          </p>
        </div>
        <FooterCol title="Index">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="link-underline">
              {n.label}
            </Link>
          ))}
        </FooterCol>
        <FooterCol title="Collections">
          {collections.map((c) => (
            <Link key={c.slug} to={`/collections/${c.slug}`} onMouseEnter={() => setAccent(c)} className="group flex items-center gap-2">
              <span className="size-1.5 rounded-full transition-transform duration-500 group-hover:scale-[2]" style={{ background: c.accent }} />
              <span className="link-underline">
                {c.number} {c.name}
              </span>
            </Link>
          ))}
        </FooterCol>
        <FooterCol title="Service">
          {['Shipping', 'Returns', 'Size guide', 'Care', 'Contact'].map((s) => (
            <a key={s} href="#" className="link-underline">
              {s}
            </a>
          ))}
        </FooterCol>
        <FooterCol title="Elsewhere">
          {['Instagram', 'TikTok', 'Pinterest', 'Spotify'].map((s) => (
            <a key={s} href="#" className="link-underline">
              {s} ↗
            </a>
          ))}
        </FooterCol>
      </div>

      <div className="gutter">
        <div className="stitch opacity-80" />
      </div>

      <div data-mark className="display flex select-none justify-center overflow-hidden pt-4 text-[38vw] leading-[0.8] tracking-[-0.06em]" aria-hidden>
        {'9TO5'.split('').map((l, i) => (
          <span key={i} className={`inline-block ${i === 1 || i === 2 ? 'italic' : ''}`}>
            {l}
          </span>
        ))}
      </div>

      <div className="gutter flex flex-col justify-between gap-3 border-t border-paper/10 py-6 text-[0.7rem] text-paper/40 sm:flex-row">
        <span>© {year} 9TO5 Studio. Built for every hour.</span>
        <span className="flex gap-6">
          <a href="#" className="link-underline">
            Privacy
          </a>
          <a href="#" className="link-underline">
            Terms
          </a>
          <span>Cairo — Lisbon — Everywhere</span>
        </span>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="md:col-span-2">
      <p className="eyebrow mb-5 text-paper/40">{title}</p>
      <div className="flex flex-col items-start gap-2.5 text-sm">{children}</div>
    </div>
  )
}
