import { AnimatePresence, motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { useAccent } from '../../context/AccentContext'
import { EASE } from '../../lib/gsap'
import { NAV } from '../../data/nav'

/** Full-screen menu: the panel drops like a shutter, then every letter slides up on its own beat. */
export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setAccent } = useAccent()
  const { collections } = useContent()
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[110] flex flex-col bg-ink text-paper lg:hidden"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.8, ease: EASE, delay: 0.2 } }}
          transition={{ duration: 0.9, ease: EASE }}
          data-lenis-prevent
        >
          <div className="gutter flex flex-1 flex-col justify-center pt-24">
            <ul className="space-y-1">
              {NAV.map((n, i) => (
                <li key={n.to} className="overflow-hidden">
                  <NavLink to={n.to} end={n.to === '/'} onClick={onClose} className="group flex items-baseline gap-4">
                    {({ isActive }) => (
                      <>
                        <motion.span
                          className="eyebrow w-7 text-paper/40"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1, transition: { delay: 0.5 + i * 0.06 } }}
                          exit={{ opacity: 0 }}
                        >
                          0{i + 1}
                        </motion.span>
                        <span className={`display flex text-[clamp(3.5rem,15vw,7rem)] leading-[0.95] ${isActive ? 'italic text-accent' : ''}`}>
                          {n.label.split('').map((ch, j) => (
                            <span key={j} className="inline-block overflow-hidden">
                              <motion.span
                                className="inline-block"
                                initial={{ y: '105%' }}
                                animate={{ y: '0%', transition: { duration: 0.9, ease: EASE, delay: 0.3 + i * 0.07 + j * 0.022 } }}
                                exit={{ y: '-105%', transition: { duration: 0.5, ease: EASE, delay: i * 0.03 + j * 0.01 } }}
                              >
                                {ch}
                              </motion.span>
                            </span>
                          ))}
                        </span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <motion.div
            className="gutter pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.8, duration: 0.8, ease: EASE } }}
            exit={{ opacity: 0 }}
          >
            <div className="stitch mb-6 opacity-70" />
            <p className="eyebrow mb-4 text-paper/40">Collections</p>
            <div className="flex flex-wrap gap-2">
              {collections.map((c) => (
                <NavLink
                  key={c.slug}
                  to={`/collections/${c.slug}`}
                  onClick={() => {
                    setAccent(c)
                    onClose()
                  }}
                  className="eyebrow flex items-center gap-2 rounded-full border border-paper/20 px-3 py-2 text-[0.6rem]"
                >
                  <span className="size-1.5 rounded-full" style={{ background: c.accent }} />
                  {c.number} {c.name}
                </NavLink>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
