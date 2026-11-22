import type { ImageKey } from './images'

export type ProductColor = { name: string; hex: string }

export type Product = {
  slug: string
  number: string
  name: string
  /** Which moment of the day (collection slug) this piece belongs to. */
  collection: string
  /** Shop department, e.g. "Tops" or "Trousers". */
  category?: string
  /** Small label on cards: "New", "Limited", "Bestseller"… */
  tag?: string
  price: number
  tagline: string
  description: string
  images: ImageKey[]
  details: ImageKey[]
  colors: ProductColor[]
  sizes: string[]
  soldOut?: string[]
  fabric: { label: string; value: string }[]
  features: string[]
  care: string
  styleWith: string[]
}

// Seed catalogue — placeholder pieces to show the layout. Edit or replace everything from /admin.
const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const black = { name: 'Black', hex: '#1d1b1c' }
const white = { name: 'Off white', hex: '#f4f1ec' }
const grey = { name: 'Stone grey', hex: '#bdb9b6' }
const red = { name: 'Brick red', hex: '#941a1f' }
const maroon = { name: 'Maroon', hex: '#6c141c' }
const beige = { name: 'Sand', hex: '#d8c7ad' }
const denim = { name: 'Washed blue', hex: '#6f86a3' }

export const products: Product[] = [
  {
    slug: 'overtime-shirt',
    number: '001',
    name: 'Overtime Shirt',
    collection: 'work-hours',
    category: 'Shirts',
    tag: 'Bestseller',
    price: 1150,
    tagline: 'The shirt that does the whole day with you.',
    description: 'A relaxed, slightly oversized poplin shirt with a soft collar and dropped shoulders. Tuck it into trousers for work, wear it open over a tee for everything else.',
    images: ['shirtHanger', 'shirtsFolded', 'coatWoman'],
    details: ['shirtsFolded', 'hanging'],
    colors: [white, red, grey],
    sizes: SIZES,
    fabric: [
      { label: 'Fabric', value: 'Cotton poplin' },
      { label: 'Fit', value: 'Relaxed, slightly oversized' },
    ],
    features: ['Soft collar', 'Dropped shoulder', 'Longer back hem'],
    care: 'Wash at 30°. Iron on medium.',
    styleWith: ['nine-am-trousers', 'soft-hour-cardigan'],
  },
  {
    slug: 'nine-am-trousers',
    number: '002',
    name: '9 AM Trousers',
    collection: 'work-hours',
    category: 'Trousers',
    tag: 'New',
    price: 1350,
    tagline: 'Wide-leg, high-rise, zero effort.',
    description: 'Pleated wide-leg trousers with an easy elastic back waist, so they look tailored from the front and feel like joggers when you sit. Long enough for flats or sneakers.',
    images: ['milan', 'rackMinimal', 'hangingSoft'],
    details: ['hangingSoft'],
    colors: [black, beige, grey],
    sizes: SIZES,
    soldOut: ['XS'],
    fabric: [
      { label: 'Fabric', value: 'Soft crepe' },
      { label: 'Fit', value: 'High-rise, wide leg' },
    ],
    features: ['Front pleats', 'Elastic back waist', 'Side pockets'],
    care: 'Wash at 30°. Hang to dry.',
    styleWith: ['overtime-shirt', 'everyday-ribbed-top'],
  },
  {
    slug: 'everyday-ribbed-top',
    number: '003',
    name: 'Everyday Ribbed Top',
    collection: 'work-hours',
    category: 'Tops',
    price: 550,
    tagline: 'The layer under everything.',
    description: 'A fitted long-sleeve rib top with a clean crew neck. Wear it alone, under a shirt, or under a cardigan — it never bunches.',
    images: ['teesHanging', 'teeHangerWhite'],
    details: ['teeHangerWhite'],
    colors: [black, white, red],
    sizes: SIZES,
    fabric: [
      { label: 'Fabric', value: 'Stretch cotton rib' },
      { label: 'Fit', value: 'Fitted' },
    ],
    features: ['Crew neck', 'Long sleeves', 'Holds its shape'],
    care: 'Wash at 30°. Dry flat.',
    styleWith: ['nine-am-trousers', 'overtime-trench'],
  },
  {
    slug: 'lecture-knit',
    number: '004',
    name: 'Lecture Knit',
    collection: 'campus-days',
    category: 'Knitwear',
    tag: 'Bestseller',
    price: 1250,
    tagline: 'For cold lecture halls and long library hours.',
    description: 'A soft, slouchy crew-neck sweater in a mid-weight knit. Big enough to feel cosy, cut short enough to not swallow you.',
    images: ['knit', 'knitFlatlay', 'teeWoman'],
    details: ['knitFlatlay'],
    colors: [grey, maroon, white],
    sizes: ['S', 'M', 'L'],
    fabric: [
      { label: 'Fabric', value: 'Soft knit blend' },
      { label: 'Fit', value: 'Relaxed, slightly cropped' },
    ],
    features: ['Ribbed cuffs & hem', 'Dropped shoulder'],
    care: 'Hand wash cold. Dry flat.',
    styleWith: ['errand-wide-jeans', 'everyday-tee'],
  },
  {
    slug: 'campus-hoodie',
    number: '005',
    name: 'Campus Hoodie',
    collection: 'campus-days',
    category: 'Hoodies & Sweats',
    tag: 'New',
    price: 1100,
    tagline: 'A hoodie, but make it neat.',
    description: 'A boxy hoodie in brushed fleece with a small embroidered NTF on the chest. Heavy enough to feel good, clean enough to wear to class.',
    images: ['sweatFlat', 'flatlayDark'],
    details: ['flatlayDark'],
    colors: [red, grey, black],
    sizes: SIZES,
    fabric: [
      { label: 'Fabric', value: 'Brushed cotton fleece' },
      { label: 'Fit', value: 'Boxy' },
    ],
    features: ['Embroidered NTF logo', 'Kangaroo pocket', 'Double-layer hood'],
    care: 'Wash inside out at 30°.',
    styleWith: ['errand-wide-jeans'],
  },
  {
    slug: 'everyday-tee',
    number: '006',
    name: 'Everyday Tee',
    collection: 'campus-days',
    category: 'Tops',
    price: 450,
    tagline: 'The tee you’ll buy in every colour.',
    description: 'A soft, slightly boxy tee with a clean neckline and sleeves that land just right. The base of half your outfits.',
    images: ['teeWoman', 'teeFlatlay', 'teeHangerWhite'],
    details: ['teeFlatlay'],
    colors: [white, black, red, grey],
    sizes: SIZES,
    fabric: [
      { label: 'Fabric', value: 'Combed cotton jersey' },
      { label: 'Fit', value: 'Relaxed' },
    ],
    features: ['Ribbed neckline', 'Pre-shrunk'],
    care: 'Wash at 30°. Iron on reverse.',
    styleWith: ['errand-wide-jeans', 'lecture-knit'],
  },
  {
    slug: 'errand-wide-jeans',
    number: '007',
    name: 'Errand Wide Jeans',
    collection: 'on-the-go',
    category: 'Jeans',
    tag: 'Bestseller',
    price: 1300,
    tagline: 'Comfy all day, cute all day.',
    description: 'High-rise, wide-leg jeans in a soft denim with a little give. They sit right at the waist and fall straight, so they work with sneakers and flats alike.',
    images: ['jeansFlat', 'denimWoman', 'foldedDenim'],
    details: ['denimStack', 'foldedDenim'],
    colors: [denim, black],
    sizes: ['26', '28', '30', '32', '34'],
    fabric: [
      { label: 'Fabric', value: 'Soft stretch denim' },
      { label: 'Fit', value: 'High-rise, wide leg' },
    ],
    features: ['Five pockets', 'Button fly', 'Full length'],
    care: 'Wash inside out, cold.',
    styleWith: ['everyday-tee', 'campus-hoodie'],
  },
  {
    slug: 'long-day-bag',
    number: '008',
    name: 'Long Day Bag',
    collection: 'on-the-go',
    category: 'Accessories',
    price: 650,
    tagline: 'Laptop, charger, snacks, life.',
    description: 'A roomy everyday bag with a padded laptop sleeve and an inside pocket for the small things you always lose.',
    images: ['backpack', 'beanieStack'],
    details: ['beanieStack'],
    colors: [black, red],
    sizes: ['One size'],
    fabric: [{ label: 'Material', value: 'Water-resistant canvas' }],
    features: ['Padded laptop sleeve', 'Inside zip pocket'],
    care: 'Wipe clean.',
    styleWith: ['errand-wide-jeans'],
  },
  {
    slug: 'overtime-trench',
    number: '009',
    name: 'Overtime Trench',
    collection: 'after-five',
    category: 'Outerwear',
    tag: 'Limited',
    price: 2400,
    tagline: 'One layer, and you’re dressed.',
    description: 'A light, relaxed trench with a tie belt and deep pockets. Throw it over jeans and a tee and the whole outfit looks planned.',
    images: ['trenchCoat', 'coatWoman', 'portraitWoman'],
    details: ['hanging'],
    colors: [beige, black],
    sizes: ['S', 'M', 'L'],
    fabric: [
      { label: 'Fabric', value: 'Cotton twill' },
      { label: 'Fit', value: 'Relaxed' },
    ],
    features: ['Tie belt', 'Deep pockets', 'Storm flap'],
    care: 'Dry clean or cold gentle wash.',
    styleWith: ['everyday-ribbed-top', 'nine-am-trousers'],
  },
  {
    slug: 'soft-hour-cardigan',
    number: '010',
    name: 'Soft Hour Cardigan',
    collection: 'after-five',
    category: 'Knitwear',
    tag: 'New',
    price: 1200,
    tagline: 'For when the evening gets cooler.',
    description: 'A fine-knit button cardigan you can wear open as a layer or buttoned up on its own.',
    images: ['hangingSoft', 'rackWhite', 'teeWomanBlack'],
    details: ['rackWhite'],
    colors: [maroon, grey, white],
    sizes: ['S', 'M', 'L'],
    fabric: [
      { label: 'Fabric', value: 'Fine-knit blend' },
      { label: 'Fit', value: 'Regular' },
    ],
    features: ['Pearl-look buttons', 'Ribbed trims'],
    care: 'Hand wash cold. Dry flat.',
    styleWith: ['everyday-ribbed-top', 'nine-am-trousers'],
  },
]

export function getProduct(slug?: string) {
  return products.find((p) => p.slug === slug)
}

/** Departments, in the order the shop lists them. */
export const CATEGORIES = ['Tops', 'Shirts', 'Knitwear', 'Hoodies & Sweats', 'Trousers', 'Jeans', 'Skirts', 'Dresses', 'Outerwear', 'Sets', 'Accessories']

export const TAGS = ['New', 'Limited', 'Bestseller']

export function productsIn(collection: string) {
  return products.filter((p) => p.collection === collection)
}

export const formatPrice = (n: number) => `EGP ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)}`
