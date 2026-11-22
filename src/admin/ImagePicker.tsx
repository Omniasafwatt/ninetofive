import { useMemo, useRef, useState, type DragEvent } from 'react'
import { useContent } from '../context/ContentContext'
import { imageUrl, type ImageKey, type ImageSource } from '../data/images'
import { compressImage } from '../lib/storage'
import { Button, Modal, RowActions, TextInput, useToast } from './ui'

/** Raw thumbnail for the admin — no campaign animation, honours the "keep colour" flag. */
export function Thumb({ image, className = '' }: { image: ImageKey; className?: string }) {
  const src = useContent().image(image)
  return (
    <div className={`overflow-hidden bg-concrete ${className}`}>
      {src ? (
        <img src={imageUrl(src, 400)} alt={src.label} loading="lazy" className={`h-full w-full object-cover ${src.color ? '' : 'grayscale'}`} />
      ) : (
        <div className="grid h-full w-full place-items-center text-[0.6rem] text-charcoal/50">Missing</div>
      )}
    </div>
  )
}

/** Turns dropped/selected files into new library images. Returns the new keys. */
export function useUploader() {
  const { addImage } = useContent()
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (!list.length) {
      toast('Choose an image file (JPG, PNG, WebP…)', 'error')
      return []
    }
    setBusy(true)
    const keys: ImageKey[] = []
    try {
      for (const f of list) {
        const dataUrl = await compressImage(f)
        keys.push(await addImage({ label: f.name.replace(/\.[^.]+$/, ''), kind: 'url', value: dataUrl }))
      }
      toast(list.length === 1 ? 'Image uploaded' : `${list.length} images uploaded`)
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      setBusy(false)
    }
    return keys
  }
  return { upload, busy }
}

export function DropZone({ onFiles, busy, compact }: { onFiles: (f: FileList) => void; busy?: boolean; compact?: boolean }) {
  const input = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files)
  }
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
      onClick={() => input.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition-colors duration-300 ${
        over ? 'border-accent bg-accent/5' : 'border-ink/15 hover:border-ink/35'
      } ${compact ? 'px-4 py-6' : 'px-6 py-12'}`}
    >
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && onFiles(e.target.files)} />
      <span className="grid size-10 place-items-center rounded-full bg-ink text-paper">{busy ? '…' : '↑'}</span>
      <p className="text-sm font-semibold">{busy ? 'Uploading…' : 'Drop images here or click to browse'}</p>
      <p className="text-xs text-charcoal/50">JPG, PNG or WebP. Large photos are resized to 2000px automatically.</p>
    </div>
  )
}

/** Paste a direct image URL or an Unsplash photo id / link. */
export function parseLink(raw: string): Pick<ImageSource, 'kind' | 'value'> | null {
  const v = raw.trim()
  if (!v) return null
  const u = v.match(/images\.unsplash\.com\/photo-([\w-]+)/)
  if (u) return { kind: 'unsplash', value: u[1] }
  if (/^\d{10,}-[a-f0-9]{8,}$/i.test(v)) return { kind: 'unsplash', value: v }
  if (/^(https?:)?\/\//.test(v) || v.startsWith('data:image/') || v.startsWith('/')) return { kind: 'url', value: v }
  return null
}

function LinkForm({ onAdd }: { onAdd: (src: ImageSource) => void }) {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const parsed = parseLink(url)
  return (
    <div className="grid gap-4">
      <TextInput label="Image URL or Unsplash photo id" placeholder="https://… or 1488161628813-04466f872be2" value={url} onChange={setUrl} error={url && !parsed ? 'Not a recognised image link' : undefined} />
      <TextInput label="Label" placeholder="e.g. Hoodie — back view" value={label} onChange={setLabel} />
      {parsed && (
        <div className="aspect-[16/9] overflow-hidden rounded-xl bg-concrete">
          <img src={imageUrl({ label, ...parsed }, 800)} alt="Preview" className="h-full w-full object-cover" />
        </div>
      )}
      <div>
        <Button variant="primary" disabled={!parsed} onClick={() => parsed && onAdd({ label: label || 'Linked image', ...parsed })}>
          Add image
        </Button>
      </div>
    </div>
  )
}

/**
 * Library modal: pick any existing image, upload new ones, or add by link.
 * `onPick` receives one key (single mode) or several (multi mode).
 */
export function LibraryModal({ open, onClose, onPick, multi, title = 'Choose image' }: { open: boolean; onClose: () => void; onPick: (keys: ImageKey[]) => void; multi?: boolean; title?: string }) {
  const { images, addImage } = useContent()
  const { upload, busy } = useUploader()
  const [tab, setTab] = useState<'library' | 'upload' | 'link'>('library')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<ImageKey[]>([])

  const keys = useMemo(
    () =>
      Object.entries(images)
        .filter(([k, s]) => !q || `${k} ${s.label}`.toLowerCase().includes(q.toLowerCase()))
        .map(([k]) => k)
        .reverse(),
    [images, q],
  )

  const finish = (picked: ImageKey[]) => {
    if (!picked.length) return
    onPick(picked)
    setSelected([])
    setTab('library')
    onClose()
  }

  const toggle = (k: ImageKey) => {
    if (!multi) return finish([k])
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]))
  }

  return (
    <Modal open={open} onClose={onClose} title={title} wide>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(['library', 'upload', 'link'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-xs font-semibold capitalize transition-colors ${tab === t ? 'bg-ink text-paper' : 'hover:bg-ink/5'}`}
          >
            {t === 'link' ? 'From link' : t}
          </button>
        ))}
        {tab === 'library' && (
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search images…" className="ml-auto w-full rounded-full border border-ink/12 px-4 py-2 text-sm outline-none focus:border-ink/40 sm:w-60" />
        )}
      </div>

      {tab === 'library' && (
        <>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {keys.map((k) => {
              const on = selected.includes(k)
              return (
                <button key={k} type="button" onClick={() => toggle(k)} className="group text-left" title={images[k].label}>
                  <div className={`relative overflow-hidden rounded-xl ring-2 transition-all ${on ? 'ring-accent' : 'ring-transparent group-hover:ring-ink/30'}`}>
                    <Thumb image={k} className="aspect-[3/4] transition-transform duration-500 group-hover:scale-[1.03]" />
                    {on && <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-accent text-xs text-accent-ink">{selected.indexOf(k) + 1}</span>}
                  </div>
                  <p className="mt-1.5 truncate text-[0.68rem] text-charcoal/70">{images[k].label}</p>
                </button>
              )
            })}
          </div>
          {multi && (
            <div className="sticky -bottom-6 -mx-6 mt-6 flex items-center justify-between border-t border-ink/10 bg-paper px-6 py-4">
              <span className="text-xs text-charcoal/60">{selected.length} selected</span>
              <Button variant="primary" disabled={!selected.length} onClick={() => finish(selected)}>
                Add {selected.length || ''} image{selected.length === 1 ? '' : 's'}
              </Button>
            </div>
          )}
        </>
      )}

      {tab === 'upload' && <DropZone busy={busy} onFiles={async (f) => finish(await upload(multi ? f : [f[0]]))} />}

      {tab === 'link' && <LinkForm onAdd={async (src) => finish([await addImage(src)])} />}
    </Modal>
  )
}

