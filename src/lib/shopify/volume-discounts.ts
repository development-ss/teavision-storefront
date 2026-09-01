import type { Money } from '@/lib/shopify/types'

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
