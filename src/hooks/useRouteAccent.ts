import { useEffect } from 'react'
import { useAccent } from '../context/AccentContext'
import { useContent } from '../context/ContentContext'
import type { Collection } from '../data/collections'

/** Pages declare which collection's colour the room should be painted in when they open. */
export function useRouteAccent(collection?: Collection | null) {
  const { setAccent } = useAccent()
  const fallback = useContent().collections[0]
  const target = collection === undefined ? fallback : collection
  useEffect(() => {
    if (target) setAccent(target)
  }, [target, setAccent])
}
