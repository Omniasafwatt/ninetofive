import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAccent } from '../../context/AccentContext'
import { useBag } from '../../context/BagContext'
import { useLenis } from '../../context/SmoothScroll'
import { useClock } from '../../hooks/useClock'
import { EASE } from '../../lib/gsap'
import { NAV } from '../../data/nav'
import { MobileMenu } from './MobileMenu'

export function Navbar({ ready }: { ready: boolean }) {
  const { pathname } = useLocation()
  const lenis = useLenis()
  const { accent } = useAccent()
  const { count, setOpen } = useBag()
  const { hh, mm } = useClock()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 40)
      setHidden(y > 400 && y > last + 2 ? true : y < last - 2 ? false : (h) => h)
      last = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  useEffect(() => {
    if (menu) lenis?.stop()
    else lenis?.start()
  }, [menu, lenis])

  useEffect(() => setMenu(false), [pathname])

  // Every page now opens in the cream showroom, so the bar is dark type unless the menu is open.
  const text = menu ? 'text-paper' : 'text-ink'

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={ready ? { y: hidden && !menu ? -120 : 0, opacity: 1 } : { y: -40, opacity: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="fixed inset-x-0 top-0 z-[120] flex justify-center px-3 pt-3 sm:px-5 sm:pt-4"
      >
        <nav
          className={`flex w-full items-center justify-between rounded-full transition-all duration-700 ease-lux ${text} ${
            scrolled && !menu
              ? 'max-w-[1180px] bg-paper/75 px-4 py-2.5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.35)] ring-1 ring-ink/5 backdrop-blur-xl sm:px-6'
              : 'max-w-[1800px] bg-transparent px-2 py-3 sm:px-4'
          }`}
          aria-label="Main"
        >
          <Link to="/" className="group relative flex items-center gap-2" data-cursor="hide" aria-label="9TO5 home">
            <span className="display text-[1.9rem] leading-none tracking-[-0.04em]">
              9<span className="italic">TO</span>5
            </span>
            <span className="pulse-dot mt-1 size-1.5 rounded-full bg-accent" />
          </Link>

          <ul className="hidden items-center gap-9 lg:flex">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.to === '/'} className="link-underline eyebrow text-[0.66rem]">
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4 sm:gap-6">
            <span className="eyebrow hidden tabular-nums opacity-70 md:inline">
              {hh}
              <span className="animate-pulse">:</span>
              {mm} <span className="text-accent">●</span> {accent.number}
            </span>
            <button onClick={() => setOpen(true)} className="eyebrow link-underline flex items-center gap-2 text-[0.66rem]">
              Bag
              <span className="relative grid size-5 place-items-center overflow-hidden rounded-full bg-accent text-[0.58rem] tracking-normal text-accent-ink">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={count}
                    initial={{ y: 12, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -12, opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
            <button
              onClick={() => setMenu((m) => !m)}
              className="relative flex h-8 w-9 flex-col items-end justify-center gap-[6px] lg:hidden"
              aria-label={menu ? 'Close menu' : 'Open menu'}
              aria-expanded={menu}
            >
              <span className={`block h-px bg-current transition-all duration-500 ease-lux ${menu ? 'w-7 translate-y-[3.5px] rotate-45' : 'w-7'}`} />
              <span className={`block h-px bg-current transition-all duration-500 ease-lux ${menu ? 'w-7 -translate-y-[3.5px] -rotate-45' : 'w-4'}`} />
            </button>
          </div>
        </nav>
      </motion.header>
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </>
  )
}
