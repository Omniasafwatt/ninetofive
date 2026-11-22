import { AnimatePresence, motion } from 'framer-motion'
import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { EASE } from '../../lib/gsap'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  hint?: string
  trailing?: ReactNode
}

/** Floating-label input with an accent underline that draws on focus and a sliding error line. */
export function Field({ label, value, onChange, error, hint, trailing, className = '', ...rest }: Props) {
  const id = useId()
  const [focus, setFocus] = useState(false)
  const up = focus || value.length > 0
  return (
    <div className={`relative pt-5 ${className}`}>
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-0 origin-left transition-all duration-500 ease-lux ${
          up ? 'eyebrow top-0 text-[0.58rem] text-charcoal/55' : 'top-7 text-[0.95rem] text-charcoal/45'
        } ${error ? 'text-accent' : ''}`}
      >
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          aria-invalid={!!error}
          className="w-full bg-transparent py-2 text-[0.95rem] outline-none"
          {...rest}
        />
        {trailing}
      </div>
      <span className={`absolute inset-x-0 bottom-0 h-px ${error ? 'bg-accent/60' : 'bg-ink/15'}`} />
      <span
        className={`absolute bottom-0 left-0 h-[2px] w-full origin-left bg-accent transition-transform duration-700 ease-lux ${focus ? 'scale-x-100' : 'scale-x-0'}`}
      />
      <AnimatePresence>
        {(error || hint) && (
          <motion.p
            key={error ?? hint}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={`absolute -bottom-5 left-0 text-[0.68rem] ${error ? 'text-accent' : 'text-charcoal/50'}`}
          >
            {error ?? hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Choice({
  checked,
  onSelect,
  title,
  meta,
  aside,
}: {
  checked: boolean
  onSelect: () => void
  title: string
  meta?: string
  aside?: ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border px-5 py-4 text-left transition-colors duration-500 ${
        checked ? 'border-ink' : 'border-ink/15 hover:border-ink/40'
      }`}
    >
      <span className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-500 ${checked ? 'border-accent' : 'border-ink/30'}`}>
        <span className={`size-2.5 rounded-full bg-accent transition-transform duration-500 ease-lux ${checked ? 'scale-100' : 'scale-0'}`} />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        {meta && <span className="mt-0.5 block text-xs text-charcoal/60">{meta}</span>}
      </span>
      {aside}
    </button>
  )
}
