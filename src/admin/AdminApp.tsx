import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import { EASE } from '../lib/ease'
import { kvGet } from '../lib/storage'
import { CollectionEditor, CollectionsList } from './pages/Collections'
import { Dashboard } from './pages/Dashboard'
import { Media } from './pages/Media'
import { Logo } from '../components/Logo'
import { ProductEditor, ProductsList } from './pages/Products'
import { ToastProvider } from './ui'

export const DEFAULT_PASSCODE = '9to5'
const SESSION_KEY = '9to5-admin-session'

const NAV = [
  { to: '/admin', label: 'Overview', icon: '◎', end: true },
  { to: '/admin/products', label: 'Products', icon: '▣' },
  { to: '/admin/collections', label: 'Collections', icon: '◐' },
  { to: '/admin/media', label: 'Media library', icon: '▤' },
]

export default function AdminApp() {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    document.title = 'Admin — Nine to Five'
    return () => {
      document.title = 'Nine to Five — Good style works overtime'
    }
  }, [])

  return (
    <ToastProvider>
      <div className="min-h-screen bg-fog text-ink">{unlocked ? <Shell onLock={() => lock(setUnlocked)} /> : <Gate onUnlock={() => setUnlocked(true)} />}</div>
    </ToastProvider>
  )
}

function lock(set: (v: boolean) => void) {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
  set(false)
}

/**
 * Passcode screen. This is a convenience lock for a client-side demo — anyone with
 * access to the browser's storage can bypass it. Real protection needs a server.
 */
function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const expected = (await kvGet<string>('admin-passcode')) ?? DEFAULT_PASSCODE
    if (code === expected) {
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        /* session just won't persist */
      }
      onUnlock()
    } else {
      setError(true)
    }
  }
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4 text-paper">
      <motion.form
        onSubmit={submit}
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <Logo className="h-14 w-auto text-paper" />
        <p className="eyebrow mt-2 text-paper/50">Studio admin</p>
        <div className="mt-6 h-[2px] w-16 bg-accent" />
        <label className="mt-10 block text-xs font-semibold text-paper/70" htmlFor="passcode">
          Passcode
        </label>
        <motion.input
          id="passcode"
          type="password"
          autoFocus
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(false)
          }}
          animate={error ? { x: [0, -8, 8, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={`mt-2 w-full rounded-xl border bg-paper/5 px-4 py-3 text-sm outline-none transition-colors focus:border-paper/50 ${error ? 'border-accent' : 'border-paper/15'}`}
        />
        {error && <p className="mt-2 text-xs text-accent">That passcode isn’t right.</p>}
        <button type="submit" className="mt-6 h-12 w-full rounded-full bg-paper text-xs font-semibold tracking-[0.2em] text-ink uppercase transition-colors hover:bg-accent hover:text-accent-ink">
          Enter
        </button>
        <p className="mt-6 text-[0.7rem] leading-relaxed text-paper/40">
          The default passcode for a new install is set in <code className="text-paper/60">src/admin/AdminApp.tsx</code>. Change it from Overview → Settings after signing in.
        </p>
        <Link to="/" className="mt-8 inline-block text-xs text-paper/50 underline-offset-4 hover:underline">
          ← Back to the site
        </Link>
      </motion.form>
    </div>
  )
}

function Shell({ onLock }: { onLock: () => void }) {
  const location = useLocation()
  const { pathname } = location
  const { loaded, updatedAt, collections } = useContent()
  const [menu, setMenu] = useState(false)
  useEffect(() => setMenu(false), [pathname])

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4" aria-label="Admin">
      <Link to="/admin" className="mb-6 flex items-center gap-2 px-3 pt-2">
        <Logo className="h-7 w-auto text-paper" />
        <span className="eyebrow mt-1 text-[0.55rem] text-paper/50">Admin</span>
      </Link>
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-paper text-ink' : 'text-paper/70 hover:bg-paper/10 hover:text-paper'}`
          }
        >
          <span className="w-4 text-center opacity-70">{n.icon}</span>
          {n.label}
        </NavLink>
      ))}
      <div className="mt-6 px-3">
        <p className="eyebrow mb-2 text-[0.55rem] text-paper/40">Moments</p>
        <div className="flex flex-col gap-1">
          {collections.map((c) => (
            <Link key={c.slug} to={`/admin/collections/${c.slug}`} className="flex items-center gap-2 rounded-lg py-1 text-xs text-paper/60 hover:text-paper">
              <span className="size-2 rounded-full" style={{ background: c.accent }} />
              {c.number} {c.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-auto flex flex-col gap-1 border-t border-paper/10 pt-4">
        <a href="/" target="_blank" rel="noreferrer" className="rounded-xl px-3 py-2 text-xs text-paper/70 hover:bg-paper/10 hover:text-paper">
          View site ↗
        </a>
        <button type="button" onClick={onLock} className="rounded-xl px-3 py-2 text-left text-xs text-paper/70 hover:bg-paper/10 hover:text-paper">
          Lock admin
        </button>
        <p className="px-3 pt-2 text-[0.62rem] text-paper/35">{updatedAt ? `Last saved ${new Date(updatedAt).toLocaleString()}` : 'Showing original content'}</p>
      </div>
    </nav>
  )

  return (
    <div className="lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen bg-ink text-paper lg:block">{sidebar}</aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-[300] flex items-center justify-between bg-ink px-4 py-3 text-paper lg:hidden">
        <span className="flex items-center gap-2">
          <Logo className="h-6 w-auto text-paper" /> <span className="eyebrow text-[0.55rem] text-paper/50">Admin</span>
        </span>
        <button type="button" onClick={() => setMenu(true)} className="text-xs font-semibold" aria-expanded={menu}>
          Menu
        </button>
      </div>
      <AnimatePresence>
        {menu && (
          <>
            <motion.div className="fixed inset-0 z-[310] bg-ink/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenu(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-[320] w-72 bg-ink text-paper lg:hidden" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.5, ease: EASE }}>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        {!loaded ? (
          <p className="text-sm text-charcoal/60">Loading content…</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="mx-auto max-w-6xl">
              <Routes location={location}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductsList />} />
                <Route path="products/new" element={<ProductEditor />} />
                <Route path="products/:slug" element={<ProductEditor />} />
                <Route path="collections" element={<CollectionsList />} />
                <Route path="collections/new" element={<CollectionEditor />} />
                <Route path="collections/:slug" element={<CollectionEditor />} />
                <Route path="media" element={<Media />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  )
}
