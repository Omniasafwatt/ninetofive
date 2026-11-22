import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import type { ImageKey } from '../../data/images'
import { Img } from './Img'

type Props = {
  image: ImageKey
  alt: string
  className?: string
  /** Vertical travel as a percentage of the frame. */
  speed?: number
  /** Scale the image down from `zoom` to 1 while it passes through the viewport. */
  zoom?: number
  sizes?: string
  priority?: boolean
}

/** A framed photo that drifts slower than the page and settles its scale as it scrolls. */
export function ParallaxImage({ image, alt, className = '', speed = 12, zoom = 1.18, sizes, priority }: Props) {
  const frame = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const inner = frame.current?.querySelector('[data-parallax]')
      if (!inner) return
      gsap.fromTo(
        inner,
        { yPercent: -speed, scale: zoom },
        {
          yPercent: speed,
          scale: 1.02,
          ease: 'none',
          scrollTrigger: { trigger: frame.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    },
    { scope: frame },
  )

  return (
    <div ref={frame} className={`relative overflow-hidden ${className}`}>
      <div data-parallax className="absolute -inset-y-[14%] inset-x-0 will-change-transform">
        <Img image={image} alt={alt} className="h-full w-full" sizes={sizes} priority={priority} />
      </div>
    </div>
  )
}
