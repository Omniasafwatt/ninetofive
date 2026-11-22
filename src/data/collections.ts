import type { ImageKey } from './images'

/** A "moment" of the day. The shop is organised around where you're going, not what the garment is. */
export type Collection = {
  slug: string
  number: string
  name: string
  accent: string
  accentInk: string
  accentName: string
  hours: string
  mood: string
  line: string
  story: string[]
  cover: ImageKey
  gallery: ImageKey[]
}

export const collections: Collection[] = [
  {
    slug: 'work-hours',
    number: '01',
    name: 'Work hours',
    accent: '#941a1f',
    accentInk: '#ffffff',
    accentName: 'Brick red',
    hours: '09:00',
    mood: 'Polished. Easy. Sure of herself.',
    line: 'Sharp enough for the meeting, soft enough to sit in all day.',
    story: [
      'Clean shirts, relaxed trousers and knits that keep their shape from the first coffee to the last email.',
      'Nothing stiff, nothing that needs fixing in the mirror every hour.',
    ],
    cover: 'coatWoman',
    gallery: ['shirtHanger', 'laptop'],
  },
  {
    slug: 'campus-days',
    number: '02',
    name: 'Campus days',
    accent: '#6c141c',
    accentInk: '#ffffff',
    accentName: 'Maroon',
    hours: '11:30',
    mood: 'Comfy. Put together. Ready to walk.',
    line: 'Long lectures, library hours and the walk between buildings.',
    story: [
      'Hoodies and tees with a better cut, jeans that move with you, layers for cold lecture halls.',
      'Comfortable enough for an eight-hour day. Cute enough for the photo after it.',
    ],
    cover: 'teeWoman',
    gallery: ['corridor', 'knit'],
  },
  {
    slug: 'on-the-go',
    number: '03',
    name: 'On the go',
    accent: '#4c494a',
    accentInk: '#ffffff',
    accentName: 'Charcoal',
    hours: '15:00',
    mood: 'Quick stops. Long ones too.',
    line: 'Errands, rides across town and every “I’ll be quick” that isn’t.',
    story: ['Easy pieces you can throw on in a minute and still feel like yourself in.'],
    cover: 'denimWoman',
    gallery: ['jeansFlat', 'coffee'],
  },
  {
    slug: 'after-five',
    number: '04',
    name: 'After five',
    accent: '#b4474b',
    accentInk: '#ffffff',
    accentName: 'Rosewood',
    hours: '17:00',
    mood: 'Off the clock, still on point.',
    line: 'Coffee plans, dinners and the long way home.',
    story: ['The same outfit, one layer different. Day into evening without going home to change.'],
    cover: 'portraitWoman',
    gallery: ['trenchCoat', 'cafe'],
  },
]

export const defaultCollection = collections[0]

export function getCollection(slug?: string) {
  return collections.find((c) => c.slug === slug)
}
