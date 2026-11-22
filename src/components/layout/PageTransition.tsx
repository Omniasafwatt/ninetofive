import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE } from '../../lib/gsap'

/**
 * Each route enters from behind a cream shutter that wipes upward, carrying a thin
 * accent line — the same gesture as the loader, so navigation feels like a scene cut.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: EASE, delay: 0.35 },
          // A lingering filter/transform makes this wrapper the containing block for
          // position: fixed — which would break ScrollTrigger pins and fixed overlays.
          transitionEnd: { transform: 'none' },
        }}
        exit={{ opacity: 0, transition: { duration: 0.4, ease: EASE } }}
      >
        {children}
      </motion.div>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[140] origin-top bg-paper"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0, transition: { duration: 0.9, ease: EASE, delay: 0.15 } }}
        exit={{ scaleY: 0 }}
        aria-hidden
      >
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-accent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1, transition: { duration: 0.5, ease: EASE } }}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none fixed inset-0 z-[140] origin-bottom bg-paper"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 0 }}
        exit={{ scaleY: 1, transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] } }}
        aria-hidden
      />
    </>
  )
}
