import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { formatPrice, type Product } from '../../data/products'
import { gsap, useGSAP } from '../../lib/gsap'
import { HoverSwap } from '../product/HoverSwap'
import { Img } from '../ui/Img'
import { MagneticButton } from '../ui/Magnetic'
import { Reveal } from '../ui/Reveal'
import { SectionLabel } from '../ui/SectionLabel'
import { SplitText } from '../ui/SplitText'

/** Few products, so each one gets a full spread: hero frame, close-ups, and a giant name. */
export function ProductShowcase() {
  const { products } = useContent()
  return (
    <section className="bg-paper py-28 md:py-44">
      <div className="gutter">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <SectionLabel index="03" title="The pieces" />
            <h2 className="display mt-8 text-[clamp(3rem,8vw,8.5rem)]">
              <SplitText text="Few pieces." className="block" />
              <SplitText text="Worn every day." className="block" italicWords={['every']} delay={0.15} />
            </h2>
          </div>
          <MagneticButton to="/shop" variant="outline-dark">
            All pieces — {products.length}
          </MagneticButton>
        </div>

        <div className="mt-24 space-y-32 md:mt-40 md:space-y-56">
          {products.slice(0, 4).map((p, i) => (
            <ShowcaseRow key={p.slug} product={p} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ShowcaseRow({ product: p, flip }: { product: Product; flip: boolean }) {
  const root = useRef<HTMLElement>(null)
  const collection = useContent().getCollection(p.collection)

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: Number(el.dataset.speed) },
          { yPercent: -Number(el.dataset.speed), ease: 'none', scrollTrigger: { trigger: root.current, scrub: true } },
        )
      })
      gsap.fromTo(
        '[data-big-number]',
        { xPercent: flip ? 10 : -10 },
        { xPercent: flip ? -10 : 10, ease: 'none', scrollTrigger: { trigger: root.current, scrub: true } },
      )
    },
    { scope: root },
  )

  return (
    <article ref={root} className="relative grid items-center gap-10 md:grid-cols-12 md:gap-6">
      <span
        data-big-number
        className={`display pointer-events-none absolute -top-24 text-[26vw] italic leading-none text-fog select-none md:-top-40 ${flip ? 'right-0' : 'left-0'}`}
        aria-hidden
      >
        {p.number}
      </span>

      <Link
        to={`/product/${p.slug}`}
        className={`relative md:col-span-7 ${flip ? 'md:order-2 md:col-start-6' : ''}`}
        data-cursor="View"
      >
        <Reveal y={60}>
          <HoverSwap primary={p.images[0]} secondary={p.images[1] ?? p.images[0]} alt={p.name} className="aspect-[4/5] w-full" sizes="(min-width: 768px) 58vw, 100vw" />
        </Reveal>
        <span className="eyebrow absolute top-4 left-4 flex items-center gap-2 rounded-full bg-paper/85 px-3 py-1.5 text-[0.6rem] backdrop-blur">
          <span className="size-1.5 rounded-full bg-accent" />
          {collection?.number} {collection?.name}
        </span>
      </Link>

      <div className={`relative md:col-span-5 ${flip ? 'md:order-1 md:pr-10' : 'md:pl-10'}`}>
        <Reveal>
          <p className="eyebrow tabular-nums text-charcoal/50">No. {p.number}</p>
        </Reveal>
        <h3 className="display mt-4 text-[clamp(3.4rem,7vw,7.5rem)] leading-[0.85]">
          <SplitText text={p.name} by="chars" />
        </h3>
        <Reveal delay={0.15}>
          <p className="display mt-5 text-2xl italic text-charcoal/80">{p.tagline}</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-charcoal/70">{p.description}</p>
        </Reveal>

        <div className="mt-10 grid grid-cols-3 gap-3">
          {p.details.map((d, j) => (
            <div key={d} data-speed={6 + j * 6} className="overflow-hidden">
              <Img
                image={d}
                alt={`${p.name} detail ${j + 1}`}
                className="aspect-square"
                imgClassName="scale-125 transition-transform duration-[1400ms] ease-lux hover:scale-150"
                sizes="15vw"
              />
            </div>
          ))}
        </div>

        <Reveal delay={0.25} className="mt-10 flex items-center justify-between gap-6 border-t border-ink/10 pt-6">
          <span className="display text-4xl tabular-nums">{formatPrice(p.price)}</span>
          <Link to={`/product/${p.slug}`} className="eyebrow link-underline flex items-center gap-2">
            View piece <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </article>
  )
}
