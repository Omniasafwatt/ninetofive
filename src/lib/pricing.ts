import type { BagItem } from '../context/BagContext'
import type { Product } from '../data/products'

export const FREE_SHIPPING_OVER = 200

export const SHIPPING = [
  { id: 'standard', label: 'Standard', eta: '3–5 working days', price: 12 },
  { id: 'express', label: 'Express', eta: '1–2 working days', price: 25 },
  { id: 'same-day', label: 'Same day courier', eta: 'Order before 13:00', price: 40 },
] as const

export type ShippingId = (typeof SHIPPING)[number]['id']

/** Promo codes the demo understands. A real store would validate these server-side. */
export const PROMOS: Record<string, { label: string; rate: number }> = {
  EVERYHOUR: { label: 'Every hour — 10% off', rate: 0.1 },
  NINETOFIVE: { label: 'Nine to five — 15% off', rate: 0.15 },
}

export const TAX_RATE = 0.14

export type Line = BagItem & { product: Product; index: number }

export function totals(lines: Line[], shipping: ShippingId, promo?: string) {
  const subtotal = lines.reduce((n, l) => n + l.product.price * l.qty, 0)
  const discount = promo && PROMOS[promo] ? Math.round(subtotal * PROMOS[promo].rate) : 0
  const method = SHIPPING.find((s) => s.id === shipping) ?? SHIPPING[0]
  const shippingCost = method.id === 'standard' && subtotal - discount >= FREE_SHIPPING_OVER ? 0 : method.price
  const taxable = subtotal - discount
  const tax = Math.round(taxable * TAX_RATE)
  return { subtotal, discount, shipping: shippingCost, tax, total: taxable + shippingCost + tax }
}
