import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowIcon, InstagramIcon } from '../components/Icons'
import { Img } from '../components/Img'
import { LogoPattern } from '../components/Logo'
import { ProductCard } from '../components/ProductCard'
import { Reveal } from '../components/Reveal'
import { useContent } from '../context/ContentContext'
import { instagramDM } from '../data/site'
import { EASE } from '../lib/ease'

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <Moments />
      <NewIn />
      <Promise />
      <CardBand />
      <HowToOrder />
    </>
  )
}

function Hero() {
  return (
    <section className="gutter pt-20 md:pt-24">
      <div className="relative grid min-h-[calc(100svh-7rem)] overflow-hidden rounded-[2rem] bg-red text-white md:rounded-[3rem] lg:grid-cols-[1.15fr_0.85fr]">
        {/* The card's front: the monogram, huge and cropped, maroon on red. */}
        <LogoPattern className="-top-[8%] -left-[30%] h-[85%] w-[150%] text-maroon lg:-left-[18%] lg:h-[110%] lg:w-[95%]" />

        <div className="relative flex flex-col justify-end p-7 pt-16 sm:p-12 lg:p-16">
          <motion.p className="eyebrow text-white/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}>
            Casual wear for girls on the move
          </motion.p>
          <motion.h1
            className="display mt-5 text-[clamp(2.3rem,6.2vw,5.4rem)] leading-[1.02]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.1 }}
          >
            Good style
            <br />
            works overtime
          </motion.h1>
          <motion.span className="rule mt-7 w-24 bg-white!" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ originX: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.5 }} />
          <motion.p className="mt-7 max-w-md text-base leading-relaxed text-white/85 md:text-lg" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}>
            Comfortable pieces that look put-together from nine to five — work, uni, quick errands and long days out.
          </motion.p>
          <motion.div className="mt-9 flex flex-wrap gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}>
            <Link to="/shop" className="btn btn-white">
              Shop the collection <ArrowIcon />
            </Link>
            <a href={instagramDM()} target="_blank" rel="noreferrer" className="btn btn-ghost-light">
              <InstagramIcon /> DM to order
            </a>
          </motion.div>
        </div>

        <div className="relative flex items-end justify-center gap-3 px-7 pb-7 sm:px-12 sm:pb-12 lg:items-center lg:justify-end lg:py-16 lg:pr-16">
          <motion.div
            className="w-full max-w-[22rem] lg:max-w-[24rem]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.25 }}
          >
            <Img image="coatWoman" alt="Nine to Five — everyday look" priority className="aspect-[4/4.4] rounded-t-full rounded-b-[2rem] sm:aspect-[3/4] lg:aspect-[3/4.4] lg:rounded-full" sizes="(min-width: 1024px) 30vw, 90vw" />
          </motion.div>
          {/* The card's vertical pill. */}
          <motion.div
            className="hidden w-14 shrink-0 self-stretch rounded-full bg-maroon py-10 sm:flex sm:items-center sm:justify-center lg:max-h-[36rem] lg:self-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.4 }}
            aria-hidden
          >
            <span className="text-[0.85rem] tracking-[0.6em] uppercase [writing-mode:vertical-rl]">Nine to Five</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Ticker() {
  const words = ['Work', 'Uni', 'Errands', 'Coffee runs', 'Long drives', 'After five']
  const row = [...words, ...words, ...words]
  return (
    <div className="overflow-hidden py-8 md:py-10" aria-hidden>
      <div className="marquee flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((w, i) => (
              <span key={i} className="flex items-center text-sm tracking-[0.35em] text-charcoal uppercase md:text-base">
                <span className="px-6">{w}</span>
                <span className="size-1.5 rounded-full bg-red" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <Reveal className="max-w-2xl">
      <p className="eyebrow text-red">{eyebrow}</p>
      <h2 className="display mt-4 text-[clamp(1.7rem,3.6vw,2.9rem)]">{title}</h2>
      <span className="rule mt-6" />
      {children && <p className="mt-6 text-base leading-relaxed text-charcoal/80">{children}</p>}
    </Reveal>
  )
}

