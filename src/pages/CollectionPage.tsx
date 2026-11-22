import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { useRouteAccent } from '../hooks/useRouteAccent'
import { ProductCard } from '../components/product/ProductCard'
import { CollectionStory } from '../components/sections/CollectionStory'
import { Img } from '../components/ui/Img'
import { SectionLabel } from '../components/ui/SectionLabel'
import { HangingFrame } from '../components/ui/HangingFrame'
import { PageHead } from '../components/ui/PageHead'
import { Rack } from '../components/rack/Rack'
import { railFor } from '../components/rack/rail'

export default function CollectionPage() {
  const { slug } = useParams()
  const { collections, getCollection, productsIn } = useContent()
  const c = getCollection(slug)
  useRouteAccent(c)
  const pieces = c ? productsIn(c.slug) : []
  const rail = useMemo(() => railFor(pieces), [pieces])

  if (!c) return <Navigate to="/collections" replace />
  const [first, ...rest] = c.name.split(' ')
  const next = collections[(collections.indexOf(c) + 1) % collections.length]

  return (
    <>
      <PageHead
        eyebrow={
          <>
            Collection {c.number} — {c.accentName} — <span className="tabular-nums">{c.hours}</span>
          </>
        }
        title={
          <>
            {first} <span className="italic text-accent">{rest.join(' ')}</span>
          </>
        }
        copy={
          <>
            <p>{c.line}</p>
            <p className="eyebrow mt-4 text-charcoal/55">{c.mood}</p>
          </>
        }
        aside={
          <HangingFrame className="mx-auto w-full max-w-[380px] md:ml-auto md:mr-0">
            <Img image={c.cover} alt={`${c.name} campaign`} className="aspect-[4/5]" sizes="(min-width: 768px) 380px, 100vw" priority />
          </HangingFrame>
        }
      >
        {rail.length > 0 && <Rack items={rail} className="rack-compact" />}
      </PageHead>

      <CollectionStory collection={c} index={c.number} cta={false} />

      <section className="gutter bg-paper py-28 md:py-40">
        <SectionLabel index="—" title={`The pieces — ${c.name}`} />
        <div className="mt-14 grid gap-x-6 gap-y-20 md:grid-cols-2">
          {pieces.map((p, i) => (
            <div key={p.slug} className={i % 2 === 1 ? 'md:mt-40' : ''}>
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </section>

      <Link to={`/collections/${next.slug}`} className="group block border-t border-ink/10 bg-fog" data-cursor="Next">
        <div className="gutter grid items-center gap-10 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-8">
            <p className="eyebrow flex items-center gap-3 text-charcoal/60">
              Next rail <span className="size-2 rounded-full" style={{ background: next.accent }} /> {next.number} — {next.hours}
            </p>
            <p className="display mt-6 text-[clamp(3.5rem,10vw,10rem)] leading-[0.85] transition-transform duration-1000 ease-lux group-hover:translate-x-4">
              {next.name} <span style={{ color: next.accent }}>→</span>
            </p>
          </div>
          <HangingFrame className="hidden w-full max-w-[260px] md:col-span-4 md:ml-auto md:block">
            <Img image={next.cover} alt="" className="aspect-[4/5]" imgClassName="transition-[scale] duration-[2000ms] ease-lux group-hover:scale-110" sizes="260px" />
          </HangingFrame>
        </div>
      </Link>
    </>
  )
}
