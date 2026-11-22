import { motion, type Variants } from 'framer-motion'
import { createElement, type ElementType } from 'react'
import { EASE } from '../../lib/gsap'

type Props = {
  text: string
  as?: ElementType
  className?: string
  by?: 'chars' | 'words'
  delay?: number
  stagger?: number
  duration?: number
  /** 'inView' reveals on scroll; 'mount' plays immediately; a boolean lets the parent decide. */
  play?: 'inView' | 'mount' | boolean
  italicWords?: string[]
}

const item: Variants = {
  hidden: { y: '110%', rotate: 4 },
  show: (d: number) => ({ y: '0%', rotate: 0, transition: { duration: d, ease: EASE } }),
}

/**
 * Masks each word (and optionally each character) so the type rises out of an
 * invisible baseline — the signature headline entrance.
 */
export function SplitText({
  text,
  as = 'span',
  className = '',
  by = 'chars',
  delay = 0,
  stagger,
  duration = 1.1,
  play = 'inView',
  italicWords = [],
}: Props) {
  const words = text.split(' ')
  const step = stagger ?? (by === 'chars' ? 0.028 : 0.07)

  const controlled =
    play === 'inView'
      ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.4 } }
      : { initial: 'hidden', animate: play === 'mount' || play === true ? 'show' : 'hidden' }

  let charIndex = 0
  const content = (
    <motion.span
      {...controlled}
      transition={{ staggerChildren: step, delayChildren: delay }}
      className="inline"
      aria-hidden
    >
      {words.map((word, wi) => {
        const bare = (w: string) => w.replace(/[.,]/g, '')
        const italic = italicWords.some((w) => bare(w) === bare(word))
        return (
          <span key={wi} className={`inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-top ${italic ? 'italic' : ''}`}>
            {by === 'words' ? (
              <motion.span className="inline-block origin-bottom-left" variants={item} custom={duration}>
                {word}
              </motion.span>
            ) : (
              word.split('').map((ch) => (
                <motion.span
                  key={charIndex++}
                  className="inline-block origin-bottom-left"
                  variants={item}
                  custom={duration}
                >
                  {ch}
                </motion.span>
              ))
            )}
            {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        )
      })}
    </motion.span>
  )

  return createElement(as, { className, 'aria-label': text }, content)
}
