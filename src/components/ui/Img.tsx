import { useState, type CSSProperties } from 'react'
import { useContent } from '../../context/ContentContext'
import { imageSrcSet, imageUrl, type ImageKey } from '../../data/images'

type Props = {
  image: ImageKey
  alt: string
  className?: string
  imgClassName?: string
  sizes?: string
  priority?: boolean
  mono?: boolean
  style?: CSSProperties
}

/** Lazy editorial image: concrete placeholder, soft blur-to-sharp reveal once decoded. */
export function Img({ image, alt, className = '', imgClassName = '', sizes = '100vw', priority, mono = true, style }: Props) {
  const src = useContent().image(image)
  const url = imageUrl(src, 1600)
  // Track which URL finished loading, so a replaced image fades in again instead of popping.
  const [loadedUrl, setLoadedUrl] = useState<string>()
  const loaded = loadedUrl === url
  const grade = mono && !src?.color
  return (
    // Callers may position the frame themselves (absolute/fixed); only default to relative otherwise.
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative'} overflow-hidden bg-concrete ${className}`} style={style}>
      <img
        src={url || undefined}
        srcSet={imageSrcSet(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
        onLoad={() => setLoadedUrl(url)}
        className={`h-full w-full object-cover transition-[opacity,filter,scale] duration-[1400ms] ease-lux ${
          grade ? 'photo' : ''
        } ${loaded ? 'opacity-100 blur-0' : 'scale-[1.04] opacity-0 blur-xl'} ${imgClassName}`}
      />
    </div>
  )
}
