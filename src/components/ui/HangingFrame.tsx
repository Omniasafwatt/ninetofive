import type { ReactNode } from 'react'

/**
 * A photo (or anything) hung from a hook on two threads, like a framed print in a
 * showroom. It swings gently from the hook when hovered — the same gesture as the rail.
 */
export function HangingFrame({ children, className = '', frameClassName = '' }: { children: ReactNode; className?: string; frameClassName?: string }) {
  return (
    <div className={`hang relative pt-7 ${className}`}>
      <svg aria-hidden className="absolute inset-x-0 top-0 h-7 w-full overflow-visible" viewBox="0 0 100 28" preserveAspectRatio="none">
        <path d="M50 5 L22 28 M50 5 L78 28" stroke="#8a8279" strokeWidth="1" vectorEffect="non-scaling-stroke" fill="none" />
      </svg>
      <span aria-hidden className="absolute top-[-3px] left-1/2 size-[11px] -translate-x-1/2 rounded-full border-[2px] border-[#8a8279] bg-paper" />
      <div className={`relative overflow-hidden rounded-2xl bg-fog shadow-[0_24px_40px_-28px_rgba(42,31,25,0.45)] ${frameClassName}`}>{children}</div>
    </div>
  )
}
