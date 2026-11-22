import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { formatPrice, type Product } from '../../data/products'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import { EASE } from '../../lib/gsap'
import { Garment, GarmentEdge, type GarmentKind } from './Garment'
import type { RailItem } from './rail'

/** What hangs on the rail, left to right. `phone: false` pieces stay off the narrower rail on phones. */
const RAIL: RailItem[] = [
  { slug: 'last-train-coat', kind: 'coat', color: 'Camel' },
  { slug: 'hour-tee', kind: 'tee', color: 'Pure White' },
  { slug: 'signal-bomber', kind: 'bomber', color: 'Olive', phone: false },
  { slug: 'campus-knit', kind: 'knit', color: 'Stone' },
  { slug: 'shift-hoodie', kind: 'hoodie', color: 'Concrete' },
  { slug: 'lecture-shirt', kind: 'shirt', color: 'Oxford Blue' },
  { slug: 'elevator-blazer', kind: 'blazer', color: 'Midnight', phone: false },
  { slug: 'library-chino', kind: 'trouser', color: 'Sand', phone: false },
]

/** Resting angles vary a little, the way clothes never hang perfectly parallel. */
const REST = [-74, -78, -71, -77, -73, -79, -72, -76]

type Piece = { product: Product; kind: GarmentKind; color: string; colorName: string; accent: string; phone: boolean }
type Swing = { n: number; dir: number; amp: number }

/**
 * A clothes rail seen from the front: every piece hangs edge-on, the way it would in a shop.
 * Hover (or tap, or focus) a piece and it turns on its hook to face you while the
 * neighbours knock and swing on the rail.
 */
type RackProps = {
  ready?: boolean
  /** What hangs on this rail (defaults to the home showroom rail). Memoise it — it's a dependency. */
  items?: RailItem[]
  className?: string
  caption?: boolean
}

export function Rack({ ready = true, items = RAIL, className = '', caption = true }: RackProps) {
  const { products, collections } = useContent()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const pointer = useRef<string>('mouse')
  const [active, setActive] = useState<number | null>(null)
  const [swings, setSwings] = useState<Record<number, Swing>>({})

  const pieces = useMemo<Piece[]>(
    () =>
      items.flatMap((r) => {
        const product = products.find((p) => p.slug === r.slug)
        if (!product) return []
        const c = product.colors.find((x) => x.name === r.color) ?? product.colors[0]
        const accent = collections.find((x) => x.slug === product.collection)?.accent ?? '#6b1e2e'
        return [{ product, kind: r.kind, color: c?.hex ?? '#a8a59e', colorName: c?.name ?? '', accent, phone: r.phone !== false }]
      }),
    [items, products, collections],
  )

  // A new set of pieces (a filter changed) starts with everything edge-on again.
  const key = pieces.map((p) => p.product.slug).join()
  useEffect(() => setActive(null), [key])

  // Turning a piece knocks the ones beside it: they swing away, the further the gentler.
  const turn = (next: number | null) => {
    setActive((prev) => {
      if (prev === next) return prev
      const centre = next ?? prev
      if (centre !== null && !reduce) {
        setSwings((s) => {
          const out = { ...s }
          pieces.forEach((_, j) => {
            const d = j - centre
            if (d === 0 || Math.abs(d) > 2) return
            out[j] = { n: (s[j]?.n ?? 0) + 1, dir: Math.sign(d) * (next === null ? -0.5 : 1), amp: Math.abs(d) === 1 ? 5 : 2.5 }
          })
          return out
        })
      }
      return next
    })
  }

  // A tap anywhere off the rail turns the piece back.
  useEffect(() => {
    const off = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setActive(null)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    document.addEventListener('pointerdown', off)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', off)
      document.removeEventListener('keydown', esc)
    }
  }, [])

  const current = active !== null ? pieces[active] : null
  if (!pieces.length) return null

  return (
    <div ref={root} className={`rack relative ${className}`} onPointerLeave={(e) => e.pointerType === 'mouse' && turn(null)}>
      <div className="relative" style={{ height: 'calc(var(--rail-top) + var(--face) * 1.75 + 2.5rem)' }}>
        {/* Frame: chrome rail on two uprights, standing on the floor */}
        <div className="absolute inset-x-0 h-[6px] rounded-full bg-gradient-to-b from-[#d9d4cc] via-[#8f877d] to-[#5e5750] shadow-[0_2px_6px_rgba(42,31,25,0.25)]" style={{ top: 'var(--rail-top)' }} />
        {[0, 1].map((side) => (
          <div
            key={side}
            className={`absolute bottom-3 w-[5px] rounded-full bg-gradient-to-r from-[#5e5750] via-[#b9b2a8] to-[#6b645c] ${side ? 'right-[2px]' : 'left-[2px]'}`}
            style={{ top: 'calc(var(--rail-top) - 4px)' }}
          >
            <span className="absolute -bottom-1 left-1/2 h-[5px] w-14 -translate-x-1/2 rounded-full bg-[#5e5750]" />
          </div>
        ))}
        <div className="absolute inset-x-[8%] bottom-1 h-6 rounded-[50%] bg-ink/10 blur-xl" />

        <div
          role="group"
          aria-label="Clothes rail — turn a piece to see its front"
          className="absolute inset-x-0 flex justify-center"
          style={{ top: 'calc(var(--rail-top) + 3px - var(--face) * 0.045)' }}
        >
          {pieces.map((p, i) => (
            <Hanging
              key={p.product.slug}
              piece={p}
              index={i}
              active={active === i}
              swing={swings[i]}
              ready={ready}
              reduce={reduce}
              onEnter={() => pointer.current === 'mouse' && turn(i)}
              onPointer={(type) => (pointer.current = type)}
              onPress={() => {
                // Mouse and keyboard already turned it on hover/focus, so their click opens the piece. Touch toggles.
                if (pointer.current !== 'touch' && pointer.current !== 'pen' && active === i) navigate(`/product/${p.product.slug}`)
                else turn(active === i ? null : i)
              }}
              onFocus={() => turn(i)}
            />
          ))}
        </div>
      </div>

      {/* Caption: the label on the piece that's facing you. Fixed height so nothing jumps. */}
      {caption && (
      <div className="relative mx-auto flex h-16 max-w-xl items-center justify-center text-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {current ? (
            <motion.div
              key={current.product.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex flex-col items-center gap-1.5"
            >
              <p className="flex items-center gap-3 text-[0.95rem]">
                <span className="eyebrow text-ink/45">No. {current.product.number}</span>
                <span className="font-medium">{current.product.name}</span>
                <span className="tabular-nums text-ink/60">{formatPrice(current.product.price)}</span>
              </p>
              <Link to={`/product/${current.product.slug}`} className="eyebrow link-underline flex items-center gap-2 text-accent" style={{ '--accent': current.accent } as CSSProperties}>
                <span className="size-1.5 rounded-full bg-current" />
                {current.colorName} — View piece →
              </Link>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: ready ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: ready ? 0.2 : 0 }}
              className="eyebrow text-ink/45"
            >
              <span className="hidden [@media(hover:hover)]:inline">Hover a piece to turn it</span>
              <span className="[@media(hover:hover)]:hidden">Tap a piece to turn it</span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      )}
    </div>
  )
}

