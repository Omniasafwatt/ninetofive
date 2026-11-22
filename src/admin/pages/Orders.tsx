import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { formatPrice } from '../../data/products'
import { EASE } from '../../lib/gsap'
import { listOrders, updateOrderStatus, type Order, type OrderStatus } from '../../lib/orders'
import { Badge, PageHeader, useToast } from '../ui'

const STATUSES: OrderStatus[] = ['new', 'packed', 'shipped', 'delivered', 'cancelled']

export function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    listOrders().then(setOrders)
  }, [])

  const setStatus = async (id: string, status: OrderStatus) => {
    await updateOrderStatus(id, status)
    setOrders((os) => os?.map((o) => (o.id === id ? { ...o, status } : o)) ?? null)
    toast(`Order ${id} marked ${status}`)
  }

  return (
    <>
      <PageHeader eyebrow="Sales" title="Orders">
        Orders placed through the site’s checkout. This demo store takes no payment and keeps orders in this browser; connect a backend and payment provider before launch.
      </PageHeader>

      {orders === null ? (
        <p className="text-sm text-charcoal/60">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-paper p-10 text-center text-sm text-charcoal/60">No orders yet.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-paper">
          {orders.map((o) => (
            <div key={o.id} className="border-b border-ink/8 last:border-0">
              <button type="button" onClick={() => setOpen(open === o.id ? null : o.id)} className="grid w-full grid-cols-[1fr_auto] items-center gap-3 p-4 text-left hover:bg-fog/60 sm:grid-cols-[1.2fr_1fr_auto_auto]" aria-expanded={open === o.id}>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {o.customer.firstName} {o.customer.lastName}
                  </span>
                  <span className="text-xs text-charcoal/50">
                    {o.id} · {new Date(o.createdAt).toLocaleString()}
                  </span>
                </span>
                <span className="hidden text-xs text-charcoal/60 sm:block">
                  {o.lines.reduce((n, l) => n + l.qty, 0)} items · {o.shipping.label} · {o.payment.method === 'card' ? `${o.payment.brand ?? 'Card'} ${o.payment.last4}` : 'Cash on delivery'}
                </span>
                <Badge tone={o.status === 'new' ? 'accent' : o.status === 'delivered' ? 'ok' : o.status === 'cancelled' ? 'warn' : 'neutral'}>{o.status}</Badge>
                <span className="hidden font-semibold tabular-nums sm:block">{formatPrice(o.totals.total)}</span>
              </button>
              <AnimatePresence initial={false}>
                {open === o.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="overflow-hidden">
                    <div className="grid gap-6 bg-fog/50 p-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold">Customer</p>
                        <p className="mt-1 text-sm">{o.customer.email}</p>
                        <p className="text-sm">{o.customer.phone}</p>
                        <p className="mt-3 text-xs font-semibold">Ship to</p>
                        <p className="mt-1 text-sm">
                          {o.address.line1}
                          {o.address.line2 && `, ${o.address.line2}`}
                          <br />
                          {o.address.city} {o.address.postcode}, {o.address.country}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold">Items</p>
                        <ul className="mt-1 space-y-1 text-sm">
                          {o.lines.map((l, i) => (
                            <li key={i} className="flex justify-between gap-2">
                              <span>
                                {l.qty}× {l.name} <span className="text-charcoal/50">({l.color}, {l.size})</span>
                              </span>
                              <span className="tabular-nums">{formatPrice(l.price * l.qty)}</span>
                            </li>
                          ))}
                        </ul>
                        <dl className="mt-3 space-y-0.5 border-t border-ink/10 pt-2 text-xs text-charcoal/70">
                          {o.totals.discount > 0 && <div className="flex justify-between"><dt>Discount ({o.promo})</dt><dd>−{formatPrice(o.totals.discount)}</dd></div>}
                          <div className="flex justify-between"><dt>Shipping</dt><dd>{o.totals.shipping ? formatPrice(o.totals.shipping) : 'Free'}</dd></div>
                          <div className="flex justify-between"><dt>VAT</dt><dd>{formatPrice(o.totals.tax)}</dd></div>
                          <div className="flex justify-between font-semibold text-ink"><dt>Total</dt><dd>{formatPrice(o.totals.total)}</dd></div>
                        </dl>
                      </div>
                      <div>
                        <p className="text-xs font-semibold">Status</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {STATUSES.map((s) => (
                            <button key={s} type="button" onClick={() => setStatus(o.id, s)} className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${o.status === s ? 'bg-ink text-paper' : 'bg-paper hover:bg-ink/5'}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
