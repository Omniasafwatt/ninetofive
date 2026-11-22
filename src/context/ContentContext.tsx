import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { collections as seedCollections, type Collection } from '../data/collections'
import { defaultImages, type ImageKey, type ImageSource } from '../data/images'
import { products as seedProducts, type Product } from '../data/products'
import { kvDelete, kvGet, kvSet, slugify } from '../lib/storage'

export type SiteContent = {
  version: 1
  collections: Collection[]
  products: Product[]
  images: Record<ImageKey, ImageSource>
  updatedAt: string | null
  /** Which release of the seed catalogue this content has absorbed (see migrate()). */
  seedRevision?: number
  /** Launch products the owner deleted or renamed, so they aren't merged back in. */
  removedSeed?: string[]
}

/** New key for the Nine to Five redesign, so the old demo catalogue saved in browsers isn't merged in. */
const STORAGE_KEY = 'content-ntf'
/** Bump when src/data gains products that existing saved content should pick up. */
const SEED_REVISION = 1
const CHANNEL = 'ntf-content'

const seed = (): SiteContent => ({
  version: 1,
  collections: structuredClone(seedCollections),
  products: structuredClone(seedProducts),
  images: structuredClone(defaultImages),
  updatedAt: null,
  seedRevision: SEED_REVISION,
})

/**
 * Brings content saved by an older release up to date without touching the owner's edits:
 * new seed products are appended and missing category/tag fields are filled from the seed.
 */
function migrate(saved: SiteContent): SiteContent {
  const images = { ...defaultImages, ...saved.images }
  const removed = new Set(saved.removedSeed ?? [])
  const known = new Set(saved.products.map((p) => p.slug))
  const bySlug = new Map(seedProducts.map((p) => [p.slug, p]))
  const products = [
    ...saved.products.map((p) => ({ ...p, category: p.category ?? bySlug.get(p.slug)?.category, tag: p.tag ?? bySlug.get(p.slug)?.tag })),
    // Every launch product the owner hasn't deliberately deleted or renamed is always present.
    ...structuredClone(seedProducts.filter((p) => !known.has(p.slug) && !removed.has(p.slug))),
  ]
  return { ...saved, products, images, seedRevision: SEED_REVISION }
}

function markRemoved(list: string[] | undefined, slug: string) {
  return seedProducts.some((p) => p.slug === slug) ? [...new Set([...(list ?? []), slug])] : list
}

/** Where an image key is referenced — shown in the media library and used to block unsafe deletes. */
export type ImageUsage = { kind: 'product' | 'collection' | 'site'; label: string; to: string }

/** Image keys the campaign sections use directly (hero, lookbook, fabric…). */
const SITE_SLOTS: Record<string, string> = {
  coatWoman: 'Home — hero',
  portraitWoman: 'Home — brand section & About page',
  denimWoman: 'About page — photo',
}

type ContentValue = SiteContent & {
  loaded: boolean
  getProduct: (slug?: string) => Product | undefined
  getCollection: (slug?: string) => Collection | undefined
  productsIn: (slug: string) => Product[]
  image: (key: ImageKey) => ImageSource | undefined
  imageUsage: (key: ImageKey) => ImageUsage[]
  saveProduct: (p: Product, previousSlug?: string) => Promise<void>
  deleteProduct: (slug: string) => Promise<void>
  saveCollection: (c: Collection, previousSlug?: string) => Promise<void>
  deleteCollection: (slug: string) => Promise<void>
  setImage: (key: ImageKey, src: ImageSource) => Promise<void>
  addImage: (src: ImageSource) => Promise<ImageKey>
  deleteImage: (key: ImageKey) => Promise<void>
  replaceAll: (next: SiteContent) => Promise<void>
  resetAll: () => Promise<void>
  uniqueSlug: (base: string, taken: string[]) => string
}

const ContentContext = createContext<ContentValue | null>(null)

