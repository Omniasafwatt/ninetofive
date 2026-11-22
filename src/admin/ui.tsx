import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useId, useState, type ReactNode, type TextareaHTMLAttributes, type InputHTMLAttributes } from 'react'
import { EASE } from '../lib/ease'

/* ——— Layout ——— */

export function PageHeader({ eyebrow, title, actions, children }: { eyebrow?: string; title: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-ink/10 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-3 text-[0.6rem] text-charcoal/50">{eyebrow}</p>}
        <h1 className="display text-[clamp(2.4rem,4vw,3.6rem)] leading-[0.95]">{title}</h1>
        {children && <div className="mt-3 max-w-2xl text-sm text-charcoal/60">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

export function Card({ title, description, children, aside }: { title?: string; description?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-paper p-5 sm:p-6">
      {(title || aside) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {description && <p className="mt-1 text-xs text-charcoal/55">{description}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  )
}

/* ——— Buttons ——— */

type BtnProps = {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'accent' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  title?: string
}

export function Button({ children, onClick, variant = 'outline', size = 'md', type = 'button', disabled, className = '', title }: BtnProps) {
  const v = {
    primary: 'bg-ink text-paper hover:bg-charcoal',
    accent: 'bg-accent text-accent-ink hover:brightness-110',
    ghost: 'text-charcoal/70 hover:bg-ink/5 hover:text-ink',
    danger: 'border border-red-600/30 text-red-700 hover:bg-red-600 hover:text-white',
    outline: 'border border-ink/15 hover:border-ink hover:bg-ink hover:text-paper',
  }[variant]
  const s = size === 'sm' ? 'h-8 px-3 text-[0.7rem]' : 'h-10 px-4 text-xs'
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 ${v} ${s} ${className}`}
    >
      {children}
    </button>
  )
}

/* ——— Inputs ——— */

const inputCls =
  'w-full rounded-xl border border-ink/12 bg-fog/60 px-3.5 py-2.5 text-sm outline-none transition-colors duration-300 placeholder:text-charcoal/35 focus:border-ink/40 focus:bg-paper'

export function Label({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-3 text-xs font-semibold text-charcoal/80">
        {label}
        {hint && !error && <span className="font-normal text-charcoal/45">{hint}</span>}
        {error && <span className="font-normal text-red-600">{error}</span>}
      </label>
      {children}
    </div>
  )
}

export function TextInput({ label, hint, error, value, onChange, ...rest }: { label: string; hint?: string; error?: string; value: string; onChange: (v: string) => void } & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const id = useId()
  return (
    <Label label={label} hint={hint} error={error} htmlFor={id}>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${error ? 'border-red-500/60' : ''}`} {...rest} />
    </Label>
  )
}

export function NumberInput({ label, hint, value, onChange, prefix, min = 0 }: { label: string; hint?: string; value: number; onChange: (v: number) => void; prefix?: string; min?: number }) {
  const id = useId()
  return (
    <Label label={label} hint={hint} htmlFor={id}>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-charcoal/50">{prefix}</span>}
        <input
          id={id}
          type="number"
          min={min}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          className={`${inputCls} ${prefix ? 'pl-7' : ''}`}
        />
      </div>
    </Label>
  )
}

export function TextArea({ label, hint, value, onChange, rows = 4, ...rest }: { label: string; hint?: string; value: string; onChange: (v: string) => void; rows?: number } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  const id = useId()
  return (
    <Label label={label} hint={hint ?? `${value.length} characters`} htmlFor={id}>
      <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} resize-y leading-relaxed`} {...rest} />
    </Label>
  )
}

export function Select({ label, value, onChange, options, hint }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; hint?: string }) {
  const id = useId()
  return (
    <Label label={label} hint={hint} htmlFor={id}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Label>
  )
}

export function ColorInput({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const id = useId()
  const valid = /^#[0-9a-f]{6}$/i.test(value)
  return (
    <Label label={label} hint={hint} error={valid ? undefined : 'Use #RRGGBB'} htmlFor={id}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={valid ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="size-10 shrink-0 cursor-pointer rounded-xl border border-ink/12 bg-transparent p-1"
          aria-label={`${label} picker`}
        />
        <input id={id} value={value} onChange={(e) => onChange(e.target.value.trim())} className={`${inputCls} font-mono`} />
      </div>
    </Label>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex items-center gap-2.5 text-xs font-medium">
      <span className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${checked ? 'bg-accent' : 'bg-ink/15'}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-paper shadow transition-transform duration-300 ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      {label}
    </button>
  )
}

/** Small ordered-list editor for plain strings (features, story paragraphs…). */
export function StringList({
  label,
  items,
  onChange,
  placeholder,
  multiline,
  addLabel = 'Add',
  min = 0,
}: {
  label: string
  items: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  multiline?: boolean
  addLabel?: string
  min?: number
}) {
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)))
  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-charcoal/80">{label}</p>
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2.5 w-5 shrink-0 text-right text-[0.65rem] text-charcoal/40 tabular-nums">{i + 1}</span>
          {multiline ? (
            <textarea value={it} rows={2} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} className={`${inputCls} resize-y`} />
          ) : (
            <input value={it} onChange={(e) => set(i, e.target.value)} placeholder={placeholder} className={inputCls} />
          )}
          <RowActions onUp={() => move(i, -1)} onDown={() => move(i, 1)} onRemove={items.length > min ? () => onChange(items.filter((_, j) => j !== i)) : undefined} />
        </div>
      ))}
      <div className="pl-7">
        <Button size="sm" variant="ghost" onClick={() => onChange([...items, ''])}>
          + {addLabel}
        </Button>
      </div>
    </div>
  )
}

export function RowActions({ onUp, onDown, onRemove }: { onUp?: () => void; onDown?: () => void; onRemove?: () => void }) {
  const b = 'grid size-8 place-items-center rounded-full text-xs text-charcoal/60 transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30'
  return (
    <div className="flex shrink-0 items-center">
      {onUp && (
        <button type="button" onClick={onUp} className={b} aria-label="Move up">
          ↑
        </button>
      )}
      {onDown && (
        <button type="button" onClick={onDown} className={b} aria-label="Move down">
          ↓
        </button>
      )}
      <button type="button" onClick={onRemove} disabled={!onRemove} className={`${b} hover:!bg-red-50 hover:!text-red-600`} aria-label="Remove">
        ✕
      </button>
    </div>
  )
}

/* ——— Modal ——— */

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[400] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-paper shadow-2xl sm:rounded-3xl ${wide ? 'max-w-5xl' : 'max-w-lg'}`}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
              <h2 className="display text-2xl">{title}</h2>
              <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-ink/5" aria-label="Close">
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ——— Toasts ——— */

type Toast = { id: number; text: string; tone: 'ok' | 'error' }
const ToastContext = createContext<(text: string, tone?: Toast['tone']) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((text: string, tone: Toast['tone'] = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, text, tone }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[500] flex flex-col items-end gap-2" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4, ease: EASE }}
              className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-semibold shadow-lg ${t.tone === 'error' ? 'bg-red-600 text-white' : 'bg-ink text-paper'}`}
            >
              <span className={`size-1.5 rounded-full ${t.tone === 'error' ? 'bg-white' : 'bg-accent'}`} />
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'ok' | 'warn' }) {
  const t = { neutral: 'bg-ink/5 text-charcoal/70', accent: 'bg-accent text-accent-ink', ok: 'bg-emerald-50 text-emerald-700', warn: 'bg-amber-50 text-amber-700' }[tone]
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-semibold ${t}`}>{children}</span>
}
