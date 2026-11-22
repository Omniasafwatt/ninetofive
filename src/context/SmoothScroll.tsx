import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { useLocation } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../lib/gsap'

const LenisContext = createContext<Lenis | null>(null)

/** Lenis drives the scroll; GSAP's ticker drives Lenis so ScrollTrigger never drifts out of sync. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  // The admin panel scrolls natively: smooth scrolling fights long forms and modals.
  const admin = useLocation().pathname.startsWith('/admin')

  useEffect(() => {
    if (admin) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const instance = new Lenis({
      duration: reduced ? 0 : 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduced,
      touchMultiplier: 1.4,
    })
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    setLenis(instance)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [admin])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

export const useLenis = () => useContext(LenisContext)
