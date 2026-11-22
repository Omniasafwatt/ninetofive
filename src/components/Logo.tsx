import { LOGO_H, LOGO_PATH, LOGO_W } from './logoPath'

/** The NTF monogram. Inherits colour from `currentColor`. */
export function Logo({ className = '', title = 'Nine to Five' }: { className?: string; title?: string }) {
  return (
    <svg viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} className={className} role="img" aria-label={title} fill="currentColor">
      <path d={LOGO_PATH} />
    </svg>
  )
}

/** Oversized, cropped monogram used as a background graphic — the card's front, as a pattern. */
export function LogoPattern({ className = '' }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} className={`pointer-events-none absolute ${className}`} aria-hidden fill="currentColor" preserveAspectRatio="xMidYMid slice">
      <path d={LOGO_PATH} />
    </svg>
  )
}

/** Logo + spaced wordmark, as it sits in the navbar. */
export function Lockup({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Logo className="h-7 w-auto text-red" />
      <span className="hidden text-[0.72rem] font-medium tracking-[0.42em] uppercase sm:inline">Nine to Five</span>
    </span>
  )
}
