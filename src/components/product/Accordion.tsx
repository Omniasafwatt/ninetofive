import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { EASE } from '../../lib/gsap'

export function Accordion({ items }: { items: { title: string; body: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((it, i) => {
        const on = open === i
        return (
          <div key={it.title}>
            <button onClick={() => setOpen(on ? null : i)} className="group flex w-full items-center justify-between py-5 text-left" aria-expanded={on}>
              <span className="eyebrow transition-transform duration-500 ease-lux group-hover:translate-x-1">{it.title}</span>
              <span className="relative size-3">
                <span className="absolute top-1/2 left-0 h-px w-3 bg-current" />
                <span className={`absolute top-1/2 left-0 h-px w-3 bg-current transition-transform duration-500 ease-lux ${on ? 'rotate-0' : 'rotate-90'}`} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="pb-6 text-sm leading-relaxed text-charcoal/75">{it.body}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
