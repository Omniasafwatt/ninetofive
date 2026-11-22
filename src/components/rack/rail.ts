import type { Product } from '../../data/products'
import type { GarmentKind } from './Garment'

/** Which drawing a product hangs as — by name first, then by department. Null = doesn't go on a hanger. */
export function kindFor(p: Product): GarmentKind | null {
  const n = p.name.toLowerCase()
  if (/coat|parka|trench/.test(n)) return 'coat'
  if (/blazer|suit/.test(n)) return 'blazer'
  if (/bomber|jacket/.test(n)) return 'bomber'
  if (/hoodie/.test(n)) return 'hoodie'
  if (/\btee\b|t-shirt/.test(n)) return 'tee'
  if (/shirt/.test(n)) return 'shirt'
  if (/knit|crew|sweater|cardigan|jumper/.test(n)) return 'knit'
  if (/trouser|chino|jean|pant/.test(n)) return 'trouser'
  switch (p.category) {
    case 'Tees':
      return 'tee'
    case 'Shirts':
      return 'shirt'
    case 'Knitwear':
    case 'Hoodies & Sweats':
      return 'knit'
    case 'Trousers':
      return 'trouser'
    case 'Outerwear':
      return 'bomber'
    default:
      return null
  }
}

/** The house neutrals — a piece's other colour, if it has one, makes the rail more interesting. */
const CORE = new Set(['Deep Black', 'Pure White', 'Concrete'])

export type RailItem = { slug: string; kind: GarmentKind; color?: string; phone?: false }

/**
 * Hangs a list of products on a rail: skips what can't hang, prefers each piece's non-neutral
 * colour (else cycles through them) so the rail isn't a wall of black, and keeps the first five for phones.
 */
export function railFor(products: Product[], max = 10, phoneMax = 5): RailItem[] {
  return products
    .flatMap((p) => {
      const kind = kindFor(p)
      return kind ? [{ p, kind }] : []
    })
    .slice(0, max)
    .map(({ p, kind }, i) => ({
      slug: p.slug,
      kind,
      color: (p.colors.find((c) => !CORE.has(c.name)) ?? p.colors[(i + 1) % Math.max(p.colors.length, 1)])?.name,
      ...(i >= phoneMax ? { phone: false as const } : {}),
    }))
}