/**
 * The site's single source of truth for products, collections and images.
 * Starts from the seed files in src/data, overlays whatever the admin panel saved,
 * and broadcasts saves so every open tab updates live.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<SiteContent>(seed)
  const [loaded, setLoaded] = useState(false)
  const channel = useRef<BroadcastChannel | null>(null)
  const latest = useRef(content)
  latest.current = content

  const load = useCallback(async () => {
    const saved = await kvGet<SiteContent>(STORAGE_KEY)
    if (saved?.version === 1) {
      setContent(migrate(saved))
    } else {
      setContent(seed())
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    load()
    if (typeof BroadcastChannel === 'undefined') return
    const ch = new BroadcastChannel(CHANNEL)
    ch.onmessage = () => load()
    channel.current = ch
    return () => ch.close()
  }, [load])

  const commit = useCallback(async (update: (prev: SiteContent) => SiteContent) => {
    const next = { ...update(latest.current), updatedAt: new Date().toISOString() }
    latest.current = next
    setContent(next)
    const ok = await kvSet(STORAGE_KEY, next)
    if (!ok) throw new Error('Could not save — browser storage is unavailable or full.')
    channel.current?.postMessage('saved')
  }, [])

  const value = useMemo<ContentValue>(() => {
    const { products, collections, images } = content
    const uniqueSlug = (base: string, taken: string[]) => {
      const root = slugify(base) || 'untitled'
      let slug = root
      for (let i = 2; taken.includes(slug); i++) slug = `${root}-${i}`
      return slug
    }

    return {
      ...content,
      loaded,
      uniqueSlug,
      getProduct: (slug) => products.find((p) => p.slug === slug),
      getCollection: (slug) => collections.find((c) => c.slug === slug),
      productsIn: (slug) => products.filter((p) => p.collection === slug),
      image: (key) => images[key],
      imageUsage: (key) => {
        const uses: ImageUsage[] = []
        products.forEach((p) => {
          if (p.images.includes(key) || p.details.includes(key)) uses.push({ kind: 'product', label: p.name, to: `/admin/products/${p.slug}` })
        })
        collections.forEach((c) => {
          if (c.cover === key || c.gallery.includes(key)) uses.push({ kind: 'collection', label: c.name, to: `/admin/collections/${c.slug}` })
        })
        if (SITE_SLOTS[key]) uses.push({ kind: 'site', label: SITE_SLOTS[key], to: '/' })
        return uses
      },

      saveProduct: (p, previousSlug) =>
        commit((prev) => {
          const key = previousSlug ?? p.slug
          const exists = prev.products.some((x) => x.slug === key)
          let list = exists ? prev.products.map((x) => (x.slug === key ? p : x)) : [...prev.products, p]
          if (key !== p.slug) list = list.map((x) => ({ ...x, styleWith: x.styleWith.map((s) => (s === key ? p.slug : s)) }))
          return { ...prev, products: list, removedSeed: key !== p.slug ? markRemoved(prev.removedSeed, key) : prev.removedSeed }
        }),
      deleteProduct: (slug) =>
        commit((prev) => ({
          ...prev,
          removedSeed: markRemoved(prev.removedSeed, slug),
          products: prev.products.filter((p) => p.slug !== slug).map((p) => ({ ...p, styleWith: p.styleWith.filter((s) => s !== slug) })),
        })),

      saveCollection: (c, previousSlug) =>
        commit((prev) => {
          const key = previousSlug ?? c.slug
          const exists = prev.collections.some((x) => x.slug === key)
          return {
            ...prev,
            collections: exists ? prev.collections.map((x) => (x.slug === key ? c : x)) : [...prev.collections, c],
            products: key !== c.slug ? prev.products.map((p) => (p.collection === key ? { ...p, collection: c.slug } : p)) : prev.products,
          }
        }),
      deleteCollection: (slug) =>
        commit((prev) => {
          if (prev.products.some((p) => p.collection === slug)) throw new Error('Move or delete this collection’s products first.')
          if (prev.collections.length <= 1) throw new Error('The site needs at least one collection.')
          return { ...prev, collections: prev.collections.filter((c) => c.slug !== slug) }
        }),

      setImage: (key, src) => commit((prev) => ({ ...prev, images: { ...prev.images, [key]: src } })),
      addImage: async (src) => {
        const key = uniqueSlug(src.label || 'image', Object.keys(latest.current.images)).replace(/-(\w)/g, (_, c: string) => c.toUpperCase())
        await commit((prev) => ({ ...prev, images: { ...prev.images, [key]: src } }))
        return key
      },
      deleteImage: (key) =>
        commit((prev) => {
          const { [key]: _removed, ...rest } = prev.images
          void _removed
          return { ...prev, images: rest }
        }),

      replaceAll: (next) => commit(() => migrate(next)),
      resetAll: async () => {
        await kvDelete(STORAGE_KEY)
        const fresh = seed()
        latest.current = fresh
        setContent(fresh)
        channel.current?.postMessage('saved')
      },
    }
  }, [content, loaded, commit])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside ContentProvider')
  return ctx
}

export function isValidContent(x: unknown): x is SiteContent {
  const c = x as SiteContent
  return !!c && c.version === 1 && Array.isArray(c.products) && Array.isArray(c.collections) && typeof c.images === 'object'
}
