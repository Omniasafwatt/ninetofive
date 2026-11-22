import { motion } from 'framer-motion'
import { useContent } from '../../context/ContentContext'
import { useClock } from '../../hooks/useClock'
import { EASE } from '../../lib/gsap'
import { Rack } from '../rack/Rack'
import { MagneticButton } from '../ui/Magnetic'

const fade = (ready: boolean, delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
  transition: { duration: 0.9, ease: EASE, delay },
})

/** The showroom: a headline over a rail of the season's pieces, hung edge-on until you reach for one. */
export function Hero({ ready }: { ready: boolean }) {
  const { hh, mm } = useClock()
  const lead = useContent().collections[0]

  return (
    <section className="hero-rack relative overflow-hidden bg-paper pt-28 sm:pt-32">
      {/* Showroom light: a warm wall falling into a slightly darker floor. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,var(--color-paper)_40%,var(--color-fog)_100%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-b from-transparent to-concrete/40" />

      <div className="gutter relative">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <motion.p className="eyebrow mb-5 flex items-center gap-3 text-ink/60" {...fade(ready, 0.1)}>
              <span className="h-px w-8 bg-accent" />
              {lead ? `Collection ${lead.number} — ${lead.name} — AW26` : 'AW26'}
            </motion.p>
            <motion.h1 className="display text-[clamp(3.2rem,9.5vw,9rem)] leading-[0.9]" {...fade(ready, 0.2)}>
              Built for <span className="italic text-accent">every</span> hour.
            </motion.h1>
          </div>
          <motion.div className="flex flex-col gap-6 md:col-span-5 md:items-end md:pb-3 md:text-right" {...fade(ready, 0.35)}>
            <p className="max-w-sm text-[0.95rem] leading-relaxed text-ink/70">
              Morning coffee. University. Office. Late-night walks. One rail of everyday essentials that belongs to all of them.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <MagneticButton to="/shop" variant="dark">
                Shop the rail
              </MagneticButton>
              <MagneticButton to={lead ? `/collections/${lead.slug}` : '/collections'} variant="outline-dark">
                Collections
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 sm:mt-10">
          <Rack ready={ready} />
        </div>

        <motion.div className="eyebrow flex items-center justify-between border-t border-ink/10 py-4 text-ink/45" {...fade(ready, 0.9)}>
          <span className="tabular-nums">
            {hh}:{mm} — Now on the rail
          </span>
          <span className="hidden sm:inline">Everyday essentials</span>
          <span>Scroll ↓</span>
        </motion.div>
      </div>
    </section>
  )
}
