import { kvGet, kvSet } from './storage'

export type OrderStatus = 'new' | 'packed' | 'shipped' | 'delivered' | 'cancelled'

export type Order = {
  id: string
  createdAt: string
  status: OrderStatus
  customer: { email: string; firstName: string; lastName: string; phone: string }
  address: { line1: string; line2: string; city: string; postcode: string; country: string }
  shipping: { id: string; label: string; cost: number }
  /** Only the brand and last four digits are ever kept — never the full card. */
  payment: { method: 'card' | 'cod'; brand?: string; last4?: string }
  lines: { slug: string; name: string; color: string; size: string; qty: number; price: number }[]
  promo?: string
  totals: { subtotal: number; discount: number; shipping: number; tax: number; total: number }
}

const KEY = 'orders'

export async function listOrders(): Promise<Order[]> {
  return (await kvGet<Order[]>(KEY)) ?? []
}

export async function saveOrder(order: Order) {
  const all = await listOrders()
  await kvSet(KEY, [order, ...all])
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const all = await listOrders()
  await kvSet(
    KEY,
    all.map((o) => (o.id === id ? { ...o, status } : o)),
  )
}

export function newOrderId() {
  const n = Math.floor(Date.now() / 1000) % 100000
  return `9T5-${String(n).padStart(5, '0')}${Math.floor(Math.random() * 10)}`
}
