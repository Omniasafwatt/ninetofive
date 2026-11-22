import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useBag } from '../context/BagContext'
import { useContent } from '../context/ContentContext'
import { useLenis } from '../context/SmoothScroll'
import { formatPrice } from '../data/products'
import { useClock } from '../hooks/useClock'
import { useRouteAccent } from '../hooks/useRouteAccent'
import { EASE } from '../lib/gsap'
import { newOrderId, saveOrder, type Order } from '../lib/orders'
import { FREE_SHIPPING_OVER, PROMOS, SHIPPING, totals, type Line, type ShippingId } from '../lib/pricing'
import { Choice, Field } from '../components/checkout/Field'
import { Img } from '../components/ui/Img'
import { MagneticButton } from '../components/ui/Magnetic'
import { SplitText } from '../components/ui/SplitText'

const COUNTRIES = ['Egypt', 'United Arab Emirates', 'Saudi Arabia', 'Portugal', 'United Kingdom', 'France', 'Germany', 'United States']
const STEPS = ['Details', 'Delivery', 'Payment'] as const

type Details = { email: string; firstName: string; lastName: string; phone: string; line1: string; line2: string; city: string; postcode: string; country: string }
type Payment = { method: 'card' | 'cod'; number: string; expiry: string; cvc: string; name: string }
type Errors = Partial<Record<string, string>>

const EMPTY_DETAILS: Details = { email: '', firstName: '', lastName: '', phone: '', line1: '', line2: '', city: '', postcode: '', country: 'Egypt' }

