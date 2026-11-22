import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useBag } from '../../context/BagContext'
import { useLenis } from '../../context/SmoothScroll'
import { useContent } from '../../context/ContentContext'
import { formatPrice } from '../../data/products'
import { EASE } from '../../lib/gsap'
import { Img } from '../ui/Img'
import { MagneticButton } from '../ui/Magnetic'

export function BagDrawer() {
  const { items, open, setOpen, remove } = useBag()
  const lenis = useLenis()
  const { getProduct } = useContent()
  const { pathname } = useLocation()
  const total = items.reduce((n, i) => n + (getProduct(i.slug)?.price ?? 0) * i.qty, 0)

  useEffect(() => {
    if (open) lenis?.stop()
    else lenis?.start()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, lenis, setOpen])

  useEffect(() => setOpen(false), [pathname, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[150] bg-ink/40 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onClick={() => setOpen(false)}
            data-cursor="Close"
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[160] flex w-full max-w-[480px] flex-col bg-paper"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.9, ease: EASE }}
            aria-label="Shopping bag"
            data-lenis-prevent
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-6">
              <h2 className="display text-4xl">
                Your <span className="italic">bag</span>
              </h2>
              <button onClick={() => setOpen(false)} className="eyebrow link-underline">
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-start justify-center gap-6">
                  <p className="display text-5xl leading-[0.95]">
                    Empty — <span className="italic">for now.</span>
                  </p>
                  <p className="max-w-xs text-sm text-charcoal/70">Every hour deserves something. Start with the piece you’d wear the most.</p>
                  <MagneticButton to="/shop" variant="dark" size="sm">
                    Shop the collection
                  </MagneticButton>
                </div>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {items.map((item, i) => {
                    const p = getProduct(item.slug)
                    if (!p) return null
                    return (
                      <motion.li
                        key={`${item.slug}-${item.color}-${item.size}`}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.05 }}
                        className="flex gap-4 py-5"
                      >
                        <Link to={`/product/${p.slug}`} onClick={() => setOpen(false)} className="w-24 shrink-0">
                          <Img image={p.images[0]} alt={p.name} className="aspect-[3/4]" sizes="96px" />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <p className="display text-2xl leading-none">{p.name}</p>
                            <p className="text-sm tabular-nums">{formatPrice(p.price * item.qty)}</p>
                          </div>
                          <p className="eyebrow mt-2 text-[0.6rem] text-charcoal/60">
                            {item.color} · {item.size} · Qty {item.qty}
                          </p>
                          <button onClick={() => remove(i)} className="eyebrow link-underline mt-auto self-start text-[0.6rem] text-charcoal/60">
                            Remove
                          </button>
                        </div>
                      </motion.li>
                    )
                  })}
                </ul>
              )}
            </div>
            {items.length > 0 && (
              <div className="border-t border-ink/10 px-6 py-6">
                <div className="mb-5 flex items-baseline justify-between">
                  <span className="eyebrow">Subtotal</span>
                  <span className="display text-3xl tabular-nums">{formatPrice(total)}</span>
                </div>
                <MagneticButton to="/checkout" variant="accent" size="lg" full>
                  Checkout
                </MagneticButton>
                <p className="mt-3 text-center text-[0.7rem] text-charcoal/50">Complimentary shipping over $200. Returns within 30 days.</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
