import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE } from '../../lib/gsap'

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: EASE, delay },
})

type Props = {
  eyebrow: ReactNode
  title: ReactNode
  copy?: ReactNode
  /** Right-hand column on desktop (a hung photo, a list…); stacks under the copy on phones. */
  aside?: ReactNode
  /** Full-width content under the heading — usually a rail. */
  children?: ReactNode
  className?: string
}

/** Every page opens in the same showroom as the home hero: warm wall, one headline, room to hang things. */
export function PageHead({ eyebrow, title, copy, aside, children, className = '' }: Props) {
  return (
    <section className={`relative overflow-hidden bg-paper pt-28 pb-10 sm:pt-36 md:pb-14 ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_0%,var(--color-paper)_40%,var(--color-fog)_100%)]" />
      <div className="gutter relative">
        <div className={`grid gap-8 ${aside ? 'md:grid-cols-12 md:items-center' : ''}`}>
          <div className={aside ? 'md:col-span-7' : ''}>
            <motion.p className="eyebrow mb-5 flex items-center gap-3 text-ink/60" {...fade(0.1)}>
              <span className="h-px w-8 bg-accent" />
              {eyebrow}
            </motion.p>
            <motion.h1 className="display text-[clamp(3rem,7.5vw,7rem)] leading-[0.9]" {...fade(0.2)}>
              {title}
            </motion.h1>
            {copy && (
              <motion.div className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-ink/70" {...fade(0.32)}>
                {copy}
              </motion.div>
            )}
          </div>
          {aside && (
            <motion.div className="md:col-span-5" {...fade(0.4)}>
              {aside}
            </motion.div>
          )}
        </div>
        {children && (
          <motion.div className="mt-10" {...fade(0.5)}>
            {children}
          </motion.div>
        )}
      </div>
    </section>
  )
}
