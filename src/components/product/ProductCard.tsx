import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBag } from '../../context/BagContext'
import { useContent } from '../../context/ContentContext'
import { formatPrice, type Product } from '../../data/products'
import { EASE } from '../../lib/gsap'
import { HangingFrame } from '../ui/HangingFrame'
import { HoverSwap } from './HoverSwap'

type Size = 'large' | 'small'

/**
 * Product card in two scales — large for editorial spreads, small for the dense grid.
 * Each one hangs from a hook like a piece on the rail and swings when you reach for it;
 * the second photo opens on hover, and quick add by size works without leaving the page.
 */
export function ProductCard({ product: p, index = 0, size = 'large', aspect }: { product: Product; index?: number; size?: Size; aspect?: string }) {
  const c = useContent().getCollection(p.collection)
  const large = size === 'large'
  const allOut = p.sizes.every((s) => p.soldOut?.includes(s))
  const lowStock = !allOut && (p.soldOut?.length ?? 0) > 0

  return (
    <motion.article
      initial={{ opacity: 0, y: large ? 60 : 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: large ? 1.1 : 0.9, ease: EASE, delay: (index % (large ? 2 : 4)) * 0.08 }}
      className="group"
    >
      <HangingFrame frameClassName="transition-shadow duration-700 ease-lux group-hover:shadow-[0_40px_50px_-34px_rgba(42,31,25,0.55)]">
        <div data-swap-scope>
        <Link to={`/product/${p.slug}`} data-cursor="View" aria-label={p.name} className="block">
          <HoverSwap primary={p.images[0]} secondary={p.images[1] ?? p.images[0]} alt={p.name} className={aspect ?? (large ? 'aspect-[3/4]' : 'aspect-[4/5]')} sizes={large ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'} />
        </Link>

        {/* Labels */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
          {p.tag ? (
            <span className="eyebrow rounded-full bg-ink px-2.5 py-1 text-[0.52rem] text-paper sm:px-3 sm:py-1.5 sm:text-[0.56rem]">{p.tag}</span>
          ) : (
            <span />
          )}
          {large ? (
            <span className="eyebrow flex items-center gap-2 rounded-full bg-paper/85 px-3 py-1.5 text-[0.56rem] backdrop-blur">
              <span className="size-1.5 rounded-full" style={{ background: c?.accent }} />
              {c?.number} {c?.name}
            </span>
          ) : (
            <span className="size-2 rounded-full ring-2 ring-paper/80" style={{ background: c?.accent }} title={c?.name} />
          )}
        </div>

        {allOut && (
          <span className="eyebrow pointer-events-none absolute inset-x-0 bottom-0 bg-paper/85 py-2.5 text-center text-[0.58rem] backdrop-blur">Sold out</span>
        )}
        {!allOut && <QuickAdd product={p} large={large} />}
        </div>
      </HangingFrame>

      <Link to={`/product/${p.slug}`} className="block">
        <div className={`flex items-start justify-between gap-3 ${large ? 'mt-5' : 'mt-3.5'}`}>
          <div className="min-w-0">
            {large && <p className="eyebrow text-[0.6rem] tabular-nums text-charcoal/50">No. {p.number}</p>}
            <h3 className={`display leading-none ${large ? 'mt-1 text-[clamp(2rem,3.4vw,3.4rem)]' : 'text-[clamp(1.35rem,1.9vw,1.75rem)]'}`}>
              <span className="link-underline">{p.name}</span>
            </h3>
            <p className={`text-charcoal/60 ${large ? 'mt-2 text-sm italic' : 'mt-1 truncate text-[0.72rem]'}`}>
              {large ? p.tagline : `${p.category ?? c?.name ?? ''}${lowStock ? ' · Few sizes left' : ''}`}
            </p>
          </div>
          <div className="shrink-0 text-right">
            {/* Price on a swing tag — the little card with a punched hole you'd find on the sleeve. */}
            <p className={`relative inline-flex items-center rounded-md border border-ink/15 bg-paper tabular-nums ${large ? 'display py-1 pr-3 pl-6 text-2xl' : 'py-0.5 pr-2 pl-4.5 text-[0.8rem] font-semibold'}`}>
              <span aria-hidden className={`absolute top-1/2 -translate-y-1/2 rounded-full border border-ink/25 ${large ? 'left-2 size-2' : 'left-1.5 size-1.5'}`} />
              {formatPrice(p.price)}
            </p>
            <div className={`flex justify-end gap-1 ${large ? 'mt-3' : 'mt-2'}`}>
              {p.colors.slice(0, 4).map((col) => (
                <span key={col.name} title={col.name} className={`rounded-full ring-1 ring-ink/15 ${large ? 'size-3' : 'size-2.5'}`} style={{ background: col.hex }} />
              ))}
              {p.colors.length > 4 && <span className="text-[0.6rem] text-charcoal/50">+{p.colors.length - 4}</span>}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

/** Size row that slides up over the photo on hover (pointer devices only). */
function QuickAdd({ product: p, large }: { product: Product; large: boolean }) {
  const { add, setOpen } = useBag()
  const [added, setAdded] = useState<string | null>(null)
  const single = p.sizes.length === 1

  const pick = (size: string) => {
    add({ slug: p.slug, color: p.colors[0]?.name ?? 'Default', size })
    setAdded(size)
    window.setTimeout(() => setOpen(true), 450)
    window.setTimeout(() => setAdded(null), 1800)
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden p-2.5 [@media(hover:hover)]:block sm:p-3">
      <div className="pointer-events-auto translate-y-[calc(100%+16px)] rounded-2xl bg-paper/92 p-2 opacity-0 shadow-[0_12px_30px_-16px_rgba(0,0,0,0.4)] backdrop-blur-md transition-[translate,opacity] duration-500 ease-lux group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
        <AnimatePresence mode="wait" initial={false}>
          {added ? (
            <motion.p
              key="added"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="eyebrow flex h-9 items-center justify-center gap-2 text-[0.58rem]"
            >
              <span className="grid size-4 place-items-center rounded-full bg-accent text-[0.55rem] text-accent-ink">✓</span>
              Added — {added}
            </motion.p>
          ) : single ? (
            <motion.button key="one" type="button" onClick={() => pick(p.sizes[0])} className="eyebrow h-9 w-full rounded-xl bg-ink text-[0.58rem] text-paper transition-colors hover:bg-accent hover:text-accent-ink" data-cursor="hide">
              Quick add
            </motion.button>
          ) : (
            <motion.div key="sizes" className="flex flex-col gap-1.5">
              <p className={`eyebrow px-1 text-[0.5rem] text-charcoal/55 ${large ? '' : 'hidden xl:block'}`}>Quick add</p>
              <div className="flex flex-wrap gap-1">
                {p.sizes.map((s) => {
                  const out = p.soldOut?.includes(s)
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={out}
                      onClick={() => pick(s)}
                      aria-label={`Add ${p.name}, size ${s}`}
                      data-cursor="hide"
                      className="h-8 min-w-8 flex-1 rounded-lg px-1.5 text-[0.68rem] font-semibold transition-colors duration-200 hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:text-charcoal/30 disabled:line-through disabled:hover:bg-transparent"
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
