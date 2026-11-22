import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef, type ReactNode, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'

/** Pulls its child toward the pointer, then springs home. */
export function Magnetic({ children, strength = 0.35, block }: { children: ReactNode; strength?: number; block?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useSpring(useMotionValue(0), { stiffness: 180, damping: 14, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 180, damping: 14, mass: 0.4 })

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div ref={ref} className={block ? 'block w-full' : 'inline-block'} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.div>
  )
}

type ButtonProps = {
  children: ReactNode
  to?: string
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'accent' | 'light' | 'dark' | 'outline-light' | 'outline-dark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  cursor?: string
  /** Stretch to the parent's width (the magnetic wrapper is inline by default). */
  full?: boolean
}

const base: Record<NonNullable<ButtonProps['variant']>, string> = {
  accent: 'bg-accent text-accent-ink',
  light: 'bg-paper text-ink',
  dark: 'bg-ink text-paper',
  'outline-light': 'border border-paper/40 text-paper',
  'outline-dark': 'border border-ink/25 text-ink',
}
const fill: Record<NonNullable<ButtonProps['variant']>, string> = {
  accent: 'bg-ink',
  light: 'bg-accent',
  dark: 'bg-accent',
  'outline-light': 'bg-paper',
  'outline-dark': 'bg-ink',
}
const hoverText: Record<NonNullable<ButtonProps['variant']>, string> = {
  accent: 'group-hover:text-paper',
  light: 'group-hover:text-accent-ink',
  dark: 'group-hover:text-accent-ink',
  'outline-light': 'group-hover:text-ink',
  'outline-dark': 'group-hover:text-paper',
}
const sizes = {
  sm: 'h-10 px-5 text-[0.65rem]',
  md: 'h-12 px-7 text-[0.7rem]',
  lg: 'h-16 px-10 text-[0.75rem]',
}

/**
 * Pill button with a magnetic pull, a fill that rises from the bottom on hover,
 * and a label that rolls to a duplicate of itself.
 */
export function MagneticButton({
  children,
  to,
  href,
  onClick,
  type = 'button',
  variant = 'accent',
  size = 'md',
  className = '',
  disabled,
  cursor,
  full,
}: ButtonProps) {
  const cls = `group relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold uppercase tracking-[0.2em] transition-[box-shadow,opacity] duration-500 hover:shadow-[0_0_40px_-6px_var(--accent)] disabled:pointer-events-none disabled:opacity-40 ${base[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}`
  const inner = (
    <>
      <span
        className={`absolute inset-0 translate-y-[101%] rounded-[50%] transition-[translate,border-radius] duration-700 ease-lux group-hover:translate-y-0 group-hover:rounded-none ${fill[variant]}`}
      />
      <span className={`relative block overflow-hidden transition-colors duration-500 ${hoverText[variant]}`}>
        <span className="block transition-transform duration-700 ease-lux group-hover:-translate-y-full">{children}</span>
        <span aria-hidden className="absolute inset-0 block translate-y-full transition-transform duration-700 ease-lux group-hover:translate-y-0">
          {children}
        </span>
      </span>
    </>
  )

  const el = to ? (
    <Link to={to} className={cls} data-cursor={cursor ?? 'hide'}>
      {inner}
    </Link>
  ) : href ? (
    <a href={href} className={cls} data-cursor={cursor ?? 'hide'}>
      {inner}
    </a>
  ) : (
    <button type={type} onClick={onClick} className={cls} disabled={disabled} data-cursor={cursor ?? 'hide'}>
      {inner}
    </button>
  )

  return <Magnetic strength={full ? 0.08 : 0.35} block={full}>{el}</Magnetic>
}
