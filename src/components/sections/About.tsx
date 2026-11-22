import { motion } from 'framer-motion'
import type { ImageKey } from '../../data/images'
import { EASE } from '../../lib/gsap'
import { ParallaxImage } from '../ui/Parallax'
import { Reveal } from '../ui/Reveal'
import { ScrubText } from '../ui/ScrubText'
import { SectionLabel } from '../ui/SectionLabel'

const MOMENTS: { hour: string; title: string; image: ImageKey; alt: string; offset: string }[] = [
  { hour: '07:40', title: 'Morning coffee.', image: 'coffee', alt: 'Two coffees on a café table from above', offset: 'md:mt-0' },
  { hour: '09:15', title: 'University.', image: 'corridor', alt: 'A long, quiet office corridor', offset: 'md:mt-40' },
  { hour: '14:30', title: 'Office.', image: 'towers', alt: 'Glass towers seen from street level', offset: 'md:mt-16' },
  { hour: '23:50', title: 'Late-night city walks.', image: 'cityNight', alt: 'A city avenue at night', offset: 'md:mt-56' },
]

export function About() {
  return (
    <section className="relative bg-paper py-28 md:py-44" id="about">
      <div className="gutter">
        <SectionLabel index="01" title="The idea" />
        <ScrubText
          text="9TO5 is built for people who move through different parts of life without changing who they are. Minimal, wearable clothes — with the kind of details you only notice up close."
          accentWords={['without', 'changing']}
          className="display mt-10 max-w-[18ch] text-[clamp(2.6rem,6.6vw,7.4rem)] leading-[0.95] md:mt-16"
        />

        <div className="mt-24 grid grid-cols-2 gap-x-4 gap-y-14 md:mt-40 md:grid-cols-4 md:gap-x-6">
          {MOMENTS.map((m, i) => (
            <div key={m.hour} className={m.offset}>
              {/* Observe the unclipped wrapper: a fully clipped element never counts as intersecting. */}
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
                <motion.div
                  variants={{ hidden: { clipPath: 'inset(100% 0% 0% 0%)' }, show: { clipPath: 'inset(0% 0% 0% 0%)' } }}
                  transition={{ duration: 1.5, ease: EASE, delay: i * 0.08 }}
                >
                  <ParallaxImage image={m.image} alt={m.alt} className="aspect-[3/4]" speed={8} sizes="(min-width: 768px) 25vw, 50vw" />
                </motion.div>
              </motion.div>
              <Reveal delay={0.2 + i * 0.08} className="mt-4">
                <p className="eyebrow flex items-center gap-2 tabular-nums text-charcoal/60">
                  <span className="h-px w-5 bg-accent" />
                  {m.hour}
                </p>
                <p className="display mt-2 text-[clamp(1.6rem,2.4vw,2.4rem)] leading-none">{m.title}</p>
              </Reveal>
            </div>
          ))}
        </div>

        <Reveal className="mt-28 flex flex-col items-start justify-between gap-6 border-t border-ink/10 pt-8 md:mt-40 md:flex-row md:items-end">
          <p className="display text-[clamp(2rem,4vw,3.6rem)] leading-none">
            The same outfit <span className="italic">belongs everywhere.</span>
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-charcoal/70">
            Few pieces, made slowly. Heavy cottons, pressed wool, waxed leather — and one accent colour per collection, stitched where
            only you will find it.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
