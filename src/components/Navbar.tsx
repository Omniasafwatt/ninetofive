import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NAV } from '../data/nav'
import { instagramDM, SITE } from '../data/site'
import { EASE } from '../lib/ease'
import { InstagramIcon } from './Icons'
import { Lockup, Logo, LogoPattern } from './Logo'

export function Navbar() {
  const { pathname, hash } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => setOpen(false), [pathname, hash])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-[100] transition-[background-color,box-shadow] duration-500 ${scrolled || open ? 'bg-paper/90 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md' : 'bg-transparent'}`}>
        <div className="gutter flex h-16 items-center justify-between gap-6 md:h-20">
          <Link to="/" aria-label={`${SITE.name} — home`}>
            <Lockup />
          </Link>

          <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="link text-[0.72rem] tracking-[0.24em] uppercase" aria-current={pathname === n.to ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href={instagramDM()} target="_blank" rel="noreferrer" className="btn btn-red hidden h-10 px-5 text-[0.65rem] sm:inline-flex">
              <InstagramIcon /> DM to order
            </a>
            <button type="button" onClick={() => setOpen((o) => !o)} className="grid size-10 place-items-center rounded-full md:hidden" aria-expanded={open} aria-label="Menu">
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-px w-full bg-ink transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
                <span className={`absolute left-0 h-px w-full bg-ink transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] overflow-hidden bg-red pt-24 text-white md:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <LogoPattern className="-right-[40%] bottom-[-10%] h-[70%] w-[180%] text-maroon" />
            <nav className="gutter relative flex flex-col gap-2" aria-label="Mobile">
              {[{ to: '/', label: 'Home' }, ...NAV].map((n, i) => (
                <motion.div key={n.to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}>
                  <Link to={n.to} className="display block py-2 text-3xl">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
              <a href={instagramDM()} target="_blank" rel="noreferrer" className="btn btn-white mt-8 self-start">
                <InstagramIcon /> DM us to order
              </a>
            </nav>
            <Logo className="absolute bottom-8 left-[clamp(1.25rem,4vw,4rem)] h-6 w-auto text-white/70" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
