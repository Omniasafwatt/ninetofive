import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { Img } from '../ui/Img'
import { Reveal } from '../ui/Reveal'
import { SectionLabel } from '../ui/SectionLabel'

const CALLOUTS = [
  { k: '480 GSM', v: 'Loopback cotton, heavy enough to hold its shape at 11pm.', pos: 'top-[16%] left-[6%]' },
  { k: '3 mm', v: 'Double-needle stitching at every stress point.', pos: 'top-[22%] right-[6%]' },
  { k: '1 thread', v: 'One accent colour, used once — a bar-tack you find by touch.', pos: 'bottom-[18%] left-[10%]' },
  { k: '30 washes', v: 'Enzyme washed and pre-shrunk. It softens, it never slackens.', pos: 'bottom-[14%] right-[8%]' },
]

/**
 * A small swatch pinned in the centre grows until the weave fills the whole screen,
 * then the specification callouts drift in around it like tailor's notes.
 */
export function FabricDetail() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '[data-fabric-pin]', start: 'top top', end: '+=180%', pin: true, scrub: 1 },
        })
        tl.fromTo('[data-swatch]', { width: '24vw', height: '30vh' }, { width: '100vw', height: '100vh', ease: 'power2.inOut', duration: 1 })
          .fromTo('[data-swatch] img', { scale: 2.2 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
          .to('[data-fabric-title]', { opacity: 0, scale: 0.9, duration: 0.4 }, 0)
          .fromTo('[data-callout]', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.3 }, 0.75)
          .to({}, { duration: 0.3 })
      })
      mm.add('(max-width: 767px)', () => {
        gsap.fromTo('[data-swatch] img', { scale: 1.6 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-swatch]', scrub: true } })
      })
      gsap.utils.toArray<HTMLElement>('[data-zoom]').forEach((el) => {
        gsap.fromTo(el.querySelector('img'), { scale: 1.5 }, { scale: 1.05, ease: 'none', scrollTrigger: { trigger: el, scrub: true } })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative bg-ink text-paper">
      <div data-fabric-pin className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden py-24 md:h-screen md:py-0">
        <div data-fabric-title className="gutter pointer-events-none absolute inset-x-0 top-24 z-10 text-center md:top-[7%]">
          <div className="flex justify-center">
            <SectionLabel index="06" title="Fabric" light />
          </div>
          <h2 className="display mx-auto mt-6 max-w-[14ch] text-[clamp(2.8rem,6vw,6.5rem)] leading-[0.9]">
            Close enough <span className="italic">to feel it.</span>
          </h2>
        </div>
        <div data-swatch className="relative mt-56 h-[60vh] w-[88vw] overflow-hidden md:mt-0">
          <Img image="knit" alt="Extreme close-up of heavyweight knit fabric" className="h-full w-full" sizes="100vw" />
          <div className="absolute inset-0 bg-ink/35" />
        </div>
        {CALLOUTS.map((c) => (
          <div key={c.k} data-callout className={`absolute hidden max-w-[240px] md:block ${c.pos}`}>
            <div className="mb-3 flex items-center gap-3">
              <span className="pulse-dot size-2 rounded-full bg-accent" />
              <span className="stitch w-16" />
            </div>
            <p className="display text-5xl">{c.k}</p>
            <p className="mt-2 text-sm leading-relaxed text-paper/75">{c.v}</p>
          </div>
        ))}
      </div>

      {/* Mobile callouts */}
      <div className="gutter grid gap-8 pb-16 md:hidden">
        {CALLOUTS.map((c) => (
          <Reveal key={c.k}>
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-accent" />
              <span className="stitch w-12" />
            </div>
            <p className="display mt-3 text-5xl">{c.k}</p>
            <p className="mt-2 text-sm text-paper/70">{c.v}</p>
          </Reveal>
        ))}
      </div>

      <div className="gutter grid grid-cols-2 gap-3 pb-28 md:grid-cols-3 md:gap-6 md:pb-44 md:pt-10">
        {(
          [
            ['hangingSoft', 'Sleeve, pressed'],
            ['denimStack', 'Twill, stacked'],
            ['capHands', 'Hands, pockets'],
          ] as const
        ).map(([img, label], i) => (
          <figure key={img} className={i === 2 ? 'col-span-2 md:col-span-1' : ''}>
            <div data-zoom className="group overflow-hidden" data-cursor="Zoom">
              <Img
                image={img}
                alt={label}
                className={i === 2 ? 'aspect-[16/10] md:aspect-[3/4]' : 'aspect-[3/4]'}
                imgClassName="transition-[scale] duration-[1600ms] ease-lux group-hover:scale-[1.25]"
                sizes="33vw"
              />
            </div>
            <figcaption className="eyebrow mt-3 flex justify-between text-[0.6rem] text-paper/50">
              <span>0{i + 1}</span>
              <span>{label}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