function Moments() {
  const { collections, productsIn } = useContent()
  return (
    <section id="moments" className="gutter scroll-mt-24 py-14 md:py-20">
      <SectionTitle eyebrow="Your day, sorted" title={<>Made for the whole day</>}>
        Pick where you’re headed — we’ll show you what to wear.
      </SectionTitle>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {collections.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.08}>
            <Link to={`/shop?moment=${c.slug}`} className="group relative flex min-h-[17rem] flex-col sm:aspect-[4/5] sm:min-h-0 justify-between overflow-hidden rounded-[2rem] bg-fog p-7 transition-colors duration-500 hover:bg-red hover:text-white">
              <LogoPattern className="-right-[35%] -bottom-[18%] h-[75%] w-[150%] text-concrete/70 transition-colors duration-500 group-hover:text-maroon" />
              <div className="relative flex items-center justify-between">
                <span className="text-xs tracking-[0.12em] text-charcoal/60 transition-colors group-hover:text-white/70">{c.number}</span>
                <span className="text-xs text-charcoal/60 transition-colors group-hover:text-white/70">{productsIn(c.slug).length} pieces</span>
              </div>
              <div className="relative">
                <p className="text-5xl font-light tracking-tight text-red tabular-nums transition-colors group-hover:text-white md:text-6xl">{c.hours}</p>
                <p className="display mt-4 text-lg">{c.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/75 transition-colors group-hover:text-white/80">{c.line}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[0.68rem] tracking-[0.24em] uppercase">
                  Shop <ArrowIcon className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function NewIn() {
  const { products } = useContent()
  const rank = (t?: string) => (t === 'New' ? 0 : t === 'Bestseller' ? 1 : 2)
  const list = [...products].sort((a, b) => rank(a.tag) - rank(b.tag)).slice(0, 8)
  return (
    <section className="gutter py-14 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionTitle eyebrow="Just landed" title="New in" />
        <Reveal>
          <Link to="/shop" className="btn btn-ghost">
            View all <ArrowIcon />
          </Link>
        </Reveal>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
        {list.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 4) * 0.06}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function Promise() {
  const points = [
    { t: 'Comfort that lasts', d: 'Soft fabrics and easy fits you can sit, walk and run around in from morning till night.' },
    { t: 'Confident & put-together', d: 'Clean cuts that look polished without trying — for the office, the lecture hall or the café.' },
    { t: 'A little different', d: 'Not loud, not basic. Small details that make the outfit feel like yours.' },
  ]
  return (
    <section className="gutter py-14 md:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <Reveal className="relative mx-auto w-full max-w-sm">
          <Img image="portraitWoman" alt="Nine to Five look" className="aspect-[3/4.2] rounded-full" sizes="(min-width: 1024px) 30vw, 80vw" />
          <span className="absolute -right-2 bottom-10 rounded-full bg-red px-5 py-3 text-[0.65rem] tracking-[0.28em] text-white uppercase shadow-lg md:-right-8">9 → 5 → after</span>
        </Reveal>
        <div>
          <SectionTitle eyebrow="Why Nine to Five" title={<>Comfortable for the 9 to 5.<br />Sharp for after.</>} />
          <div className="mt-10 grid gap-8 sm:grid-cols-3 lg:gap-10">
            {points.map((p, i) => (
              <Reveal key={p.t} delay={i * 0.08}>
                <span className="text-sm text-red tabular-nums">0{i + 1}</span>
                <p className="mt-3 text-[0.82rem] font-medium tracking-[0.16em] uppercase">{p.t}</p>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/75">{p.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** The back of the business card, as a section. */
function CardBand() {
  return (
    <section className="gutter py-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-fog px-6 py-24 text-center md:rounded-[3rem] md:py-36">
        <LogoPattern className="-top-[20%] -left-[10%] h-[140%] w-[120%] text-[#e3e2e2]" />
        <Reveal className="relative">
          <p className="display text-[clamp(1.8rem,4.6vw,3.8rem)] tracking-[0.1em] text-charcoal">
            Good style
            <br />
            works overtime
          </p>
          <span className="rule mx-auto mt-8 w-40" />
        </Reveal>
      </div>
    </section>
  )
}

function HowToOrder() {
  const steps = [
    { t: 'Pick your piece', d: 'Browse the shop and choose your colour and size.' },
    { t: 'Tap “Order on Instagram”', d: 'We open a DM with us and copy your order details — just paste and send.' },
    { t: 'We take it from there', d: 'We confirm availability, delivery and everything else right in the chat.' },
  ]
  return (
    <section id="how-to-order" className="gutter scroll-mt-24 py-14 md:py-24">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        <div>
          <SectionTitle eyebrow="No checkout, no fuss" title="How to order">
            Ordering is a chat, not a form. Everything happens on Instagram, with a real person on the other side.
          </SectionTitle>
          <Reveal delay={0.1}>
            <a href={instagramDM()} target="_blank" rel="noreferrer" className="btn btn-red mt-9">
              <InstagramIcon /> Message us
            </a>
          </Reveal>
        </div>
        <ol className="grid gap-4">
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08}>
              <li className="flex items-start gap-6 rounded-[1.75rem] border border-ink/10 bg-white/60 p-6 md:p-8">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-red text-lg text-white">{i + 1}</span>
                <div>
                  <p className="text-[0.85rem] font-medium tracking-[0.16em] uppercase">{s.t}</p>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/75">{s.d}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
