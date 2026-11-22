import { motion } from 'framer-motion'
import { EASE } from '../../lib/gsap'

/** "(03) — The pieces" — the running index that makes each section read like a magazine spread. */
export function SectionLabel({ index, title, light }: { index: string; title: string; light?: boolean }) {
  return (
    <motion.div
      className={`eyebrow flex items-center gap-4 ${light ? 'text-paper/60' : 'text-charcoal/60'}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.8 }}
    >
      <motion.span
        variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } } }}
        className="tabular-nums"
      >
        ({index})
      </motion.span>
      <motion.span
        className="h-px w-12 origin-left bg-accent"
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.2, ease: EASE, delay: 0.1 } } }}
      />
      <motion.span
        variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: 0.25 } } }}
      >
        {title}
      </motion.span>
    </motion.div>
  )
}
