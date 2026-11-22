import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { formatPrice, type Product } from '../data/products'
import { Img } from './Img'

export function ProductCard({ product: p, priority }: { product: Product; priority?: boolean }) {
  const moment = useContent().getCollection(p.collection)
  const allSoldOut = p.sizes.length > 0 && p.sizes.every((s) => p.soldOut?.includes(s))
  return (
    <Link to={`/product/${p.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-fog">
        <Img image={p.images[0]} alt={p.name} className="aspect-[4/5]" imgClassName="transition-transform duration-[1200ms] ease-lux group-hover:scale-[1.04]" sizes="(min-width: 1024px) 25vw, 50vw" priority={priority} />
        {p.images[1] && (
          <Img image={p.images[1]} alt="" className="absolute! inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" sizes="(min-width: 1024px) 25vw, 50vw" />
        )}
        {(p.tag || allSoldOut) && (
          <span className={`absolute top-3 left-3 rounded-full px-3 py-1.5 text-[0.6rem] font-medium tracking-[0.2em] uppercase ${allSoldOut ? 'bg-ink text-white' : 'bg-white text-red'}`}>
            {allSoldOut ? 'Sold out' : p.tag}
          </span>
        )}
        <span className="absolute right-3 bottom-3 translate-y-2 rounded-full bg-red px-4 py-2 text-[0.6rem] tracking-[0.2em] text-white uppercase opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          View
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="truncate text-[0.82rem] font-medium tracking-[0.12em] uppercase">{p.name}</p>
          {moment && <p className="mt-1 text-xs text-charcoal/60">{moment.name}</p>}
        </div>
        <p className="shrink-0 text-sm text-red">{formatPrice(p.price)}</p>
      </div>
      {p.colors.length > 1 && (
        <div className="mt-2.5 flex gap-1.5 px-1">
          {p.colors.map((c) => (
            <span key={c.name} title={c.name} className="size-3 rounded-full ring-1 ring-ink/15" style={{ background: c.hex }} />
          ))}
        </div>
      )}
    </Link>
  )
}
