import { useEffect, useState } from 'react'

/** Live HH:MM:SS — the brand is literally about the hour you're in. */
export function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    date: now,
    hh: pad(now.getHours()),
    mm: pad(now.getMinutes()),
    ss: pad(now.getSeconds()),
    label: greeting(now.getHours()),
  }
}

function greeting(h: number) {
  if (h < 5) return 'Late-night walk'
  if (h < 9) return 'Morning coffee'
  if (h < 13) return 'Lecture hall'
  if (h < 18) return 'Office hours'
  if (h < 21) return 'Golden hour'
  return 'City after dark'
}
