import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { InstagramIcon } from '../components/Icons'
import { LogoPattern } from '../components/Logo'
import { ProductCard } from '../components/ProductCard'
import { useContent } from '../context/ContentContext'
import { CATEGORIES } from '../data/products'
import { instagramDM } from '../data/site'
import { EASE } from '../lib/ease'

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
]

export default function Shop() {
  const { products, collections } = useContent()
  const [params, setParams] = useSearchParams()
  const moment = params.get('moment') ?? ''
  const category = params.get('category') ?? ''
  const sort = params.get('sort') ?? 'featured'
  const active = collections.find((c) => c.slug === moment)

  useEffect(() => {
    document.title = `${active ? active.name : 'Shop'} — Nine to Five`
  }, [active])

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const categories = useMemo(() => {
    const used = new Set(products.map((p) => p.category).filter(Boolean) as string[])
    return [...CATEGORIES.filter((c) => used.has(c)), ...[...used].filter((c) => !CATEGORIES.includes(c))]
  }, [products])

  const list = useMemo(() => {
    let l = products.filter((p) => (!moment || p.collection === moment) && (!category || p.category === category))
    if (sort === 'price-asc') l = [...l].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') l = [...l].sort((a, b) => b.price - a.price)
    return l
  }, [products, moment, category, sort])

  return (
    <>
      <section className="gutter pt-20 md:pt-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-red px-7 py-14 text-white sm:px-12 md:rounded-[3rem] md:py-20">
          <LogoPattern className="-top-[30%] -right-[25%] h-[170%] w-[85%] text-maroon" />
          <div className="relative max-w-xl">
            <p className="eyebrow text-white/70">{active ? `${active.hours} · ${active.mood}` : 'The collection'}</p>
            <h1 className="display mt-4 text-[clamp(2.2rem,5vw,4.2rem)]">{active ? active.name : 'Shop all'}</h1>
            <span className="rule mt-6 bg-white!" />
            <p className="mt-6 text-base leading-relaxed text-white/85">{active ? active.line : 'Everyday pieces for work, uni and everything in between. Find something you love, then order it in our Instagram DMs.'}</p>
          </div>
        </div>
      </section>

      <section className="gutter py-10 md:py-14">
        <div className="flex flex-col gap-4">
          <div className="no-scrollbar -mx-[clamp(1.25rem,4vw,4rem)] flex gap-2 overflow-x-auto px-[clamp(1.25rem,4vw,4rem)]" role="group" aria-label="Filter by moment">
            <button type="button" className="chip" aria-pressed={!moment} onClick={() => set('moment', '')}>
              All day
            </button>
            {collections.map((c) => (
              <button key={c.slug} type="button" className="chip" aria-pressed={moment === c.slug} onClick={() => set('moment', moment === c.slug ? '' : c.slug)}>
                <span className="mr-2 opacity-60 tabular-nums">{c.hours}</span> {c.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="no-scrollbar -mx-[clamp(1.25rem,4vw,4rem)] flex gap-5 overflow-x-auto px-[clamp(1.25rem,4vw,4rem)] text-[0.72rem] tracking-[0.18em] uppercase sm:mx-0 sm:px-0" role="group" aria-label="Filter by category">
              {['', ...categories].map((c) => (
                <button key={c || 'all'} type="button" onClick={() => set('category', c)} className={`link shrink-0 py-1 uppercase ${category === c ? 'text-red' : 'text-charcoal/70'}`} aria-current={category === c ? 'page' : undefined}>
                  {c || 'Everything'}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-3 text-xs text-charcoal/70">
              <span className="sr-only">Sort</span>
              <span className="tabular-nums">{list.length} pieces</span>
              <select value={sort} onChange={(e) => set('sort', e.target.value === 'featured' ? '' : e.target.value)} className="h-10 rounded-full border border-ink/15 bg-transparent px-4 text-xs tracking-[0.1em] outline-none focus:border-red">
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <motion.div layout className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.div key={p.slug} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 8) * 0.03 }}>
                <ProductCard product={p} priority={i < 4} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {list.length === 0 && (
          <div className="py-20 text-center">
            <p className="display text-xl">Nothing here yet</p>
            <p className="mt-3 text-sm text-charcoal/70">Try another filter — or ask us on Instagram what’s coming next.</p>
            <button type="button" onClick={() => setParams({}, { replace: true })} className="btn btn-ghost mt-6">
              Clear filters
            </button>
          </div>
        )}

        <div className="mt-20 flex flex-col items-center gap-5 rounded-[2rem] bg-fog px-6 py-12 text-center">
          <p className="display text-lg">Can’t decide? Ask us.</p>
          <p className="max-w-md text-sm text-charcoal/75">Send us a message with what you’re looking for and we’ll help you pick the right piece and size.</p>
          <a href={instagramDM()} target="_blank" rel="noreferrer" className="btn btn-red">
            <InstagramIcon /> Chat with us
          </a>
        </div>
      </section>
    </>
  )
}
