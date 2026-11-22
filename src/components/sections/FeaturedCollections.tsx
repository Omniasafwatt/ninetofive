import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import type { Collection } from '../../data/collections'
import { useAccent } from '../../context/AccentContext'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { EASE } from '../../lib/gsap'
import { Img } from '../ui/Img'
import { SectionLabel } from '../ui/SectionLabel'
import { SplitText } from '../ui/SplitText'

/**
 * Four tall panels. Hovering one widens it, repaints the whole site in its accent,
 * and floods the room behind the cards with a faint wash of that colour.
 */
export function FeaturedCollections() {
  const { accent, setAccent } = useAccent()
  const { collections } = useContent()
  const [active, setActive] = useState(0)
  const desktop = useMediaQuery('(min-width: 768px)')

  const focus = (c: Collection, i: number) => {
    setActive(i)
    setAccent(c)
  }

  return (
    <section className="relative overflow-hidden bg-ink py-28 text-paper md:py-40">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-1000"
        style={{ background: 'radial-gradient(60% 50% at 70% 60%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 70%)' }}
      />
      <div className="gutter relative">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <SectionLabel index="02" title="Collections" light />
            <h2 className="display mt-8 text-[clamp(3rem,8vw,8.5rem)]">
              <SplitText text="One accent" className="block" />
              <SplitText text="at a time." className="block" italicWords={['time']} delay={0.15} />
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-paper/60">
            Each collection carries a single colour — in a stitch, a label, a zip tape. Never two. Currently in focus:{' '}
            <span className="text-accent transition-colors duration-700">
              {accent.number} {accent.name}
            </span>
            .
          </p>
        </div>

        <div className="no-scrollbar -mx-[clamp(1rem,3.2vw,3rem)] mt-16 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[clamp(1rem,3.2vw,3rem)] md:mx-0 md:mt-24 md:h-[78vh] md:overflow-visible md:px-0">
          {collections.map((c, i) => (
            <motion.div
              key={c.slug}
              className="relative h-[70vh] w-[80vw] shrink-0 snap-center md:h-full md:w-auto md:shrink"
              style={desktop ? { flexGrow: 1, flexBasis: 0 } : undefined}
              animate={desktop ? { flexGrow: active === i ? 2.8 : 1 } : undefined}
              transition={{ duration: 1, ease: EASE }}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0, transition: { duration: 1.2, ease: EASE, delay: i * 0.1 } }}
              viewport={{ once: true, amount: 0.2 }}
              onMouseEnter={() => focus(c, i)}
              onFocus={() => focus(c, i)}
            >
              <Link to={`/collections/${c.slug}`} className="group relative block h-full overflow-hidden" data-cursor="Enter">
                <Img
                  image={c.cover}
                  alt={`${c.name} campaign`}
                  className="absolute inset-0 h-full w-full"
                  imgClassName="transition-transform duration-[1800ms] ease-lux group-hover:scale-[1.06]"
                  sizes="(min-width: 768px) 50vw, 80vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/30 transition-opacity duration-700" />
                <div
                  className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-1000 ease-lux group-hover:scale-x-100"
                  style={{ background: c.accent }}
                />

                <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-7">
                  <div className="flex items-start justify-between">
                    <span className="display text-5xl italic md:text-6xl">{c.number}</span>
                    <span className="eyebrow rounded-full border border-paper/25 px-3 py-1.5 text-[0.6rem] backdrop-blur-sm tabular-nums">
                      {c.hours}
                    </span>
                  </div>
                  <div>
                    <p className="eyebrow mb-3 flex items-center gap-2 text-[0.6rem]">
                      <span className="size-2 rounded-full transition-transform duration-700 group-hover:scale-150" style={{ background: c.accent }} />
                      {c.accentName}
                    </p>
                    <h3 className="display text-[clamp(2.6rem,4.4vw,5rem)] leading-[0.9]">{c.name}</h3>
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-700 ease-lux ${
                        active === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[1fr] opacity-100 md:grid-rows-[0fr] md:opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="mt-4 max-w-sm text-sm text-paper/70">{c.line}</p>
                        <p className="eyebrow mt-4 text-[0.6rem] text-paper/50">{c.mood}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
