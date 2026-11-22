import { useState, type CSSProperties } from 'react'
import { useContent } from '../context/ContentContext'
import { imageSrcSet, imageUrl, type ImageKey } from '../data/images'

type Props = {
  image: ImageKey
  alt: string
  className?: string
  imgClassName?: string
  sizes?: string
  priority?: boolean
  style?: CSSProperties
}

/** Lazy image on a soft grey placeholder; fades in once decoded. */
export function Img({ image, alt, className = '', imgClassName = '', sizes = '100vw', priority, style }: Props) {
  const src = useContent().image(image)
  const url = imageUrl(src, 1400)
  const [loadedUrl, setLoadedUrl] = useState<string>()
  const loaded = loadedUrl === url
  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative'} overflow-hidden bg-fog ${className}`} style={style}>
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
        className={`h-full w-full object-cover transition-opacity duration-700 ease-lux ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
      />
    </div>
  )
}
