import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useMediaQuery'
import { Garment, GarmentEdge, type GarmentKind } from './Garment'

type Props = { kind: GarmentKind; color: string; colorName: string; accent: string; className?: string }

/**
 * One piece on a short length of rail, in the colour you picked. It arrives edge-on and
 * turns to face you; move the pointer across it to turn it on its hook, or tap to see its edge.
 */
export function HangerView({ kind, color, colorName, accent, className = '' }: Props) {
  const reduce = useReducedMotion()
  const target = useMotionValue(reduce ? 0 : -76)
  const rotateY = useSpring(target, { stiffness: 60, damping: 16 })
  const [side, setSide] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => target.set(0), reduce ? 0 : 500)
    return () => window.clearTimeout(id)
  }, [target, reduce])

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center overflow-hidden bg-[radial-gradient(90%_70%_at_50%_10%,var(--color-paper),var(--color-fog))] ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        target.set(((e.clientX - r.left) / r.width - 0.5) * 70)
      }}
      onPointerLeave={(e) => e.pointerType === 'mouse' && target.set(side ? -76 : 0)}
      onClick={(e) => {
        if ((e.nativeEvent as PointerEvent).pointerType === 'mouse') return
        setSide((s) => {
          target.set(s ? 0 : -76)
          return !s
        })
      }}
      role="img"
      aria-label={`The piece on its hanger in ${colorName}`}
    >
      <span aria-hidden className="absolute inset-x-[8%] top-[9%] h-[6px] rounded-full bg-gradient-to-b from-[#d9d4cc] via-[#8f877d] to-[#5e5750]" />
      {/* Margins resolve against the panel's width; the rail sits at 9% of a 4:5 panel's height (11.25% of its width). */}
      <div className="relative w-[min(62%,360px)]" style={{ perspective: '1100px', marginTop: 'calc(11.25% + 3px - min(62%, 360px) * 0.045)' }}>
        <motion.div className="relative aspect-[200/350] [transform-style:preserve-3d]" style={{ rotateY }}>
          <Garment kind={kind} color={color} accent={accent} className="absolute inset-0 h-full w-full drop-shadow-[0_18px_18px_rgba(42,31,25,0.18)]" />
          <GarmentEdge kind={kind} color={color} />
        </motion.div>
      </div>
      <p className="eyebrow absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-paper/80 px-3 py-1.5 text-[0.58rem] backdrop-blur">
        <span className="size-2 rounded-full ring-1 ring-ink/15" style={{ background: color }} />
        {colorName}
        <span className="text-charcoal/50">
          — <span className="hidden [@media(hover:hover)]:inline">move to turn</span>
          <span className="[@media(hover:hover)]:hidden">tap to turn</span>
        </span>
      </p>
    </div>
  )
}
