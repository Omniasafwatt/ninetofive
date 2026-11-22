import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import type { Collection } from '../../data/collections'
import { slugify } from '../../lib/storage'
import { ImageField, ImageListField, Thumb } from '../ImagePicker'
import { Badge, Button, Card, ColorInput, PageHeader, Select, StringList, TextInput, useToast } from '../ui'
import { useDraft } from '../useDraft'

/** Text on the accent should be black on light accents (mustard), white on dark ones. */
export function inkFor(hex: string) {
  const m = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return '#ffffff'
  const [r, g, b] = m.slice(1).map((x) => parseInt(x, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.3 ? '#0a0a0a' : '#ffffff'
}

export function CollectionsList() {
  const { collections, productsIn } = useContent()
  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Collections"
        actions={
          <Link to="/admin/collections/new">
            <Button variant="primary">+ New collection</Button>
          </Link>
        }
      >
        Each collection owns one accent colour, its story, its campaign photos and the products assigned to it.
      </PageHeader>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {collections.map((c) => (
          <Link key={c.slug} to={`/admin/collections/${c.slug}`} className="group overflow-hidden rounded-2xl border border-ink/10 bg-paper transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.35)]">
            <div className="relative">
              <Thumb image={c.cover} className="aspect-[16/10] transition-transform duration-700 group-hover:scale-[1.03]" />
              <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: c.accent }} />
            </div>
            <div className="p-4">
              <p className="flex items-center justify-between text-xs text-charcoal/55">
                <span>Collection {c.number}</span>
                <span>{c.hours}</span>
              </p>
              <p className="display mt-1 text-3xl">{c.name}</p>
              <p className="mt-2 flex items-center gap-2 text-xs">
                <span className="size-3 rounded-full ring-1 ring-ink/10" style={{ background: c.accent }} />
                {c.accentName}
                <span className="ml-auto text-charcoal/50">{productsIn(c.slug).length} products</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

export function CollectionEditor() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { collections, getCollection, saveCollection, deleteCollection, productsIn, images } = useContent()
  const existing = getCollection(slug)
  const isNew = !slug

  const initial = useMemo<Collection>(() => {
    if (existing) return structuredClone(existing)
    const cover = Object.keys(images)[0] ?? ''
    return {
      slug: '',
      number: String(collections.length + 1).padStart(2, '0'),
      name: '',
      accent: '#7a3cff',
      accentInk: '#ffffff',
      accentName: '',
      hours: '00:00 — 00:00',
      mood: '',
      line: '',
      story: ['', '', ''],
      cover,
      gallery: [],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, existing?.slug])

  const { draft, set, dirty, reset } = useDraft(initial)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [autoInk, setAutoInk] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!slugTouched) set({ slug: slugify(draft.name) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.name, slugTouched])

  useEffect(() => {
    if (autoInk && /^#[0-9a-f]{6}$/i.test(draft.accent)) set({ accentInk: inkFor(draft.accent) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.accent, autoInk])

  if (slug && !existing) {
    return (
      <PageHeader eyebrow="Collections" title="Collection not found">
        <Link to="/admin/collections" className="underline">
          Back to collections
        </Link>
      </PageHeader>
    )
  }

  const save = async () => {
    const e: Record<string, string> = {}
    if (!draft.name.trim()) e.name = 'Required'
    if (!draft.slug) e.slug = 'Required'
    else if (collections.some((c) => c.slug === draft.slug && c.slug !== existing?.slug)) e.slug = 'Already used'
    if (!/^#[0-9a-f]{6}$/i.test(draft.accent)) e.accent = 'Use #RRGGBB'
    if (!draft.cover) e.cover = 'Choose a cover'
    setErrors(e)
    if (Object.keys(e).length) {
      toast('Fix the highlighted fields first', 'error')
      return
    }
    try {
      const clean = { ...draft, name: draft.name.trim(), story: draft.story.map((s) => s.trim()).filter(Boolean) }
      await saveCollection(clean, existing?.slug)
      reset(clean)
      toast(isNew ? 'Collection created' : 'Changes saved')
      if (isNew || existing?.slug !== clean.slug) navigate(`/admin/collections/${clean.slug}`, { replace: true })
    } catch (err) {
      toast((err as Error).message, 'error')
    }
  }

  const remove = async () => {
    if (!existing || !confirm(`Delete the collection “${existing.name}”?`)) return
    try {
      await deleteCollection(existing.slug)
      toast('Collection deleted')
      navigate('/admin/collections')
    } catch (err) {
      toast((err as Error).message, 'error')
    }
  }

  const pieces = existing ? productsIn(existing.slug) : []

  return (
    <>
      <PageHeader
        eyebrow={isNew ? 'New collection' : `Collection ${draft.number}`}
        title={draft.name || 'Untitled collection'}
        actions={
          <>
            {dirty && <Badge tone="warn">Unsaved changes</Badge>}
            {!isNew && (
              <a href={`/collections/${existing?.slug}`} target="_blank" rel="noreferrer">
                <Button variant="ghost">View on site ↗</Button>
              </a>
            )}
            <Button variant="ghost" disabled={!dirty} onClick={() => reset()}>
              Discard
            </Button>
            <Button variant="accent" onClick={save} disabled={!dirty && !isNew}>
              {isNew ? 'Create collection' : 'Save changes'}
            </Button>
          </>
        }
      >
        <Link to="/admin/collections" className="underline-offset-4 hover:underline">
          ← All collections
        </Link>
      </PageHeader>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <Card title="Identity">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Name" value={draft.name} onChange={(v) => set({ name: v })} error={errors.name} placeholder="e.g. Red Shift" hint="Second word is set in italics" />
              <TextInput
                label="URL slug"
                hint={`/collections/${draft.slug || '…'}`}
                value={draft.slug}
                onChange={(v) => {
                  setSlugTouched(true)
                  set({ slug: slugify(v) })
                }}
                error={errors.slug}
              />
              <TextInput label="Number" value={draft.number} onChange={(v) => set({ number: v })} />
              <TextInput label="Hours" value={draft.hours} onChange={(v) => set({ hours: v })} placeholder="06:00 — 09:00" />
              <TextInput label="Mood" value={draft.mood} onChange={(v) => set({ mood: v })} placeholder="Awake. Urgent. Precise." />
              <TextInput label="One-line description" value={draft.line} onChange={(v) => set({ line: v })} />
            </div>
          </Card>

          <Card title="Accent colour" description="The single colour this collection brings to buttons, stitches, labels and the story transition.">
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorInput label="Accent" value={draft.accent} onChange={(v) => set({ accent: v })} />
              <TextInput label="Colour name" value={draft.accentName} onChange={(v) => set({ accentName: v })} placeholder="Signal Red" />
              <div className="sm:col-span-2">
                <Select
                  label="Text on accent"
                  hint={autoInk ? 'Chosen automatically for contrast' : undefined}
                  value={autoInk ? 'auto' : draft.accentInk}
                  onChange={(v) => {
                    if (v === 'auto') setAutoInk(true)
                    else {
                      setAutoInk(false)
                      set({ accentInk: v })
                    }
                  }}
                  options={[
                    { value: 'auto', label: 'Automatic' },
                    { value: '#ffffff', label: 'White' },
                    { value: '#0a0a0a', label: 'Black' },
                  ]}
                />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-ink p-4">
              <span className="rounded-full px-5 py-2.5 text-[0.65rem] font-semibold tracking-[0.2em] uppercase" style={{ background: draft.accent, color: draft.accentInk }}>
                Enter the collection
              </span>
              <span className="h-px w-16" style={{ background: draft.accent }} />
              <span className="text-xs text-paper/70">
                <span style={{ color: draft.accent }}>●</span> {draft.number} {draft.name || 'Name'}
              </span>
            </div>
          </Card>

          <Card title="Story" description="Shown across the pinned story chapters: image + first paragraph, quote on the accent, closing line on white.">
            <StringList label="Paragraphs" items={draft.story} onChange={(v) => set({ story: v })} multiline addLabel="Add paragraph" min={1} />
          </Card>

          <Card title="Photography">
            <div className="flex flex-col gap-8">
              <ImageField label="Cover" hint={errors.cover ?? 'Hero, cards and the story portrait'} value={draft.cover} onChange={(k) => set({ cover: k })} />
              <ImageListField label="Story gallery" hint="Four photos fill the story chapters" value={draft.gallery} onChange={(v) => set({ gallery: v })} />
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card title="Preview">
            <div className="relative overflow-hidden rounded-xl">
              <Thumb image={draft.cover} className="aspect-[3/4]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-paper">
                <p className="flex items-center gap-2 text-[0.6rem] font-semibold tracking-[0.2em] uppercase">
                  <span className="size-2 rounded-full" style={{ background: draft.accent }} /> {draft.accentName || 'Accent'}
                </p>
                <p className="display mt-2 text-4xl leading-none">{draft.name || 'Name'}</p>
                <p className="mt-2 text-xs text-paper/70">{draft.line}</p>
              </div>
              <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: draft.accent }} />
            </div>
          </Card>

          {!isNew && (
            <Card title={`Products (${pieces.length})`} description="Assign products from each product’s page.">
              <div className="flex flex-col gap-2">
                {pieces.map((p) => (
                  <Link key={p.slug} to={`/admin/products/${p.slug}`} className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-fog">
                    <Thumb image={p.images[0]} className="aspect-square w-9 rounded-md" />
                    <span className="text-sm">{p.name}</span>
                  </Link>
                ))}
                {pieces.length === 0 && <p className="text-xs text-charcoal/50">No products yet.</p>}
              </div>
            </Card>
          )}

          {!isNew && (
            <Card title="Danger zone">
              <Button size="sm" variant="danger" onClick={remove}>
                Delete collection
              </Button>
              <p className="mt-2 text-xs text-charcoal/50">Only possible once it has no products.</p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
