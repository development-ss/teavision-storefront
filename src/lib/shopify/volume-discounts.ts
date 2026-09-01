import type { Money, VolumeDiscountTier } from '@/lib/shopify/types'

/**
 * Storefront projection of the active Hulk Shopify Function offer.
 *
 * Shopify remains authoritative after an item is added: cart and checkout
 * prices are rendered from Storefront API costs and discount allocations.
 * Keep these display tiers in sync with the active Hulk offer in Shopify.
 */
export const HULK_VOLUME_DISCOUNT_TIERS = [
  { minimumQuantity: 5, discountPercent: 5 },
  { minimumQuantity: 10, discountPercent: 10 },
  { minimumQuantity: 20, discountPercent: 12 },
  { minimumQuantity: 40, discountPercent: 15 },
] as const satisfies readonly VolumeDiscountTier[]

/**
 * Mirrors the verified Hulk Function calculation: discount each unit by a
 * whole-cent amount, rounding the discount down before calculating the line.
 */
export function getHulkDiscountedUnitPrice(
  basePrice: Money,
  discountPercent: number,
): Money {
  const parsedAmount = Number.parseFloat(basePrice.amount)
  const baseCents = Number.isFinite(parsedAmount)
    ? Math.max(0, Math.round(parsedAmount * 100))
    : 0
  const boundedPercent = Math.min(100, Math.max(0, discountPercent))
  const discountBasisPoints = Math.round(boundedPercent * 100)
  const discountCents = Math.floor((baseCents * discountBasisPoints) / 10_000)

  return {
    amount: ((baseCents - discountCents) / 100).toFixed(2),
    currencyCode: basePrice.currencyCode,
  }
}
