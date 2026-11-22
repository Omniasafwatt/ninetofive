import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultCollection, type Collection } from '../data/collections'

type Accent = Pick<Collection, 'accent' | 'accentInk' | 'name' | 'number'>

type AccentContextValue = {
  accent: Accent
  setAccent: (next: Accent) => void
}

const AccentContext = createContext<AccentContextValue | null>(null)

/**
 * One accent at a time. The value lives on :root as --accent (a registered, animatable
 * custom property), so every button, stitch and label crossfades together.
 */
export function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<Accent>(defaultCollection)

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent', accent.accent)
    root.style.setProperty('--accent-ink', accent.accentInk)
  }, [accent])

  const setAccent = useCallback((next: Accent) => {
    setAccentState((prev) => (prev.accent === next.accent ? prev : next))
  }, [])

  const value = useMemo(() => ({ accent, setAccent }), [accent, setAccent])
  return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>
}

export function useAccent() {
  const ctx = useContext(AccentContext)
  if (!ctx) throw new Error('useAccent must be used inside AccentProvider')
  return ctx
}
