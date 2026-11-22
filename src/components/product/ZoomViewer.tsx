import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type PointerEvent } from 'react'
import { imageUrl, type ImageKey } from '../../data/images'
import { useContent } from '../../context/ContentContext'
import { useLenis } from '../../context/SmoothScroll'
import { EASE } from '../../lib/gsap'

type Props = { images: ImageKey[]; index: number | null; onClose: () => void; onIndex: (i: number) => void; alt: string }

/** Full-screen inspection. The photo is magnified 2.2× and pans to wherever you point. */
export function ZoomViewer({ images, index, onClose, onIndex, alt }: Props) {
  const lenis = useLenis()
  const { image } = useContent()
  const [origin, setOrigin] = useState('50% 50%')
  const [zoomed, setZoomed] = useState(true)

  useEffect(() => {
    if (index === null) return
    lenis?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index + 1) % images.length)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [index, images.length, lenis, onClose, onIndex])

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <AnimatePresence>
      {index !== null && (
        <motion.div
          className="fixed inset-0 z-[170] bg-ink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          role="dialog"
          aria-label="Image zoom"
          data-lenis-prevent
        >
          <div className="absolute inset-0 overflow-hidden" onPointerMove={move} onClick={() => setZoomed((z) => !z)} data-cursor={zoomed ? 'Zoom out' : 'Zoom in'}>
            <AnimatePresence mode="popLayout">
              <motion.img
                key={index}
                src={imageUrl(image(images[index]), 2400)}
                alt={alt}
                className={`${image(images[index])?.color ? '' : 'photo'} h-full w-full object-cover transition-transform duration-700 ease-lux`}
                style={{ transformOrigin: origin, transform: `scale(${zoomed ? 2.2 : 1})` }}
                initial={{ opacity: 0, filter: 'blur(20px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                draggable={false}
              />
            </AnimatePresence>
          </div>
          <div className="gutter pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between py-6 text-paper mix-blend-difference">
            <span className="eyebrow tabular-nums">
              {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </span>
            <button onClick={onClose} className="eyebrow link-underline pointer-events-auto">
              Close ✕
            </button>
          </div>
          <div className="gutter absolute inset-x-0 bottom-6 flex justify-center gap-2">
            {images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => onIndex(i)}
                className={`h-[3px] rounded-full transition-all duration-500 ${i === index ? 'w-10 bg-accent' : 'w-5 bg-paper/40 hover:bg-paper'}`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