export default function Checkout() {
  useRouteAccent()
  const lenis = useLenis()
  const { items, setQty, remove, clear } = useBag()
  const { getProduct } = useContent()
  const lines = useMemo(
    () => items.flatMap((it, index) => {
      const product = getProduct(it.slug)
      return product ? [{ ...it, index, product } as Line] : []
    }),
    [items, getProduct],
  )

  const [step, setStep] = useState(0)
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS)
  const [shipping, setShipping] = useState<ShippingId>('standard')
  const [payment, setPayment] = useState<Payment>({ method: 'card', number: '', expiry: '', cvc: '', name: '' })
  const [promo, setPromo] = useState<string>()
  const [errors, setErrors] = useState<Errors>({})
  const [placing, setPlacing] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)

  const sums = totals(lines, shipping, promo)
  const toTop = () => lenis?.scrollTo(0, { duration: 1.2 })

  const next = (e?: FormEvent) => {
    e?.preventDefault()
    const errs = step === 0 ? validateDetails(details) : step === 2 ? validatePayment(payment) : {}
    setErrors(errs)
    if (Object.keys(errs).length) return
    if (step < 2) {
      setStep(step + 1)
      toTop()
    } else {
      place()
    }
  }

  const place = async () => {
    setPlacing(true)
    const method = SHIPPING.find((s) => s.id === shipping) ?? SHIPPING[0]
    const digits = payment.number.replace(/\D/g, '')
    const o: Order = {
      id: newOrderId(),
      createdAt: new Date().toISOString(),
      status: 'new',
      customer: { email: details.email, firstName: details.firstName, lastName: details.lastName, phone: details.phone },
      address: { line1: details.line1, line2: details.line2, city: details.city, postcode: details.postcode, country: details.country },
      shipping: { id: method.id, label: method.label, cost: sums.shipping },
      payment: payment.method === 'card' ? { method: 'card', brand: cardBrand(digits), last4: digits.slice(-4) } : { method: 'cod' },
      lines: lines.map((l) => ({ slug: l.slug, name: l.product.name, color: l.color, size: l.size, qty: l.qty, price: l.product.price })),
      promo,
      totals: sums,
    }
    await new Promise((r) => setTimeout(r, 1600))
    await saveOrder(o)
    setOrder(o)
    clear()
    setPlacing(false)
    lenis?.scrollTo(0, { immediate: true })
  }

  if (order) return <Confirmation order={order} />
  if (lines.length === 0) return <EmptyBag />

  return (
    <section className="min-h-screen bg-paper pt-28 pb-32 md:pt-36">
      <div className="gutter">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h1 className="display text-[clamp(3.6rem,10vw,10rem)] leading-[0.85]">
            <SplitText text="Checkout." play="mount" delay={0.45} italicWords={['Checkout.']} />
          </h1>
          <Stepper step={step} onJump={(i) => i < step && setStep(i)} />
        </div>

        <div className="mt-12 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
          {/* Mobile summary */}
          <MobileSummary lines={lines} sums={sums} promo={promo} setPromo={setPromo} />

          <form onSubmit={next} className="lg:col-span-7" noValidate>
            <Panel index={0} step={step} title="Your details" summary={`${details.firstName} ${details.lastName} · ${details.email} · ${details.line1}, ${details.city}`} onEdit={() => setStep(0)}>
              <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2">
                <Field className="sm:col-span-2" label="Email" type="email" autoComplete="email" value={details.email} onChange={(v) => setDetails({ ...details, email: v })} error={errors.email} hint="For your receipt and delivery updates" />
                <Field label="First name" autoComplete="given-name" value={details.firstName} onChange={(v) => setDetails({ ...details, firstName: v })} error={errors.firstName} />
                <Field label="Last name" autoComplete="family-name" value={details.lastName} onChange={(v) => setDetails({ ...details, lastName: v })} error={errors.lastName} />
                <Field className="sm:col-span-2" label="Address" autoComplete="address-line1" value={details.line1} onChange={(v) => setDetails({ ...details, line1: v })} error={errors.line1} />
                <Field className="sm:col-span-2" label="Apartment, floor (optional)" autoComplete="address-line2" value={details.line2} onChange={(v) => setDetails({ ...details, line2: v })} />
                <Field label="City" autoComplete="address-level2" value={details.city} onChange={(v) => setDetails({ ...details, city: v })} error={errors.city} />
                <Field label="Postcode" autoComplete="postal-code" value={details.postcode} onChange={(v) => setDetails({ ...details, postcode: v })} error={errors.postcode} />
                <label className="relative pt-5">
                  <span className="eyebrow absolute top-0 left-0 text-[0.58rem] text-charcoal/55">Country</span>
                  <select
                    value={details.country}
                    onChange={(e) => setDetails({ ...details, country: e.target.value })}
                    autoComplete="country-name"
                    className="w-full appearance-none border-b border-ink/15 bg-transparent py-2 text-[0.95rem] outline-none focus:border-accent"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-0 bottom-3 text-xs">↓</span>
                </label>
                <Field label="Phone" type="tel" autoComplete="tel" value={details.phone} onChange={(v) => setDetails({ ...details, phone: v })} error={errors.phone} hint="Only for the courier" />
              </div>
            </Panel>

            <Panel index={1} step={step} title="Delivery" summary={`${SHIPPING.find((s) => s.id === shipping)?.label} · ${sums.shipping ? formatPrice(sums.shipping) : 'Free'}`} onEdit={() => setStep(1)}>
              <div className="grid gap-3" role="radiogroup" aria-label="Delivery method">
                {SHIPPING.map((s) => {
                  const cost = s.id === 'standard' && sums.subtotal - sums.discount >= FREE_SHIPPING_OVER ? 0 : s.price
                  return (
                    <Choice
                      key={s.id}
                      checked={shipping === s.id}
                      onSelect={() => setShipping(s.id)}
                      title={s.label}
                      meta={s.eta}
                      aside={<span className="display text-2xl tabular-nums">{cost ? formatPrice(cost) : 'Free'}</span>}
                    />
                  )
                })}
              </div>
              <p className="mt-6 text-xs text-charcoal/60">Every order ships in recycled paper with a woven 9TO5 label stamped with the hour it was packed.</p>
            </Panel>

            <Panel index={2} step={step} title="Payment" onEdit={() => setStep(2)}>
              <div className="grid gap-3" role="radiogroup" aria-label="Payment method">
                <Choice checked={payment.method === 'card'} onSelect={() => setPayment({ ...payment, method: 'card' })} title="Card" meta="Visa, Mastercard, American Express" aside={<CardBrands active={cardBrand(payment.number)} />} />
                <Choice checked={payment.method === 'cod'} onSelect={() => setPayment({ ...payment, method: 'cod' })} title="Cash on delivery" meta="Pay the courier when your order arrives" />
              </div>
              <AnimatePresence initial={false}>
                {payment.method === 'card' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-x-6 gap-y-9 pt-8 sm:grid-cols-2">
                      <Field
                        className="sm:col-span-2"
                        label="Card number"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        value={payment.number}
                        onChange={(v) => setPayment({ ...payment, number: formatCard(v) })}
                        error={errors.number}
                        trailing={<span className="eyebrow text-[0.58rem] text-charcoal/50">{cardBrand(payment.number) ?? ''}</span>}
                      />
                      <Field label="Expiry (MM/YY)" inputMode="numeric" autoComplete="cc-exp" value={payment.expiry} onChange={(v) => setPayment({ ...payment, expiry: formatExpiry(v) })} error={errors.expiry} />
                      <Field label="Security code" inputMode="numeric" autoComplete="cc-csc" value={payment.cvc} onChange={(v) => setPayment({ ...payment, cvc: v.replace(/\D/g, '').slice(0, 4) })} error={errors.cvc} />
                      <Field className="sm:col-span-2" label="Name on card" autoComplete="cc-name" value={payment.name} onChange={(v) => setPayment({ ...payment, name: v })} error={errors.name} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="mt-8 flex items-start gap-3 rounded-2xl bg-fog px-5 py-4 text-xs leading-relaxed text-charcoal/75">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />
                Demo storefront — no payment is taken and card numbers are never stored (only the last four digits are kept on the order). Connect a
                payment provider such as Stripe or Paymob before launch.
              </p>
            </Panel>

            <div className="mt-10 flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center">
              {step > 0 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="eyebrow link-underline text-charcoal/70">
                  ← Back
                </button>
              ) : (
                <Link to="/shop" className="eyebrow link-underline text-charcoal/70">
                  ← Continue shopping
                </Link>
              )}
              <MagneticButton type="submit" variant={step === 2 ? 'accent' : 'dark'} size="lg" disabled={placing}>
                {placing ? 'Placing order…' : step === 2 ? `Place order — ${formatPrice(sums.total)}` : `Continue to ${STEPS[step + 1].toLowerCase()}`}
              </MagneticButton>
            </div>
          </form>

          <aside className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28">
              <Summary lines={lines} sums={sums} setQty={setQty} remove={remove} promo={promo} setPromo={setPromo} />
            </div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {placing && (
          <motion.div
            className="fixed inset-0 z-[180] flex flex-col items-center justify-center bg-ink/85 text-paper backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="display text-5xl italic">Wrapping it up…</p>
            <div className="mt-6 h-[2px] w-56 overflow-hidden bg-paper/15">
              <motion.div className="h-full bg-accent" initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/* ——— Steps ——— */

function Stepper({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-3 sm:gap-5" aria-label="Checkout progress">
      {STEPS.map((s, i) => (
        <li key={s} className="flex items-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={() => onJump(i)}
            disabled={i >= step}
            className={`eyebrow flex items-center gap-2 text-[0.62rem] transition-colors duration-500 disabled:cursor-default ${i <= step ? 'text-ink' : 'text-charcoal/40'}`}
            aria-current={i === step ? 'step' : undefined}
          >
            <span className={`grid size-6 place-items-center rounded-full text-[0.55rem] tracking-normal transition-colors duration-500 ${i < step ? 'bg-accent text-accent-ink' : i === step ? 'bg-ink text-paper' : 'border border-ink/20'}`}>
              {i < step ? '✓' : `0${i + 1}`}
            </span>
            <span className="hidden sm:inline">{s}</span>
          </button>
          {i < STEPS.length - 1 && (
            <span className="relative h-px w-8 bg-ink/15 sm:w-14">
              <motion.span className="absolute inset-0 origin-left bg-accent" animate={{ scaleX: i < step ? 1 : 0 }} transition={{ duration: 0.8, ease: EASE }} />
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}

function Panel({ index, step, title, summary, onEdit, children }: { index: number; step: number; title: string; summary?: string; onEdit: () => void; children: ReactNode }) {
  const active = index === step
  const done = index < step
  return (
    <div className="border-t border-ink/10 py-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className={`display flex items-baseline gap-4 text-[clamp(2rem,3.4vw,3rem)] leading-none transition-opacity duration-500 ${active || done ? '' : 'opacity-30'}`}>
          <span className="eyebrow text-[0.6rem] text-charcoal/50">0{index + 1}</span>
          {title}
        </h2>
        {done && (
          <button type="button" onClick={onEdit} className="eyebrow link-underline text-[0.6rem] text-charcoal/60">
            Edit
          </button>
        )}
      </div>
      <AnimatePresence initial={false} mode="wait">
        {active ? (
          <motion.div
            key="open"
            initial={{ height: 0, opacity: 0, filter: 'blur(6px)' }}
            animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-8 pb-4">{children}</div>
          </motion.div>
        ) : done && summary ? (
          <motion.p key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 truncate pl-9 text-sm text-charcoal/60">
            {summary}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

/* ——— Summary ——— */

type Sums = ReturnType<typeof totals>

function Summary({
  lines,
  sums,
  setQty,
  remove,
  promo,
  setPromo,
}: {
  lines: Line[]
  sums: Sums
  setQty: (i: number, q: number) => void
  remove: (i: number) => void
  promo?: string
  setPromo: (p?: string) => void
}) {
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string>()
  const toFree = FREE_SHIPPING_OVER - (sums.subtotal - sums.discount)

  const apply = () => {
    const c = code.trim().toUpperCase()
    if (PROMOS[c]) {
      setPromo(c)
      setCodeError(undefined)
      setCode('')
    } else setCodeError('That code isn’t valid.')
  }

  return (
    <div className="rounded-[28px] bg-fog p-6 sm:p-8">
      <div className="flex items-baseline justify-between">
        <h2 className="display text-3xl">Your order</h2>
        <span className="eyebrow text-[0.6rem] text-charcoal/60">{lines.reduce((n, l) => n + l.qty, 0)} items</span>
      </div>

      <ul className="mt-6 divide-y divide-ink/10">
        <AnimatePresence initial={false}>
          {lines.map((l) => (
            <motion.li
              key={`${l.slug}-${l.color}-${l.size}`}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="flex gap-4 py-4"
            >
              <Link to={`/product/${l.slug}`} className="w-20 shrink-0">
                <Img image={l.product.images[0]} alt={l.product.name} className="aspect-[3/4] rounded-lg" sizes="80px" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <p className="display text-xl leading-none">{l.product.name}</p>
                  <p className="text-sm tabular-nums">{formatPrice(l.product.price * l.qty)}</p>
                </div>
                <p className="eyebrow mt-1.5 text-[0.56rem] text-charcoal/60">
                  {l.color} · {l.size}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-ink/15">
                    <button type="button" onClick={() => setQty(l.index, l.qty - 1)} className="grid size-7 place-items-center text-sm" aria-label="Decrease quantity">
                      −
                    </button>
                    <span className="w-5 text-center text-xs tabular-nums">{l.qty}</span>
                    <button type="button" onClick={() => setQty(l.index, l.qty + 1)} className="grid size-7 place-items-center text-sm" aria-label="Increase quantity">
                      +
                    </button>
                  </div>
                  <button type="button" onClick={() => remove(l.index)} className="eyebrow link-underline text-[0.56rem] text-charcoal/60">
                    Remove
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Free-shipping meter */}
      <div className="mt-4 rounded-2xl bg-paper px-4 py-3">
        <p className="text-xs text-charcoal/70">
          {toFree > 0 ? (
            <>
              You’re <strong className="text-ink">{formatPrice(toFree)}</strong> away from free standard shipping.
            </>
          ) : (
            <>Free standard shipping unlocked.</>
          )}
        </p>
        <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-ink/10">
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${Math.min(100, ((sums.subtotal - sums.discount) / FREE_SHIPPING_OVER) * 100)}%` }}
            transition={{ duration: 0.9, ease: EASE }}
          />
        </div>
      </div>

      {/* Promo */}
      <div className="mt-6">
        {promo ? (
          <div className="flex items-center justify-between rounded-full border border-accent/40 px-4 py-2.5 text-xs">
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-accent" /> {PROMOS[promo]?.label}
            </span>
            <button type="button" onClick={() => setPromo(undefined)} className="eyebrow link-underline text-[0.56rem]">
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <Field
              className="flex-1"
              label="Promo code"
              value={code}
              onChange={(v) => {
                setCode(v)
                setCodeError(undefined)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  apply()
                }
              }}
              error={codeError}
              hint={!codeError ? 'Try EVERYHOUR' : undefined}
            />
            <button type="button" onClick={apply} disabled={!code.trim()} className="eyebrow rounded-full border border-ink/20 px-4 py-2.5 text-[0.58rem] transition-colors hover:bg-ink hover:text-paper disabled:opacity-40">
              Apply
            </button>
          </div>
        )}
      </div>

      <dl className="mt-10 space-y-2.5 text-sm">
        <Row label="Subtotal" value={sums.subtotal} />
        {sums.discount > 0 && <Row label="Discount" value={-sums.discount} accent />}
        <Row label="Shipping" value={sums.shipping} free={sums.shipping === 0} />
        <Row label="VAT (14%)" value={sums.tax} />
        <div className="flex items-baseline justify-between border-t border-ink/10 pt-4">
          <dt className="eyebrow">Total</dt>
          <dd className="display text-4xl tabular-nums">
            <AnimatedMoney value={sums.total} />
          </dd>
        </div>
      </dl>
    </div>
  )
}

function Row({ label, value, accent, free }: { label: string; value: number; accent?: boolean; free?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-charcoal/65">{label}</dt>
      <dd className={`tabular-nums ${accent ? 'text-accent' : ''}`}>{free ? 'Free' : <AnimatedMoney value={value} />}</dd>
    </div>
  )
}

/** Totals roll to their new value instead of snapping. */
function AnimatedMoney({ value }: { value: number }) {
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => (v < 0 ? `−${formatPrice(Math.abs(Math.round(v)))}` : formatPrice(Math.round(v))))
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.8, ease: EASE })
    return () => controls.stop()
  }, [mv, value])
  return <motion.span>{text}</motion.span>
}

function MobileSummary({ lines, sums, promo, setPromo }: { lines: Line[]; sums: Sums; promo?: string; setPromo: (p?: string) => void }) {
  const [open, setOpen] = useState(false)
  const { setQty, remove } = useBag()
  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between rounded-full border border-ink/15 px-5 py-4" aria-expanded={open}>
        <span className="eyebrow text-[0.6rem]">{open ? 'Hide' : 'Show'} order summary</span>
        <span className="display text-2xl tabular-nums">{formatPrice(sums.total)}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.6, ease: EASE }} className="overflow-hidden">
            <div className="pt-4">
              <Summary lines={lines} sums={sums} setQty={setQty} remove={remove} promo={promo} setPromo={setPromo} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CardBrands({ active }: { active?: string }) {
  return (
    <span className="hidden gap-1.5 sm:flex">
      {['Visa', 'Mastercard', 'Amex'].map((b) => (
        <span key={b} className={`eyebrow rounded border px-1.5 py-0.5 text-[0.5rem] transition-colors duration-500 ${active === b ? 'border-accent text-accent' : 'border-ink/15 text-charcoal/50'}`}>
          {b}
        </span>
      ))}
    </span>
  )
}

/* ——— Empty & confirmation ——— */

function EmptyBag() {
  return (
    <section className="gutter flex min-h-screen flex-col justify-center bg-paper pt-24">
      <p className="eyebrow mb-6 flex items-center gap-3 text-charcoal/60">
        <span className="size-2 rounded-full bg-accent" /> Checkout
      </p>
      <h1 className="display text-[clamp(3.6rem,11vw,11rem)] leading-[0.85]">
        <SplitText text="Nothing here" play="mount" delay={0.45} className="block" />
        <SplitText text="yet." play="mount" delay={0.6} className="block" italicWords={['yet.']} />
      </h1>
      <p className="mt-8 max-w-sm text-charcoal/65">Your bag is empty. Every hour deserves something — start with the piece you’d wear the most.</p>
      <div className="mt-10">
        <MagneticButton to="/shop" variant="accent">
          Shop the pieces
        </MagneticButton>
      </div>
    </section>
  )
}

function Confirmation({ order }: { order: Order }) {
  const { hh, mm, label } = useClock()
  const eta = new Date(order.createdAt)
  const days = order.shipping.id === 'standard' ? [3, 5] : order.shipping.id === 'express' ? [1, 2] : [0, 0]
  const fmt = (d: number) => new Date(eta.getTime() + d * 86400000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <section className="min-h-screen bg-paper pt-32 pb-24 text-ink md:pt-40">
      <div className="gutter">
        <motion.p className="eyebrow flex items-center gap-3 text-charcoal/65" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <span className="pulse-dot size-2 rounded-full bg-accent" /> Order {order.id} — placed at {hh}:{mm}, {label.toLowerCase()}
        </motion.p>
        <h1 className="display mt-8 text-[clamp(3.6rem,11vw,12rem)] leading-[0.85]">
          <SplitText text="Thank you," play="mount" delay={0.4} className="block" />
          <SplitText text={`${order.customer.firstName}.`} play="mount" delay={0.6} className="block" italicWords={[`${order.customer.firstName}.`]} />
        </h1>
        <motion.div className="mt-10 h-[2px] w-full origin-left bg-accent" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.6, ease: EASE, delay: 0.8 }} />

        <motion.div
          className="mt-12 grid gap-12 md:grid-cols-3"
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.12, delayChildren: 1 }}
        >
          {[
            {
              t: 'Arriving',
              b: days[1] === 0 ? 'Today, by courier' : `${fmt(days[0])} — ${fmt(days[1])}`,
              s: `${order.shipping.label} to ${order.address.city}, ${order.address.country}`,
            },
            { t: 'Confirmation sent to', b: order.customer.email, s: 'We’ll email tracking as soon as it ships.' },
            {
              t: order.payment.method === 'card' ? 'Paid with' : 'Payment',
              b: order.payment.method === 'card' ? `${order.payment.brand ?? 'Card'} •••• ${order.payment.last4}` : 'Cash on delivery',
              s: `Total ${formatPrice(order.totals.total)}`,
            },
          ].map((c) => (
            <motion.div key={c.t} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } } }}>
              <p className="eyebrow text-[0.6rem] text-charcoal/55">{c.t}</p>
              <p className="display mt-3 text-3xl">{c.b}</p>
              <p className="mt-2 text-sm text-charcoal/65">{c.s}</p>
            </motion.div>
          ))}
        </motion.div>

        <ul className="mt-16 divide-y divide-ink/10 border-y border-ink/10">
          {order.lines.map((l) => (
            <li key={`${l.slug}-${l.color}-${l.size}`} className="flex items-center justify-between gap-4 py-4 text-sm">
              <span className="display text-2xl">{l.name}</span>
              <span className="eyebrow text-[0.58rem] text-charcoal/55">
                {l.color} · {l.size} · ×{l.qty}
              </span>
              <span className="tabular-nums">{formatPrice(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          <MagneticButton to="/shop" variant="accent">
            Continue shopping
          </MagneticButton>
          <MagneticButton to="/lookbook" variant="outline-dark">
            Read the lookbook
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}

/* ——— Validation & card helpers ——— */

function validateDetails(d: Details): Errors {
  const e: Errors = {}
  if (!/^\S+@\S+\.\S+$/.test(d.email)) e.email = 'Enter a valid email address'
  if (!d.firstName.trim()) e.firstName = 'Required'
  if (!d.lastName.trim()) e.lastName = 'Required'
  if (d.line1.trim().length < 4) e.line1 = 'Enter your street address'
  if (!d.city.trim()) e.city = 'Required'
  if (!d.postcode.trim()) e.postcode = 'Required'
  if (d.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a phone number'
  return e
}

function validatePayment(p: Payment): Errors {
  if (p.method === 'cod') return {}
  const e: Errors = {}
  const digits = p.number.replace(/\D/g, '')
  if (digits.length < 13 || !luhn(digits)) e.number = 'Check the card number'
  const [m, y] = p.expiry.split('/').map(Number)
  const now = new Date()
  const expired = !m || !y || m > 12 || new Date(2000 + y, m) <= new Date(now.getFullYear(), now.getMonth())
  if (expired) e.expiry = 'Invalid or expired'
  if (p.cvc.length < 3) e.cvc = '3–4 digits'
  if (!p.name.trim()) e.name = 'Required'
  return e
}

function luhn(num: string) {
  let sum = 0
  for (let i = 0; i < num.length; i++) {
    let d = Number(num[num.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  }
  return sum % 10 === 0
}

function cardBrand(value: string) {
  const n = value.replace(/\D/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'Amex'
  return undefined
}

function formatCard(v: string) {
  const n = v.replace(/\D/g, '').slice(0, 19)
  return n.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(v: string) {
  const n = v.replace(/\D/g, '').slice(0, 4)
  return n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n
}
