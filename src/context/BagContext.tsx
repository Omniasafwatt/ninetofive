import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type BagItem = { slug: string; color: string; size: string; qty: number }

type BagContextValue = {
  items: BagItem[]
  count: number
  open: boolean
  setOpen: (open: boolean) => void
  add: (item: Omit<BagItem, 'qty'>) => void
  remove: (index: number) => void
  setQty: (index: number, qty: number) => void
  clear: () => void
}

const BagContext = createContext<BagContextValue | null>(null)
const KEY = '9to5-bag'

function readBag(): BagItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed = raw ? (JSON.parse(raw) as BagItem[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function BagProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BagItem[]>(readBag)
  const [open, setOpen] = useState(false)

  // The bag survives reloads so checkout can be reached directly; losing it (private mode) is harmless.
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable */
    }
  }, [items])

  const add = useCallback((item: Omit<BagItem, 'qty'>) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.slug === item.slug && p.color === item.color && p.size === item.size)
      if (i === -1) return [...prev, { ...item, qty: 1 }]
      return prev.map((p, j) => (j === i ? { ...p, qty: p.qty + 1 } : p))
    })
  }, [])

  const remove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const setQty = useCallback((index: number, qty: number) => {
    setItems((prev) => (qty <= 0 ? prev.filter((_, i) => i !== index) : prev.map((p, i) => (i === index ? { ...p, qty: Math.min(qty, 10) } : p))))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(
    () => ({ items, count: items.reduce((n, i) => n + i.qty, 0), open, setOpen, add, remove, setQty, clear }),
    [items, open, add, remove, setQty, clear],
  )
  return <BagContext.Provider value={value}>{children}</BagContext.Provider>
}

export function useBag() {
  const ctx = useContext(BagContext)
  if (!ctx) throw new Error('useBag must be used inside BagProvider')
  return ctx
}