/** A single image slot (collection cover…). */
export function ImageField({ label, value, onChange, hint }: { label: string; value: ImageKey; onChange: (k: ImageKey) => void; hint?: string }) {
  const [open, setOpen] = useState(false)
  const { image } = useContent()
  return (
    <div className="flex flex-col gap-1.5">
      <p className="flex justify-between text-xs font-semibold text-charcoal/80">
        {label}
        {hint && <span className="font-normal text-charcoal/45">{hint}</span>}
      </p>
      <div className="flex items-center gap-4 rounded-2xl border border-ink/10 p-3">
        <Thumb image={value} className="aspect-[3/4] w-24 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{image(value)?.label ?? 'No image'}</p>
          <p className="truncate font-mono text-[0.65rem] text-charcoal/45">{value}</p>
          <div className="mt-3">
            <Button size="sm" onClick={() => setOpen(true)}>
              Replace
            </Button>
          </div>
        </div>
      </div>
      <LibraryModal open={open} onClose={() => setOpen(false)} onPick={([k]) => onChange(k)} title={`Choose ${label.toLowerCase()}`} />
    </div>
  )
}

/** Ordered image list (product gallery, details, collection gallery). */
export function ImageListField({ label, value, onChange, hint, min = 0, captions }: { label: string; value: ImageKey[]; onChange: (v: ImageKey[]) => void; hint?: string; min?: number; captions?: string[] }) {
  const [adding, setAdding] = useState(false)
  const [replacing, setReplacing] = useState<number | null>(null)
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="flex justify-between text-xs font-semibold text-charcoal/80">
        {label}
        <span className="font-normal text-charcoal/45">{hint ?? `${value.length} image${value.length === 1 ? '' : 's'}`}</span>
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((k, i) => (
          <div key={`${k}-${i}`} className="group relative">
            <button type="button" onClick={() => setReplacing(i)} className="block w-full" title="Replace">
              <Thumb image={k} className="aspect-[3/4] rounded-xl" />
              <span className="absolute inset-0 grid place-items-center rounded-xl bg-ink/50 text-xs font-semibold text-paper opacity-0 transition-opacity group-hover:opacity-100">Replace</span>
            </button>
            {captions?.[i] && <span className="absolute top-2 left-2 rounded-full bg-paper/90 px-2 py-0.5 text-[0.6rem] font-semibold">{captions[i]}</span>}
            <div className="mt-1 flex justify-center">
              <RowActions onUp={i > 0 ? () => move(i, -1) : undefined} onDown={i < value.length - 1 ? () => move(i, 1) : undefined} onRemove={value.length > min ? () => onChange(value.filter((_, j) => j !== i)) : undefined} />
            </div>
          </div>
        ))}
        <button type="button" onClick={() => setAdding(true)} className="grid aspect-[3/4] place-items-center rounded-xl border-2 border-dashed border-ink/15 text-sm font-semibold text-charcoal/60 transition-colors hover:border-ink/40 hover:text-ink">
          + Add
        </button>
      </div>
      <LibraryModal open={adding} onClose={() => setAdding(false)} onPick={(keys) => onChange([...value, ...keys])} multi title={`Add to ${label.toLowerCase()}`} />
      <LibraryModal
        open={replacing !== null}
        onClose={() => setReplacing(null)}
        onPick={([k]) => replacing !== null && onChange(value.map((x, j) => (j === replacing ? k : x)))}
        title="Replace image"
      />
    </div>
  )
}
