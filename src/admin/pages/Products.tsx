import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { CATEGORIES, TAGS, formatPrice, type Product } from '../../data/products'
import { slugify } from '../../lib/storage'
import { ImageListField, Thumb } from '../ImagePicker'
import { Badge, Button, Card, ColorInput, NumberInput, PageHeader, RowActions, Select, StringList, TextArea, TextInput, useToast } from '../ui'
import { useDraft } from '../useDraft'

export function ProductsList() {
  const { products, collections, getCollection, deleteProduct } = useContent()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const list = products.filter((p) => (filter === 'all' || p.collection === filter) && `${p.name} ${p.number} ${p.tagline}`.toLowerCase().includes(q.toLowerCase()))

  const remove = async (p: Product) => {
    if (!confirm(`Delete “${p.name}”? This removes it from the shop.`)) return
    await deleteProduct(p.slug)
    toast(`${p.name} deleted`)
  }

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        actions={
          <Link to="/admin/products/new">
            <Button variant="primary">+ New product</Button>
          </Link>
        }
      >
        Every word and photo on a product page is editable here. Changes go live on the site as soon as you save.
      </PageHeader>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="w-full rounded-full border border-ink/12 bg-paper px-4 py-2.5 text-sm outline-none focus:border-ink/40 sm:max-w-xs" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-full border border-ink/12 bg-paper px-4 py-2.5 text-sm outline-none">
          <option value="all">All collections</option>
          {collections.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.number} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper">
        {list.length === 0 && <p className="p-8 text-center text-sm text-charcoal/60">No products match.</p>}
        <ul className="divide-y divide-ink/8">
          {list.map((p) => {
            const c = getCollection(p.collection)
            return (
              <li key={p.slug} className="flex items-center gap-4 p-3 pr-4 transition-colors hover:bg-fog/60">
                <Link to={`/admin/products/${p.slug}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <Thumb image={p.images[0]} className="aspect-[3/4] w-14 shrink-0 rounded-lg" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{p.name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-charcoal/55">
                      <span>No. {p.number}</span>
                      {p.category && <span>{p.category}</span>}
                      {p.tag && <Badge tone="accent">{p.tag}</Badge>}
                      {c && (
                        <Badge>
                          <span className="size-1.5 rounded-full" style={{ background: c.accent }} />
                          {c.name}
                        </Badge>
                      )}
                      <span>{p.images.length} photos</span>
                    </p>
                  </div>
                </Link>
                <span className="hidden text-sm font-semibold tabular-nums sm:block">{formatPrice(p.price)}</span>
                <div className="flex items-center gap-1">
                  <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost">
                      View ↗
                    </Button>
                  </a>
                  <Link to={`/admin/products/${p.slug}`}>
                    <Button size="sm">Edit</Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => remove(p)} title="Delete">
                    ✕
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

function blankProduct(collection: string, number: string, image: string): Product {
  return {
    slug: '',
    number,
    name: '',
    collection,
    category: CATEGORIES[0],
    price: 100,
    tagline: '',
    description: '',
    images: image ? [image] : [],
    details: [],
    colors: [{ name: 'Deep Black', hex: '#0a0a0a' }],
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: [],
    fabric: [
      { label: 'Weight', value: '' },
      { label: 'Composition', value: '' },
      { label: 'Knit', value: '' },
      { label: 'Made in', value: '' },
    ],
    features: [],
    care: '',
    styleWith: [],
  }
}

export function ProductEditor() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { products, collections, getProduct, saveProduct, deleteProduct, uniqueSlug, images } = useContent()
  const existing = getProduct(slug)
  const isNew = !slug

  const initial = useMemo(() => {
    if (existing) return structuredClone(existing)
    const nextNumber = String(Math.max(0, ...products.map((p) => Number(p.number) || 0)) + 1).padStart(3, '0')
    return blankProduct(collections[0]?.slug ?? '', nextNumber, Object.keys(images)[0] ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, existing?.slug])

  const { draft, set, dirty, reset } = useDraft(initial)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Keep the URL slug in step with the name until someone edits it by hand.
  useEffect(() => {
    if (!slugTouched) set({ slug: slugify(draft.name) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.name, slugTouched])

  if (slug && !existing) {
    return (
      <PageHeader eyebrow="Products" title="Product not found">
        <Link to="/admin/products" className="underline">
          Back to products
        </Link>
      </PageHeader>
    )
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!draft.name.trim()) e.name = 'Required'
    if (!draft.slug) e.slug = 'Required'
    else if (products.some((p) => p.slug === draft.slug && p.slug !== existing?.slug)) e.slug = 'Already used'
    if (!draft.collection) e.collection = 'Required'
    if (draft.price <= 0) e.price = 'Must be above 0'
    if (!draft.images.length) e.images = 'Add at least one photo'
    if (!draft.colors.length) e.colors = 'Add at least one colour'
    if (!draft.sizes.length) e.sizes = 'Add at least one size'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) {
      toast('Fix the highlighted fields first', 'error')
      return
    }
    setSaving(true)
    try {
      const clean: Product = {
        ...draft,
        name: draft.name.trim(),
        features: draft.features.map((f) => f.trim()).filter(Boolean),
        fabric: draft.fabric.filter((f) => f.label.trim() || f.value.trim()),
        soldOut: (draft.soldOut ?? []).filter((s) => draft.sizes.includes(s)),
      }
      await saveProduct(clean, existing?.slug)
      reset(clean)
      toast(isNew ? 'Product created' : 'Changes saved')
      if (isNew || existing?.slug !== clean.slug) navigate(`/admin/products/${clean.slug}`, { replace: true })
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const duplicate = async () => {
    const copy: Product = { ...structuredClone(draft), name: `${draft.name} (copy)`, slug: uniqueSlug(draft.slug, products.map((p) => p.slug)) }
    await saveProduct(copy)
    toast('Duplicated')
    navigate(`/admin/products/${copy.slug}`)
  }

  const remove = async () => {
    if (!existing || !confirm(`Delete “${existing.name}”?`)) return
    await deleteProduct(existing.slug)
    toast('Product deleted')
    navigate('/admin/products')
  }

  const addSize = (s: string) => {
    const v = s.trim().toUpperCase()
    if (v && !draft.sizes.includes(v)) set({ sizes: [...draft.sizes, v] })
  }

  return (
    <>
      <PageHeader
        eyebrow={isNew ? 'New product' : `Product No. ${draft.number}`}
        title={draft.name || 'Untitled product'}
        actions={
          <>
            {dirty && <Badge tone="warn">Unsaved changes</Badge>}
            {!isNew && (
              <a href={`/product/${existing?.slug}`} target="_blank" rel="noreferrer">
                <Button variant="ghost">View on site ↗</Button>
              </a>
            )}
            <Button variant="ghost" disabled={!dirty} onClick={() => reset()}>
              Discard
            </Button>
            <Button variant="accent" onClick={save} disabled={saving || (!dirty && !isNew)}>
              {saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
            </Button>
          </>
        }
      >
        <Link to="/admin/products" className="underline-offset-4 hover:underline">
          ← All products
        </Link>
      </PageHeader>

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-5">
          <Card title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Name" value={draft.name} onChange={(v) => set({ name: v })} error={errors.name} placeholder="e.g. Shift Hoodie" />
              <TextInput
                label="URL slug"
                hint={`/product/${draft.slug || '…'}`}
                value={draft.slug}
                onChange={(v) => {
                  setSlugTouched(true)
                  set({ slug: slugify(v) })
                }}
                error={errors.slug}
              />
              <TextInput label="Tagline" value={draft.tagline} onChange={(v) => set({ tagline: v })} placeholder="The one you reach for at 6am." />
              <div className="grid grid-cols-2 gap-4">
                <NumberInput label="Price" prefix="$" value={draft.price} onChange={(v) => set({ price: v })} />
                <TextInput label="Number" value={draft.number} onChange={(v) => set({ number: v })} />
              </div>
              <div className="sm:col-span-2">
                <TextArea label="Description" rows={4} value={draft.description} onChange={(v) => set({ description: v })} />
              </div>
            </div>
          </Card>

          <Card title="Photos" description="The first photo is the main image; the second appears on hover. Click any photo to replace it.">
            {errors.images && <p className="mb-3 text-xs text-red-600">{errors.images}</p>}
            <div className="flex flex-col gap-8">
              <ImageListField label="Gallery" value={draft.images} onChange={(v) => set({ images: v })} captions={['Main', 'Hover']} />
              <ImageListField label="Close-ups & details" hint="Used in the product spread and the “Up close” section" value={draft.details} onChange={(v) => set({ details: v })} />
            </div>
          </Card>

          <Card title="Colours" description="Shown as swatches on the product page and cards." aside={errors.colors && <span className="text-xs text-red-600">{errors.colors}</span>}>
            <div className="flex flex-col gap-3">
              {draft.colors.map((c, i) => (
                <div key={i} className="flex items-end gap-3">
                  <div className="flex-1">
                    <TextInput label="Colour name" value={c.name} onChange={(v) => set({ colors: draft.colors.map((x, j) => (j === i ? { ...x, name: v } : x)) })} />
                  </div>
                  <div className="w-44">
                    <ColorInput label="Swatch" value={c.hex} onChange={(v) => set({ colors: draft.colors.map((x, j) => (j === i ? { ...x, hex: v } : x)) })} />
                  </div>
                  <RowActions onRemove={draft.colors.length > 1 ? () => set({ colors: draft.colors.filter((_, j) => j !== i) }) : undefined} />
                </div>
              ))}
              <div>
                <Button size="sm" variant="ghost" onClick={() => set({ colors: [...draft.colors, { name: 'New colour', hex: '#a8a59e' }] })}>
                  + Add colour
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Sizes" description="Click a size to mark it sold out." aside={errors.sizes && <span className="text-xs text-red-600">{errors.sizes}</span>}>
            <div className="flex flex-wrap items-center gap-2">
              {draft.sizes.map((s) => {
                const out = draft.soldOut?.includes(s)
                return (
                  <span key={s} className={`flex items-center overflow-hidden rounded-full border text-xs font-semibold ${out ? 'border-ink/10 text-charcoal/40' : 'border-ink/25'}`}>
                    <button
                      type="button"
                      onClick={() => set({ soldOut: out ? (draft.soldOut ?? []).filter((x) => x !== s) : [...(draft.soldOut ?? []), s] })}
                      className={`px-3 py-1.5 ${out ? 'line-through' : ''}`}
                      title={out ? 'Mark in stock' : 'Mark sold out'}
                    >
                      {s}
                    </button>
                    <button type="button" onClick={() => set({ sizes: draft.sizes.filter((x) => x !== s) })} className="border-l border-ink/10 px-2 py-1.5 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${s}`}>
                      ✕
                    </button>
                  </span>
                )
              })}
              <SizeAdder onAdd={addSize} />
            </div>
          </Card>

          <Card title="Fabric & composition" description="Label / value pairs. The first and third values headline the “Up close” section.">
            <div className="flex flex-col gap-3">
              {draft.fabric.map((f, i) => (
                <div key={i} className="flex items-end gap-3">
                  <div className="w-40">
                    <TextInput label="Label" value={f.label} onChange={(v) => set({ fabric: draft.fabric.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />
                  </div>
                  <div className="flex-1">
                    <TextInput label="Value" value={f.value} onChange={(v) => set({ fabric: draft.fabric.map((x, j) => (j === i ? { ...x, value: v } : x)) })} />
                  </div>
                  <RowActions onRemove={() => set({ fabric: draft.fabric.filter((_, j) => j !== i) })} />
                </div>
              ))}
              <div>
                <Button size="sm" variant="ghost" onClick={() => set({ fabric: [...draft.fabric, { label: '', value: '' }] })}>
                  + Add row
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Details & care">
            <div className="flex flex-col gap-5">
              <StringList label="Feature list" items={draft.features} onChange={(v) => set({ features: v })} placeholder="e.g. Double-layer hood" addLabel="Add feature" />
              <TextArea label="Care instructions" rows={2} value={draft.care} onChange={(v) => set({ care: v })} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card title="Organisation" description="Where this piece appears in the shop.">
            <div className="flex flex-col gap-4">
              <Select label="Collection" value={draft.collection} onChange={(v) => set({ collection: v })} options={collections.map((c) => ({ value: c.slug, label: `${c.number} — ${c.name}` }))} />
              <TextInput label="Department" hint="Pick or type a new one" list="admin-departments" value={draft.category ?? ''} onChange={(v) => set({ category: v || undefined })} placeholder="e.g. Outerwear" />
              <datalist id="admin-departments">
                {[...new Set([...CATEGORIES, ...products.map((p) => p.category).filter(Boolean)])].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <Select label="Card label" value={draft.tag ?? ''} onChange={(v) => set({ tag: v || undefined })} options={[{ value: '', label: 'None' }, ...TAGS.map((t) => ({ value: t, label: t }))]} />
            </div>
          </Card>

          <Card title="Wear it with" description="Suggested on the product page.">
            <div className="flex flex-col gap-2">
              {products
                .filter((p) => p.slug !== existing?.slug)
                .map((p) => {
                  const on = draft.styleWith.includes(p.slug)
                  return (
                    <label key={p.slug} className="flex cursor-pointer items-center gap-3 rounded-xl p-1.5 hover:bg-fog">
                      <input type="checkbox" checked={on} onChange={() => set({ styleWith: on ? draft.styleWith.filter((s) => s !== p.slug) : [...draft.styleWith, p.slug] })} className="accent-[var(--accent)]" />
                      <Thumb image={p.images[0]} className="aspect-square w-9 rounded-md" />
                      <span className="text-sm">{p.name}</span>
                    </label>
                  )
                })}
            </div>
          </Card>

          <Card title="Preview">
            <Thumb image={draft.images[0]} className="aspect-[3/4] rounded-xl" />
            <p className="display mt-3 text-3xl leading-none">{draft.name || 'Untitled'}</p>
            <p className="mt-1 text-sm italic text-charcoal/60">{draft.tagline}</p>
            <p className="mt-2 font-semibold">{formatPrice(draft.price || 0)}</p>
          </Card>

          {!isNew && (
            <Card title="More">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={duplicate}>
                  Duplicate
                </Button>
                <Button size="sm" variant="danger" onClick={remove}>
                  Delete product
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}

function SizeAdder({ onAdd }: { onAdd: (s: string) => void }) {
  const [v, setV] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onAdd(v)
        setV('')
      }}
      className="flex items-center gap-1"
    >
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="Add size" className="w-24 rounded-full border border-dashed border-ink/20 px-3 py-1.5 text-xs outline-none focus:border-ink/50" />
      <Button size="sm" type="submit" variant="ghost" disabled={!v.trim()}>
        Add
      </Button>
    </form>
  )
}
