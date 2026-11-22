import { useRef } from 'react'
import type { Collection } from '../../data/collections'
import { useAccent } from '../../context/AccentContext'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { Img } from '../ui/Img'
import { MagneticButton } from '../ui/Magnetic'

/**
 * A pinned, horizontally-scrolling chapter per collection. The room changes as you
 * travel: black → the accent flooding in → white — the collection's three colours,
 * told in order. On small screens the same chapters stack vertically.
 */
export function CollectionStory({ collection: c, index = '04', cta = true }: { collection: Collection; index?: string; cta?: boolean }) {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const { setAccent } = useAccent()
  const [first, ...rest] = c.name.split(' ')
  const second = rest.join(' ')
  // Collections can be edited down to fewer paragraphs/photos — fall back gracefully.
  const story = (i: number) => c.story[i] ?? c.story[c.story.length - 1] ?? c.line
  const shot = (i: number) => c.gallery[i] ?? c.gallery[i % Math.max(c.gallery.length, 1)] ?? c.cover
  const gallery = [shot(0), shot(1)]

  useGSAP(
    () => {
      ScrollTrigger.create({ trigger: root.current, start: 'top 60%', end: 'bottom 40%', onToggle: (s) => s.isActive && setAccent(c) })

      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const distance = () => (track.current?.scrollWidth ?? 0) - window.innerWidth
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
        tl.to(track.current, { x: () => -distance(), ease: 'none' }, 0)
          .to(root.current, { backgroundColor: c.accent, color: c.accentInk, ease: 'none', duration: 0.2 }, 0.36)
          .to(root.current, { backgroundColor: '#f6f1ea', color: '#2a1f19', ease: 'none', duration: 0.14 }, 0.8)
          .fromTo('[data-story-word]', { xPercent: 0 }, { xPercent: -12, ease: 'none', duration: 1 }, 0)
          .fromTo('[data-story-img] img', { scale: 1.3 }, { scale: 1, ease: 'none', duration: 1 }, 0)
      })
      mm.add('(max-width: 1023px)', () => {
        gsap.utils.toArray<HTMLElement>('[data-panel]').forEach((panel) => {
          gsap.from(panel, { opacity: 0, y: 60, duration: 1.2, scrollTrigger: { trigger: panel, start: 'top 85%' } })
        })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [c.slug] },
  )

  return (
    <section ref={root} className="relative overflow-hidden bg-ink text-paper" aria-label={`${c.name} story`}>
      <div ref={track} className="flex flex-col lg:h-screen lg:w-max lg:flex-row lg:items-center">
        {/* 1 — Title */}
        <div data-panel className="gutter relative flex min-h-[90svh] shrink-0 flex-col justify-center py-24 lg:h-full lg:w-screen lg:py-0">
          <p className="eyebrow flex items-center gap-4 opacity-60">
            ({index}) <span className="h-px w-12 bg-accent" /> Collection {c.number} — {c.hours}
          </p>
          <h2 data-story-word className="display mt-8 text-[clamp(5rem,17vw,20rem)] leading-[0.8] whitespace-nowrap">
            {first}
            <br />
            <span className="italic">{second}</span>
            <span className="text-accent">.</span>
          </h2>
          <div className="mt-10 flex items-center gap-4">
            <span className="h-[2px] w-24 bg-accent" />
            <p className="eyebrow opacity-70">{c.mood}</p>
          </div>
          <p className="eyebrow absolute right-[3.2vw] bottom-10 hidden opacity-50 lg:block">Keep scrolling →</p>
        </div>

        {/* 2 — Image + first line */}
        <div data-panel className="gutter grid shrink-0 gap-8 py-16 lg:h-full lg:w-[110vw] lg:grid-cols-[1.3fr_1fr] lg:items-center lg:py-0">
          <div data-story-img className="relative h-[70vh] overflow-hidden lg:h-[82vh]">
            <Img image={c.cover} alt={`${c.name} campaign portrait`} className="h-full w-full" sizes="60vw" />
            <span className="eyebrow absolute bottom-4 left-4 rounded-full bg-ink/60 px-3 py-1.5 text-paper backdrop-blur">
              Look {c.number}.01
            </span>
          </div>
          <div className="max-w-md">
            <p className="display text-[clamp(2.2rem,3.6vw,3.8rem)] leading-[1]">{story(0)}</p>
            <div className="stitch mt-10 w-40" />
          </div>
        </div>

        {/* 3 — The accent floods the room */}
        <div data-panel className="gutter flex shrink-0 items-center bg-accent py-24 text-accent-ink lg:h-full lg:w-screen lg:bg-transparent lg:py-0 lg:text-[inherit]">
          <div className="grid w-full gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div className="grid grid-cols-2 gap-3">
              {gallery.map((g, i) => (
                <div key={i} data-story-img className={`overflow-hidden ${i === 1 ? 'mt-16' : ''}`}>
                  <Img image={g} alt="" className="aspect-[3/4]" sizes="25vw" />
                </div>
              ))}
            </div>
            <blockquote className="display text-[clamp(2.4rem,5vw,5.6rem)] leading-[0.95]">
              “{story(1)}”
              <footer className="eyebrow mt-8 font-sans not-italic opacity-70">— {c.accentName}, used once</footer>
            </blockquote>
          </div>
        </div>

        {/* 4 — Back to white: detail + CTA */}
        <div data-panel className="gutter flex shrink-0 items-center bg-paper py-24 text-ink lg:h-full lg:w-[100vw] lg:bg-transparent lg:py-0 lg:text-[inherit]">
          <div className="grid w-full gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div className="grid grid-cols-5 gap-3">
              <div data-story-img className="col-span-3 overflow-hidden">
                <Img image={shot(2)} alt="" className="aspect-[4/5]" sizes="35vw" />
              </div>
              <div data-story-img className="col-span-2 self-end overflow-hidden">
                <Img image={shot(3)} alt="" className="aspect-[3/4]" sizes="25vw" />
              </div>
            </div>
            <div>
              <p className="display text-[clamp(2rem,3.4vw,3.6rem)] leading-[1]">{story(2)}</p>
              {cta && (
                <div className="mt-10 flex flex-wrap gap-3">
                  <MagneticButton to={`/collections/${c.slug}`} variant="accent">
                    Explore {c.name}
                  </MagneticButton>
                  <MagneticButton to="/shop" variant="outline-dark">
                    Shop pieces
                  </MagneticButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
