import { useRef, useState, type PointerEvent } from 'react'
import type { ImageKey } from '../../data/images'
import { Img } from '../ui/Img'

type Props = {
  primary: ImageKey
  secondary: ImageKey
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}

/**
 * The second photograph opens from wherever the pointer enters, as a growing circle —
 * a spotlight rather than a crossfade. Touch devices simply tap-toggle.
 */
export function HoverSwap({ primary, secondary, alt, className = '', sizes, priority }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [on, setOn] = useState(false)

  const track = (e: PointerEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setOrigin({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return
        track(e)
        setOn(true)
      }}
      onPointerMove={(e) => e.pointerType === 'mouse' && !on && track(e)}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return
        // Overlays inside the same card (quick add) shouldn't close the second photo.
        const scope = ref.current?.closest('[data-swap-scope]')
        if (scope && e.relatedTarget instanceof Node && scope.contains(e.relatedTarget)) {
          scope.addEventListener('pointerleave', () => setOn(false), { once: true })
          return
        }
        setOn(false)
      }}
      onClick={(e) => {
        if ((e.nativeEvent as unknown as { pointerType?: string }).pointerType === 'mouse') return
        setOn((v) => !v)
      }}
    >
      <Img
        image={primary}
        alt={alt}
        className="absolute inset-0 h-full w-full"
        imgClassName={`transition-transform duration-[1600ms] ease-lux ${on ? 'scale-[1.08]' : 'scale-100'}`}
        sizes={sizes}
        priority={priority}
      />
      <div
        className="absolute inset-0 transition-[clip-path] duration-[1100ms] ease-lux"
        style={{ clipPath: `circle(${on ? 150 : 0}% at ${origin.x}% ${origin.y}%)` }}
      >
        <Img image={secondary} alt="" className="h-full w-full" imgClassName={`transition-transform duration-[1600ms] ease-lux ${on ? 'scale-100' : 'scale-[1.15]'}`} sizes={sizes} />
      </div>
    </div>
  )
}
