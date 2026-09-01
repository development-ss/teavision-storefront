import { cacheLife, cacheTag } from 'next/cache'

import { logEvent } from '@/lib/observability/logger'
import { getShopifyStoreDomain } from '@/lib/shopify/env'
import type { VolumeDiscountTier } from '@/lib/shopify/types'

const HULK_VOLUME_DISCOUNT_ENDPOINT =
  'https://volumediscount.hulkapps.com/api/v2/shop/get_offer_table'
const HULK_PERCENT_DISCOUNT_TYPE = '% Off'

export type HulkVolumeDiscountProductContext = {
  productId: string
  variantIds: string[]
  collectionIds: string[]
  tags: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getNumericShopifyId(gid: string): string | null {
  const value = gid.split('/').at(-1)
  return value && /^\d+$/.test(value) ? value : null
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number.parseFloat(value)
  return Number.NaN
}

function parseHulkOfferLevel(level: unknown): VolumeDiscountTier | null {
  if (!Array.isArray(level) || level.length < 3) return null

  const minimumQuantity = Math.floor(parseNumber(level[0]))
  const discountPercent = parseNumber(level[1])
  const discountType = level[2]

  if (
    typeof discountType !== 'string' ||
    discountType.trim() !== HULK_PERCENT_DISCOUNT_TYPE ||
    !Number.isFinite(minimumQuantity) ||
    !Number.isFinite(discountPercent) ||
    minimumQuantity < 1 ||
    discountPercent <= 0 ||
    discountPercent > 100
  ) {
    return null
  }

  return { minimumQuantity, discountPercent }
}

function parseOfferLevels(value: unknown): VolumeDiscountTier[] {
  let levels: unknown = value

  if (typeof value === 'string') {
    try {
      levels = JSON.parse(value) as unknown
    } catch {
      return []
    }
  }

  if (!Array.isArray(levels)) return []

  const tiersByQuantity = new Map<number, VolumeDiscountTier>()
  for (const level of levels) {
    const tier = parseHulkOfferLevel(level)
    if (tier) tiersByQuantity.set(tier.minimumQuantity, tier)
  }

  return [...tiersByQuantity.values()].sort(
    (a, b) => a.minimumQuantity - b.minimumQuantity,
  )
}

export function parseHulkVolumeDiscountTiers(
  value: unknown,
): VolumeDiscountTier[] {
  if (!isRecord(value) || value.charges_applied !== true) return []

  const offer = value.eligible_offer
  if (!isRecord(offer) || offer.main_offer_type !== 'volume') return []

  const legacyTiers = parseOfferLevels(offer.offer_levels)
  return legacyTiers.length > 0
    ? legacyTiers
    : parseOfferLevels(offer.fix_quantity_level)
}

export async function getHulkVolumeDiscountTiers(
  product: HulkVolumeDiscountProductContext,
): Promise<VolumeDiscountTier[]> {
  'use cache'

  const storeDomain = getShopifyStoreDomain()
  const productId = getNumericShopifyId(product.productId)
  const variantIds = product.variantIds
    .map(getNumericShopifyId)
    .filter((id): id is string => id !== null)

  if (!storeDomain || !productId || variantIds.length === 0) return []

  cacheTag('volume-discounts', `volume-discounts-${productId}`)
  cacheLife({ stale: 30, revalidate: 60, expire: 600 })

  const collectionIds = product.collectionIds
    .map(getNumericShopifyId)
    .filter((id): id is string => id !== null)
  const params = new URLSearchParams({
    pid: productId,
    store_id: storeDomain,
    ctags: '',
    product_variants: variantIds.join(','),
    product_collections: collectionIds.join(','),
    product_tags: product.tags.join(', '),
  })

  try {
    const response = await fetch(HULK_VOLUME_DISCOUNT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
      signal: AbortSignal.timeout(5_000),
    })

    if (!response.ok) {
      logEvent('warn', 'hulkapps_failed', {
        operation: 'get_offer_table',
        status: response.status,
      })
      return []
    }

    const data: unknown = await response.json()
    return parseHulkVolumeDiscountTiers(data)
  } catch (error) {
    logEvent('warn', 'hulkapps_failed', {
      operation: 'get_offer_table',
      error,
    })
    return []
  }
}
