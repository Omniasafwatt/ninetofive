import type { Product } from '../data/products'
import { formatPrice } from '../data/products'
import { instagramDM, SITE } from '../data/site'

/** The ready-to-paste order message for a piece. */
export function orderMessage(p: Product, color?: string, size?: string) {
  const lines = [
    `Hi ${SITE.name}! I'd like to order:`,
    `• ${p.name} (#${p.number}) — ${formatPrice(p.price)}`,
    color ? `• Colour: ${color}` : null,
    size ? `• Size: ${size}` : null,
    `${window.location.origin}/product/${p.slug}`,
  ]
  return lines.filter(Boolean).join('\n')
}

/**
 * Opens a DM with the shop on Instagram and copies the message so the customer only has to paste it.
 * Instagram links can't pre-fill text, hence the clipboard. Must run inside a click handler.
 */
export async function openInstagramDM(message?: string) {
  window.open(instagramDM(), '_blank', 'noopener')
  if (!message) return false
  try {
    await navigator.clipboard.writeText(message)
    return true
  } catch {
    return false
  }
}
