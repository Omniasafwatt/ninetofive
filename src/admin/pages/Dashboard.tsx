import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { isValidContent, useContent } from '../../context/ContentContext'
import { formatPrice } from '../../data/products'
import { kvSet } from '../../lib/storage'
import { Thumb } from '../ImagePicker'
import { Button, Card, PageHeader, TextInput, useToast } from '../ui'

export function Dashboard() {
  const content = useContent()
  const { products, collections, images, updatedAt, replaceAll, resetAll } = content
  const toast = useToast()
  const file = useRef<HTMLInputElement>(null)
  const [pass, setPass] = useState('')

  const uploaded = Object.values(images).filter((i) => i.value.startsWith('data:')).length

  const exportJson = () => {
    const { products: p, collections: c, images: i, version, updatedAt: u } = content
    const blob = new Blob([JSON.stringify({ version, products: p, collections: c, images: i, updatedAt: u }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ninetofive-content-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    toast('Backup downloaded')
  }

  const importJson = async (f?: File) => {
    if (!f) return
    try {
      const data = JSON.parse(await f.text())
      if (!isValidContent(data)) throw new Error('This file isn’t a Nine to Five content backup.')
      if (!confirm('Replace all products, collections and images with this backup?')) return
      await replaceAll(data)
      toast('Backup restored')
    } catch (e) {
      toast((e as Error).message, 'error')
    } finally {
      if (file.current) file.current.value = ''
    }
  }

  const reset = async () => {
    if (!confirm('Reset every product, collection and image to the original launch content? Your edits and uploads will be lost.')) return
    await resetAll()
    toast('Content reset to original')
  }

  const savePass = async () => {
    if (pass.length < 4) return toast('Use at least 4 characters', 'error')
    await kvSet('admin-passcode', pass)
    setPass('')
    toast('Passcode updated')
  }

  const stats = [
    { label: 'Products', value: products.length, to: '/admin/products' },
    { label: 'Collections', value: collections.length, to: '/admin/collections' },
    { label: 'Images', value: Object.keys(images).length, to: '/admin/media', note: uploaded ? `${uploaded} uploaded` : undefined },
  ]

  return (
    <>
      <PageHeader eyebrow="Studio" title={<>Good {greeting()}.</>}>
        {updatedAt ? `Content last saved ${new Date(updatedAt).toLocaleString()}.` : 'You’re looking at the original launch content — nothing has been edited yet.'}
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="rounded-2xl border border-ink/10 bg-paper p-5 transition-shadow hover:shadow-[0_16px_32px_-24px_rgba(0,0,0,0.4)]">
            <p className="text-xs text-charcoal/55">{s.label}</p>
            <p className="display mt-2 text-5xl leading-none">{s.value}</p>
            {s.note && <p className="mt-2 text-xs text-charcoal/55">{s.note}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Quick edit" description="Jump straight into a product.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((p) => (
              <Link key={p.slug} to={`/admin/products/${p.slug}`} className="group">
                <Thumb image={p.images[0]} className="aspect-[4/5] rounded-xl transition-transform duration-500 group-hover:scale-[1.02]" />
                <p className="mt-1.5 truncate text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-charcoal/50">{formatPrice(p.price)}</p>
              </Link>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card title="Backup & restore" description="Content is saved in this browser. Download a backup to move it to another computer or keep it safe.">
            <input ref={file} type="file" accept="application/json" hidden onChange={(e) => importJson(e.target.files?.[0])} />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="primary" onClick={exportJson}>
                Download backup
              </Button>
              <Button size="sm" onClick={() => file.current?.click()}>
                Restore from file
              </Button>
              <Button size="sm" variant="danger" onClick={reset}>
                Reset to original
              </Button>
            </div>
          </Card>

          <Card title="Settings" description="Admin passcode. This lock only stops casual visitors — it isn’t server-side security.">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <TextInput label="New passcode" type="password" autoComplete="new-password" value={pass} onChange={setPass} />
              </div>
              <Button size="sm" onClick={savePass} disabled={!pass}>
                Update
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
}
