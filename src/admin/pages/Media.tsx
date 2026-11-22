import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../../context/ContentContext'
import { defaultImages, imageUrl, type ImageKey, type ImageSource } from '../../data/images'
import { compressImage } from '../../lib/storage'
import { DropZone, parseLink, Thumb, useUploader } from '../ImagePicker'
import { Badge, Button, Modal, PageHeader, TextInput, Toggle, useToast } from '../ui'

type Filter = 'all' | 'site' | 'products' | 'collections' | 'unused' | 'uploaded'

export function Media() {
  const { images, imageUsage } = useContent()
  const { upload, busy } = useUploader()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editing, setEditing] = useState<ImageKey | null>(null)

  const keys = useMemo(() => {
    return Object.keys(images)
      .filter((k) => !q || `${k} ${images[k].label}`.toLowerCase().includes(q.toLowerCase()))
      .filter((k) => {
        const use = imageUsage(k)
        if (filter === 'site') return use.some((u) => u.kind === 'site')
        if (filter === 'products') return use.some((u) => u.kind === 'product')
        if (filter === 'collections') return use.some((u) => u.kind === 'collection')
        if (filter === 'unused') return use.length === 0
        if (filter === 'uploaded') return images[k].value.startsWith('data:')
        return true
      })
      .reverse()
  }, [images, q, filter, imageUsage])

  return (
    <>
      <PageHeader eyebrow="Assets" title="Media library">
        Every photograph on the site lives here. Replace one and it changes everywhere it’s used — hero, lookbook, product pages, collection stories. Upload new photos to use them in products and collections.
      </PageHeader>

      <DropZone compact busy={busy} onFiles={(f) => upload(f)} />

      <div className="mt-6 mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name…" className="w-full rounded-full border border-ink/12 bg-paper px-4 py-2.5 text-sm outline-none focus:border-ink/40 md:max-w-xs" />
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'site', 'products', 'collections', 'uploaded', 'unused'] as Filter[]).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-ink text-paper' : 'bg-paper hover:bg-ink/5'}`}>
              {f === 'site' ? 'Site sections' : f}
            </button>
          ))}
        </div>
        <span className="text-xs text-charcoal/50 md:ml-auto">{keys.length} images</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {keys.map((k) => {
          const src = images[k]
          const uses = imageUsage(k)
          const changed = defaultImages[k] && JSON.stringify(defaultImages[k]) !== JSON.stringify(src)
          return (
            <button key={k} type="button" onClick={() => setEditing(k)} className="group overflow-hidden rounded-2xl border border-ink/10 bg-paper text-left transition-shadow hover:shadow-[0_16px_32px_-20px_rgba(0,0,0,0.4)]">
              <div className="relative">
                <Thumb image={k} className="aspect-[4/5] transition-transform duration-700 group-hover:scale-[1.04]" />
                <span className="absolute inset-0 grid place-items-center bg-ink/45 text-xs font-semibold text-paper opacity-0 transition-opacity group-hover:opacity-100">Edit / replace</span>
                <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                  {src.value.startsWith('data:') && <Badge tone="accent">Uploaded</Badge>}
                  {changed && !src.value.startsWith('data:') && <Badge tone="warn">Replaced</Badge>}
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold">{src.label}</p>
                <p className="mt-0.5 truncate text-[0.68rem] text-charcoal/50">{uses.length ? uses.map((u) => u.label).join(' · ') : 'Not used yet'}</p>
              </div>
            </button>
          )
        })}
      </div>

      <ImageEditor imageKey={editing} onClose={() => setEditing(null)} />
    </>
  )
}

function ImageEditor({ imageKey, onClose }: { imageKey: ImageKey | null; onClose: () => void }) {
  const { images, setImage, deleteImage, imageUsage } = useContent()
  const toast = useToast()
  const file = useRef<HTMLInputElement>(null)
  const src = imageKey ? images[imageKey] : undefined
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)

  if (!imageKey || !src) return <Modal open={false} onClose={onClose} title="">{null}</Modal>

  const uses = imageUsage(imageKey)
  const original = defaultImages[imageKey]
  const changed = original && JSON.stringify(original) !== JSON.stringify(src)
  const update = async (patch: Partial<ImageSource>, message = 'Saved') => {
    await setImage(imageKey, { ...src, ...patch })
    toast(message)
  }

  const replaceWithFile = async (f?: File) => {
    if (!f) return
    setBusy(true)
    try {
      const value = await compressImage(f)
      await update({ kind: 'url', value }, 'Image replaced everywhere it’s used')
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const replaceWithLink = async () => {
    const parsed = parseLink(link)
    if (!parsed) return toast('That doesn’t look like an image link', 'error')
    await update(parsed, 'Image replaced everywhere it’s used')
    setLink('')
  }

  const remove = async () => {
    if (uses.length) return toast('Remove it from the places below first', 'error')
    if (!confirm('Delete this image from the library?')) return
    await deleteImage(imageKey)
    toast('Image deleted')
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={src.label} wide>
      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-2xl bg-concrete">
            <img src={imageUrl(src, 1200)} alt={src.label} className={`max-h-[60vh] w-full object-contain ${src.color ? '' : 'grayscale'}`} />
          </div>
          <p className="mt-2 text-[0.68rem] text-charcoal/50">
            Key <code className="font-mono">{imageKey}</code> · {src.kind === 'unsplash' ? 'Unsplash' : src.value.startsWith('data:') ? `Uploaded (${Math.round((src.value.length * 0.75) / 1024)} KB)` : 'External link'}
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <TextInput label="Label" value={src.label} onChange={(v) => setImage(imageKey, { ...src, label: v })} hint="Shown in the library and used as alt text fallback" />
          <Toggle checked={!!src.color} onChange={(v) => update({ color: v }, v ? 'Showing in colour' : 'Back to monochrome')} label="Keep original colour (skip the black & white campaign grade)" />

          <div className="rounded-2xl border border-ink/10 p-4">
            <p className="text-xs font-semibold">Replace image</p>
            <p className="mt-1 text-xs text-charcoal/55">Updates every place this image appears.</p>
            <input ref={file} type="file" accept="image/*" hidden onChange={(e) => replaceWithFile(e.target.files?.[0])} />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={() => file.current?.click()} disabled={busy}>
                {busy ? 'Uploading…' : 'Upload new file'}
              </Button>
              {changed && (
                <Button size="sm" onClick={() => update(original, 'Restored original')}>
                  Restore original
                </Button>
              )}
            </div>
            <div className="mt-4 flex items-end gap-2">
              <div className="flex-1">
                <TextInput label="…or paste a link" placeholder="https://… or Unsplash id" value={link} onChange={setLink} />
              </div>
              <Button size="sm" onClick={replaceWithLink} disabled={!link.trim()}>
                Use link
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold">Used in</p>
            {uses.length === 0 ? (
              <p className="mt-1 text-xs text-charcoal/50">Nowhere yet — add it to a product or collection gallery.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1">
                {uses.map((u, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <Badge>{u.kind}</Badge>
                    {u.kind === 'site' ? (
                      <span>{u.label}</span>
                    ) : (
                      <Link to={u.to} onClick={onClose} className="underline-offset-4 hover:underline">
                        {u.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!original && (
            <div>
              <Button size="sm" variant="danger" onClick={remove}>
                Delete image
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
