import { useCallback, useEffect, useState } from 'react'

/** Local editable copy of a record, with a dirty flag and an "are you sure?" guard on tab close. */
export function useDraft<T extends object>(initial: T) {
  const [base, setBase] = useState(initial)
  const [draft, setDraft] = useState(initial)

  useEffect(() => {
    setBase(initial)
    setDraft(initial)
  }, [initial])

  const dirty = JSON.stringify(base) !== JSON.stringify(draft)

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = useCallback((patch: Partial<T>) => setDraft((d) => ({ ...d, ...patch })), [])
  const reset = useCallback(
    (next?: T) => {
      if (next) setBase(next)
      setDraft(next ?? base)
    },
    [base],
  )

  return { draft, set, dirty, reset }
}
