/**
 * Placeholder photography from Unsplash's CDN. Swap any of these for real product shots
 * from the admin Media library — the change applies everywhere the image is used.
 */
const ids = {
  coatWoman: '1485968579580-b6d095142e6e',
  denimWoman: '1517841905240-472988babdf9',
  portraitWoman: '1524504388940-b1c1722653e1',
  teeWoman: '1503342217505-b0a15ec3261c',
  teeWomanBlack: '1583744946564-b52ac1c389c8',
  milan: '1539109136881-3be0616acf4b',
  corridor: '1497366216548-37526070297c',
  cafe: '1501339847302-ac426a4a7cbb',
  coffee: '1495474472287-4d71bcdd2085',
  laptop: '1545239351-1141bd82e8a6',
  knit: '1434389677669-e08b4cac3105',
  knitFlatlay: '1556905055-8f358a7a47b2',
  hanging: '1558769132-cb1aea458c5e',
  hangingSoft: '1523381210434-271e8be1f52b',
  rackWhite: '1490481651871-ab68de25d43d',
  rackMinimal: '1551232864-3f0890e580d9',
  shirtHanger: '1596755094514-f87e34085b2c',
  shirtsFolded: '1602810318383-e386cc2a3ccf',
  sweatFlat: '1620799140408-edc6dcb6d633',
  teeHangerWhite: '1581655353564-df123a1eb820',
  teesHanging: '1576871337622-98d48d1cf531',
  teeFlatlay: '1618677603286-0ec56cb6e1b5',
  jeansFlat: '1624378439575-d8705ad7ae80',
  foldedDenim: '1604176354204-9268737828e4',
  denimStack: '1605518216938-7c31b7b14ad0',
  trenchCoat: '1539533018447-63fcce2678e3',
  backpack: '1553062407-98eeb64c6a62',
  beanieStack: '1576871337632-b9aef4c17ab9',
  flatlayDark: '1544441893-675973e31985',
} as const

/** Every image slot on the site is referenced by key, so replacing a key's source updates it everywhere. */
export type ImageKey = string

export type ImageSource = {
  label: string
  /** 'unsplash' = photo id on Unsplash's CDN; 'url' = any URL, including uploaded data: URLs. */
  kind: 'unsplash' | 'url'
  value: string
  /** Legacy flag from the old black & white grade. Photos now always show in colour. */
  color?: boolean
}

const labelFor = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())

export const defaultImages: Record<ImageKey, ImageSource> = Object.fromEntries(
  Object.entries(ids).map(([key, id]) => [key, { label: labelFor(key), kind: 'unsplash', value: id }]),
)

const WIDTHS = [480, 800, 1200, 1800]

export function imageUrl(src: ImageSource | undefined, width = 1400) {
  if (!src) return ''
  if (src.kind === 'url') return src.value
  return `https://images.unsplash.com/photo-${src.value}?auto=format&fit=crop&w=${width}&q=78`
}

export function imageSrcSet(src: ImageSource | undefined) {
  if (!src || src.kind !== 'unsplash') return undefined
  return WIDTHS.map((w) => `${imageUrl(src, w)} ${w}w`).join(', ')
}
