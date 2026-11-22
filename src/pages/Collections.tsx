import { motion } from 'framer-motion'
import { useMemo, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useAccent } from '../context/AccentContext'
import { useContent } from '../context/ContentContext'
import type { Collection } from '../data/collections'
import { useRouteAccent } from '../hooks/useRouteAccent'
import { EASE } from '../lib/gsap'
import { Rack } from '../components/rack/Rack'
import { railFor } from '../components/rack/rail'
import { PageHead } from '../components/ui/PageHead'

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve']
const countWord = (n: number) => WORDS[n] ?? String(n)

/**
 * The showroom floor: one rail per collection. Each rail carries that hour's pieces,
 * and stepping up to a rail repaints the room in its colour.
 */
export default function Collections() {
  useRouteAccent()
  const { collections } = useContent()

  return (
    <>
      <PageHead
        eyebrow="Collections — AW26"
        title={
          <>
            {countWord(collections.length)} <span className="italic text-accent">rails.</span>
          </>
        }
        copy="Every collection is an hour of the day, and every hour has exactly one colour. Step up to a rail to change the room — turn any piece to see its front."
      />
      <section className="gutter bg-paper pb-28 md:pb-40">
        <ul className="border-t border-ink/10">
          {collections.map((c, i) => (
            <CollectionRail key={c.slug} collection={c} index={i} />
          ))}
        </ul>
      </section>
    </>
  )
}

function CollectionRail({ collection: c, index }: { collection: Collection; index: number }) {
  const { setAccent } = useAccent()
  const { productsIn } = useContent()
  const pieces = productsIn(c.slug)
  const rail = useMemo(() => railFor(pieces, 7, 4), [pieces])
  const [first, ...rest] = c.name.split(' ')

  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: EASE, delay: (index % 2) * 0.06 }}
      className="group/row relative grid gap-6 border-b border-ink/10 py-10 md:grid-cols-12 md:items-center md:py-14"
      onPointerEnter={() => setAccent(c)}
      onFocusCapture={() => setAccent(c)}
    >
      <div className="md:col-span-4">
        <p className="eyebrow flex items-center gap-3 text-charcoal/55">
          <span className="tabular-nums">{c.number}</span>
          <span className="size-2 rounded-full" style={{ background: c.accent }} />
          {c.accentName}
          <span className="tabular-nums text-charcoal/40">{c.hours}</span>
        </p>
        <Link to={`/collections/${c.slug}`} className="group mt-4 block" data-cursor="Enter">
          <h2 className="display text-[clamp(2.8rem,5.5vw,5.5rem)] leading-[0.9]">
            {first} <span className="italic transition-colors duration-500 group-hover:text-[var(--c)]" style={{ '--c': c.accent } as CSSProperties}>{rest.join(' ')}</span>
          </h2>
        </Link>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-charcoal/70">{c.line}</p>
        <Link
          to={`/collections/${c.slug}`}
          className="eyebrow mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-ink/15 px-4 text-[0.62rem] transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper"
        >
          {pieces.length} pieces — Enter <span aria-hidden>→</span>
        </Link>
      </div>
      <div className="md:col-span-8">
        {rail.length ? (
          <Rack items={rail} className="rack-compact" />
        ) : (
          <p className="eyebrow py-10 text-center text-charcoal/45">Accessories only — nothing to hang</p>
        )}
      </div>
      <span className="absolute bottom-[-1px] left-0 h-[2px] w-full origin-left scale-x-0 transition-transform duration-1000 ease-lux group-hover/row:scale-x-100" style={{ background: c.accent }} />
    </motion.li>
  )
}
