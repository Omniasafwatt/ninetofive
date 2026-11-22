import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { EASE } from '../../lib/gsap'

export type Option = { value: string; label: string; meta?: ReactNode; swatch?: string }

/** Pill trigger + floating list. Closes on outside click and Escape; arrow keys move through options. */
export function Dropdown({ label, value, options, onChange, align = 'left' }: { label: string; value: string; options: Option[]; onChange: (v: string) => void; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const id = useId()
  const current = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', key)
    }
  }, [open])

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={id}
        className={`group flex h-10 items-center gap-2 rounded-full border px-4 text-[0.72rem] transition-colors duration-300 ${open ? 'border-ink bg-ink text-paper' : 'border-ink/15 hover:border-ink/50'}`}
      >
        <span className={open ? 'text-paper/60' : 'text-charcoal/55'}>{label}</span>
        <span className="flex items-center gap-1.5 font-semibold">
          {current?.swatch && <span className="size-2 rounded-full" style={{ background: current.swatch }} />}
          {current?.label}
        </span>
        <span className={`text-[0.6rem] transition-transform duration-500 ease-lux ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            id={id}
            role="listbox"
            aria-label={label}
            onKeyDown={onListKey}
            initial={{ opacity: 0, y: -6, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={`absolute top-12 z-[90] min-w-[230px] origin-top overflow-hidden rounded-2xl border border-ink/10 bg-paper/95 p-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] backdrop-blur-xl ${align === 'right' ? 'right-0' : 'left-0'}`}
            data-lenis-prevent
          >
            {options.map((o, i) => {
              const on = o.value === value
              return (
                <motion.li key={o.value} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.02 * i, duration: 0.3, ease: EASE }}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    autoFocus={on}
                    onClick={() => {
                      onChange(o.value)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.8rem] outline-none transition-colors duration-200 focus:bg-fog ${on ? 'bg-fog font-semibold' : 'hover:bg-fog/70'}`}
                  >
                    {o.swatch ? <span className="size-2 rounded-full" style={{ background: o.swatch }} /> : <span className={`size-1.5 rounded-full ${on ? 'bg-accent' : 'bg-transparent'}`} />}
                    <span className="flex-1">{o.label}</span>
                    {o.meta !== undefined && <span className="text-[0.7rem] tabular-nums text-charcoal/45">{o.meta}</span>}
                  </button>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
