import { useRef } from 'react'
import type { ImageKey } from '../../data/images'
import { gsap, useGSAP } from '../../lib/gsap'
import { Img } from '../ui/Img'
import { MagneticButton } from '../ui/Magnetic'
import { SectionLabel } from '../ui/SectionLabel'
import { SplitText } from '../ui/SplitText'

export type Look = {
  image: ImageKey
  caption: string
  time: string
  /** Grid placement in the 12-column magazine layout. */
  cls: string
  /** Crop of the photograph. */
  frame: string
  speed: number
}

export const LOOKS: Look[] = [
  { image: 'jacketBrick', caption: 'Brick & black', time: '08:12', cls: 'col-span-12 md:col-span-7', frame: 'aspect-[4/5] md:aspect-[5/6]', speed: -4 },
  { image: 'teeMan', caption: 'Hour Tee, platform 2', time: '08:40', cls: 'col-span-7 md:col-span-4 md:col-start-9 md:mt-48', frame: 'aspect-[3/4]', speed: 14 },
  { image: 'towers', caption: 'Lift lobby', time: '10:05', cls: 'z-10 col-span-5 mt-24 md:col-span-3 md:col-start-6 md:-mt-40', frame: 'aspect-[3/4]', speed: 22 },
  { image: 'street', caption: 'Crossing, no hurry', time: '12:30', cls: 'col-span-12 md:mt-24', frame: 'aspect-[16/10] md:aspect-[21/9]', speed: -6 },
  { image: 'seated', caption: 'Studio, late light', time: '17:55', cls: 'col-span-6 md:col-span-4 md:col-start-2 md:mt-24', frame: 'aspect-[3/4]', speed: 10 },
  { image: 'leather', caption: 'Lift Jacket, detail', time: '19:20', cls: 'col-span-6 mt-20 md:col-span-3 md:mt-56', frame: 'aspect-square', speed: 24 },
  { image: 'cityNight', caption: 'Walking home', time: '23:47', cls: 'col-span-12 md:col-span-6 md:col-start-7 md:-mt-16', frame: 'aspect-[4/5] md:aspect-[4/3]', speed: -8 },
]

/** Magazine spread: mixed crops, overlaps and each frame drifting at its own depth. */
export function Lookbook({ looks = LOOKS, label = true }: { looks?: Look[]; label?: boolean }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('[data-look]').forEach((el) => {
        const speed = Number(el.dataset.look)
        gsap.fromTo(el, { yPercent: speed * 0.5 }, { yPercent: -speed * 0.5, ease: 'none', scrollTrigger: { trigger: el, scrub: true } })
        const frame = el.querySelector('[data-frame]')
        gsap.fromTo(
          frame,
          { clipPath: 'inset(12% 8% 12% 8%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 35%', scrub: true } },
        )
        gsap.fromTo(
          el.querySelector('img'),
          { scale: 1.35 },
          { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative bg-fog py-28 md:py-44">
      {label && (
        <div className="gutter mb-20 flex flex-col justify-between gap-8 md:mb-32 md:flex-row md:items-end">
          <div>
            <SectionLabel index="05" title="Lookbook — Issue 01" />
            <h2 className="display mt-8 text-[clamp(3rem,8vw,8.5rem)]">
              <SplitText text="A day," className="block" />
              <SplitText text="photographed." className="block" italicWords={['photographed.']} delay={0.15} />
            </h2>
          </div>
          <MagneticButton to="/lookbook" variant="dark">
            Open the lookbook
          </MagneticButton>
        </div>
      )}

      <div className="gutter grid grid-cols-12 gap-x-3 gap-y-10 md:gap-x-6 md:gap-y-0">
        {looks.map((l, i) => (
          <figure key={i} data-look={l.speed} className={`relative ${l.cls}`}>
            <div data-frame className={`relative overflow-hidden ${l.frame}`} data-cursor="Look">
              <Img image={l.image} alt={l.caption} className="absolute inset-0 h-full w-full" sizes="(min-width: 768px) 60vw, 100vw" />
            </div>
            <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-[0.7rem] text-charcoal/70">
              <span className="eyebrow text-[0.6rem] tabular-nums">
                <span className="text-accent">●</span> Look {String(i + 1).padStart(2, '0')} — {l.time}
              </span>
              <span className="italic">{l.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
