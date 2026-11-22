import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowIcon, InstagramIcon } from '../components/Icons'
import { Img } from '../components/Img'
import { ProductCard } from '../components/ProductCard'
import { Reveal } from '../components/Reveal'
import { useToast } from '../components/Toast'
import { useContent } from '../context/ContentContext'
import { formatPrice } from '../data/products'
import { EASE } from '../lib/ease'
import { openInstagramDM, orderMessage } from '../lib/instagram'
import NotFound from './NotFound'

export default function ProductPage() {
  const { slug } = useParams()
  const { getProduct, getCollection, loaded } = useContent()
  const p = getProduct(slug)
  const toast = useToast()
  const [shot, setShot] = useState(0)
  const [color, setColor] = useState<string>()
  const [size, setSize] = useState<string>()
  const [needSize, setNeedSize] = useState(false)

  useEffect(() => {
    setShot(0)
    setColor(p?.colors[0]?.name)
    setSize(p?.sizes.length === 1 && !p.soldOut?.includes(p.sizes[0]) ? p.sizes[0] : undefined)
    setNeedSize(false)
    if (p) document.title = `${p.name} — Nine to Five`
    window.scrollTo(0, 0)
  }, [p?.slug]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!p) return loaded ? <NotFound /> : <div className="min-h-screen" />

  const moment = getCollection(p.collection)
  const gallery = [...new Set([...p.images, ...p.details])]
  const allSoldOut = p.sizes.length > 0 && p.sizes.every((s) => p.soldOut?.includes(s))
  const pairs = p.styleWith.map((s) => getProduct(s)).filter((x): x is NonNullable<typeof x> => !!x)

  const order = async () => {
    if (p.sizes.length && !size) {
      setNeedSize(true)
      return
    }
    const copied = await openInstagramDM(orderMessage(p, color, size))
    toast(copied ? 'Your order is copied — just paste it in our Instagram chat and send.' : 'Opening Instagram — tell us the piece, colour and size.')
  }

  const ask = async () => {
    const copied = await openInstagramDM(`Hi! I have a question about the ${p.name} (#${p.number}): `)
    if (copied) toast('Copied — paste it in the chat and add your question.')
  }

  return (
    <>
      <section className="gutter pt-20 md:pt-24">
        <nav className="flex items-center gap-2 py-4 text-[0.68rem] tracking-[0.2em] text-charcoal/60 uppercase" aria-label="Breadcrumb">
          <Link to="/shop" className="link">Shop</Link>
          {moment && (
            <>
              <span>/</span>
              <Link to={`/shop?moment=${moment.slug}`} className="link">{moment.name}</Link>
            </>
          )}
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* Gallery */}
          <div className="flex flex-col-reverse gap-3 md:flex-row">
            <div className="no-scrollbar flex gap-3 overflow-x-auto md:w-20 md:flex-col md:overflow-visible">
              {gallery.map((g, i) => (
                <button key={g + i} type="button" onClick={() => setShot(i)} className={`w-16 shrink-0 overflow-hidden rounded-2xl ring-2 transition md:w-full ${shot === i ? 'ring-red' : 'ring-transparent opacity-70 hover:opacity-100'}`} aria-label={`Photo ${i + 1}`}>
                  <Img image={g} alt="" className="aspect-[4/5]" sizes="80px" />
                </button>
              ))}
            </div>
            <div className="relative flex-1 overflow-hidden rounded-[2rem] bg-fog">
              <AnimatePresence mode="wait">
                <motion.div key={shot} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                  <Img image={gallery[shot]} alt={p.name} priority className="aspect-[4/5]" sizes="(min-width: 1024px) 55vw, 100vw" />
                </motion.div>
              </AnimatePresence>
              {p.tag && <span className="absolute top-4 left-4 rounded-full bg-white px-3.5 py-1.5 text-[0.62rem] tracking-[0.2em] text-red uppercase">{p.tag}</span>}
            </div>
          </div>

          {/* Details */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-red">{moment ? `${moment.hours} · ${moment.name}` : 'Nine to Five'}</p>
            <h1 className="display mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)]">{p.name}</h1>
            <p className="mt-3 text-xl text-red">{formatPrice(p.price)}</p>
            <span className="rule mt-6" />
            <p className="mt-6 text-base leading-relaxed text-charcoal">{p.tagline}</p>

            {p.colors.length > 0 && (
              <div className="mt-8">
                <p className="text-xs tracking-[0.18em] text-charcoal/70 uppercase">
                  Colour — <span className="text-ink">{color}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {p.colors.map((c) => (
                    <button key={c.name} type="button" title={c.name} aria-label={c.name} aria-pressed={color === c.name} onClick={() => setColor(c.name)} className={`size-9 rounded-full ring-offset-2 ring-offset-paper transition ${color === c.name ? 'ring-2 ring-red' : 'ring-1 ring-ink/15 hover:ring-ink/40'}`} style={{ background: c.hex }} />
                  ))}
                </div>
              </div>
            )}

            {p.sizes.length > 0 && (
              <div className="mt-7">
                <p className={`text-xs tracking-[0.18em] uppercase ${needSize ? 'text-red' : 'text-charcoal/70'}`}>{needSize ? 'Please choose your size' : 'Size'}</p>
                <motion.div className="mt-3 flex flex-wrap gap-2" animate={needSize ? { x: [0, -6, 6, -3, 3, 0] } : {}} transition={{ duration: 0.4 }}>
                  {p.sizes.map((s) => {
                    const out = p.soldOut?.includes(s)
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={out}
                        aria-pressed={size === s}
                        onClick={() => {
                          setSize(s)
                          setNeedSize(false)
                        }}
                        className={`h-11 min-w-12 rounded-full border px-4 text-sm transition ${size === s ? 'border-red bg-red text-white' : out ? 'cursor-not-allowed border-ink/10 text-charcoal/35 line-through' : 'border-ink/20 hover:border-red hover:text-red'}`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </motion.div>
              </div>
            )}

            <div className="mt-9 flex flex-col gap-3">
              <button type="button" onClick={order} disabled={allSoldOut} className="btn btn-red h-14 w-full text-[0.75rem] disabled:cursor-not-allowed disabled:bg-charcoal/40">
                <InstagramIcon /> {allSoldOut ? 'Sold out' : 'Order on Instagram'}
              </button>
              <button type="button" onClick={ask} className="btn btn-ghost h-12 w-full">
                Ask us about this piece
              </button>
              <p className="mt-1 text-center text-xs leading-relaxed text-charcoal/60">We’ll open a chat with us on Instagram and copy your order — just paste and send. We confirm availability and delivery in the DMs.</p>
            </div>

            <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
              <Fold title="Details" open>
                <p>{p.description}</p>
                {p.features.length > 0 && (
                  <ul className="mt-4 grid gap-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <span className="size-1.5 rounded-full bg-red" /> {f}
                      </li>
                    ))}
                  </ul>
                )}
              </Fold>
              {p.fabric.length > 0 && (
                <Fold title="Fabric & fit">
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                    {p.fabric.map((f) => (
                      <div key={f.label} className="contents">
                        <dt className="text-charcoal/60">{f.label}</dt>
                        <dd>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </Fold>
              )}
              {p.care && <Fold title="Care">{p.care}</Fold>}
            </div>
          </div>
        </div>
      </section>

      {pairs.length > 0 && (
        <section className="gutter py-16 md:py-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-red">Complete the look</p>
              <h2 className="display mt-3 text-2xl md:text-3xl">Wear it with</h2>
              <span className="rule mt-5" />
            </div>
            <Link to="/shop" className="inline-flex items-center gap-2 text-[0.7rem] tracking-[0.22em] uppercase">
              <span className="link">Shop all</span> <ArrowIcon className="size-3.5" />
            </Link>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {pairs.slice(0, 4).map((x) => (
              <ProductCard key={x.slug} product={x} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function Fold({ title, open: initial = false, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(initial)
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-5 text-left text-[0.75rem] tracking-[0.22em] uppercase" aria-expanded={open}>
        {title}
        <span className={`relative size-3 transition-transform duration-300 ${open ? 'rotate-45' : ''}`} aria-hidden>
          <span className="absolute top-1/2 left-0 h-px w-full bg-current" />
          <span className="absolute top-0 left-1/2 h-full w-px bg-current" />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
            <div className="pb-6 text-sm leading-relaxed text-charcoal">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