type HangingProps = {
  piece: Piece
  index: number
  active: boolean
  swing?: Swing
  ready: boolean
  reduce: boolean
  onEnter: () => void
  onPointer: (type: string) => void
  onPress: () => void
  onFocus: () => void
}

function Hanging({ piece, index, active, swing, ready, reduce, onEnter, onPointer, onPress, onFocus }: HangingProps) {
  const [scope, animate] = useAnimate()
  const { product, kind, color, accent } = piece

  useEffect(() => {
    if (!swing || reduce) return
    const a = swing.amp * swing.dir
    animate(scope.current, { rotate: [0, a, -a * 0.55, a * 0.25, 0] }, { duration: 1.6, ease: 'easeInOut' })
  }, [swing, reduce, animate, scope])

  // The turning piece swings a touch too, as it's lifted round on its hook.
  useEffect(() => {
    if (reduce || !scope.current) return
    animate(scope.current, { rotate: [0, active ? -2 : 1.5, 0] }, { duration: 1.1, ease: 'easeInOut' })
  }, [active, reduce, animate, scope])


  return (
    <motion.div
      className={`relative shrink-0 transition-[width] duration-700 ease-lux ${piece.phone ? '' : 'hidden sm:block'} ${active ? 'z-10' : ''}`}
      style={{ width: active ? 'calc(var(--face) + 1.5rem)' : 'var(--rest)', height: 'calc(var(--face) * 1.75)' }}
      initial={{ opacity: 0, x: 60 }}
      animate={ready ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
      transition={{ duration: reduce ? 0 : 1.1, ease: EASE, delay: reduce ? 0 : 0.35 + index * 0.08 }}
    >
      <div ref={scope} className="pointer-events-none absolute inset-y-0 left-1/2 w-[var(--face)] -translate-x-1/2" style={{ transformOrigin: '44% 1%', perspective: '1100px' }}>
        <button
          type="button"
          aria-label={`${product.name} — ${active ? 'facing you' : 'turn to see the front'}`}
          aria-pressed={active}
          onPointerEnter={(e) => {
            onPointer(e.pointerType)
            onEnter()
          }}
          onPointerDown={(e) => onPointer(e.pointerType)}
          onClick={onPress}
          onFocus={onFocus}
          onKeyDown={(e) => e.key === 'Enter' && onPointer('keyboard')}
          data-cursor={active ? 'View' : 'hide'}
          className="pointer-events-auto relative block h-full w-full outline-offset-8 [transform-style:preserve-3d] transition-transform duration-[900ms] ease-lux"
          style={{
            transform: `rotateY(${active ? 0 : REST[index % REST.length]}deg)`,
          }}
        >
          <Garment kind={kind} color={color} accent={accent} className="pointer-events-none absolute inset-0 h-full w-full drop-shadow-[0_18px_18px_rgba(42,31,25,0.18)]" />
          <GarmentEdge kind={kind} color={color} />
        </button>
      </div>
    </motion.div>
  )
}
