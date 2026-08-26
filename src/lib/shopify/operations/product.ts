import { cacheLife, cacheTag } from 'next/cache'

import { shopifyFetch } from '@/lib/shopify/client'
import { getShopifyStoreDomain } from '@/lib/shopify/env'
import {
  GetProductDocument,
  GetProductRecommendationsDocument,
  GetProductsDocument,
  GetProductVariantsDocument,
  ProductRecommendationIntent,
  type GetProductQuery,
  type GetProductVariantsQuery,
  type BulkPricingTier,
  type Product,
  type ProductOption,
  type ProductSummary,
} from '@/lib/shopify/types'

import {
  parseProductRating,
  reshapeImage,
  reshapeMoney,
  type MoneyLike,
  type ShopifyImageLike,
} from './mappers'

const SHOPIFY_PAGE_SIZE = 250
export const PRODUCT_DETAIL_CACHE_VERSION = 'shopify-native-pricing-v3'

type ShopifyProductNode = NonNullable<GetProductQuery['product']>

type ShopifyVariantNode = NonNullable<
  GetProductVariantsQuery['product']
>['variants']['edges'][number]['node']

type LegacyVariantInventory = {
  quantityAvailable: number
}

type ShopifyProductSummaryNode = {
  id: string
  handle: string
  title: string
  updatedAt?: string
  featuredImage?: ShopifyImageLike | null
  priceRange: { minVariantPrice: MoneyLike }
  ratingMetafield?: { value: string } | null
  ratingCountMetafield?: { value: string } | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getNumericShopifyId(gid: string): string | null {
  const parts = gid.split('/')
  const value = parts[parts.length - 1]

  return value && /^\d+$/.test(value) ? value : null
}

function parseLegacyVariantInventory(
  value: unknown,
): [string, LegacyVariantInventory] | null {
  if (!isRecord(value)) return null

  const variantId =
    typeof value.id === 'number'
      ? String(value.id)
      : typeof value.id === 'string'
        ? value.id
        : null
  const inventoryQuantity =
    typeof value.inventory_quantity === 'number'
      ? value.inventory_quantity
      : typeof value.inventory_quantity === 'string'
        ? Number.parseInt(value.inventory_quantity, 10)
        : NaN

  if (
    !variantId ||
    value.inventory_management !== 'shopify' ||
    value.inventory_policy === 'continue' ||
    !Number.isFinite(inventoryQuantity)
  ) {
    return null
  }

  return [
    variantId,
    {
      quantityAvailable: Math.max(0, Math.floor(inventoryQuantity)),
    },
  ]
}

function parseLegacyProductInventory(
  value: unknown,
): Map<string, LegacyVariantInventory> {
  if (!isRecord(value) || !Array.isArray(value.variants)) return new Map()

  return new Map(
    value.variants
      .map(parseLegacyVariantInventory)
      .filter(
        (entry): entry is [string, LegacyVariantInventory] => entry !== null,
      ),
  )
}

function reshapeQuantityPriceBreaks(
  variant: ShopifyVariantNode,
): BulkPricingTier[] {
  return variant.quantityPriceBreaks.nodes
    .map((priceBreak) => ({
      minimumQuantity: priceBreak.minimumQuantity,
      price: reshapeMoney(priceBreak.price),
    }))
    .sort((a, b) => a.minimumQuantity - b.minimumQuantity)
}

function reshapeVariant(
  variant: ShopifyVariantNode,
  legacyInventoryByVariantId: Map<string, LegacyVariantInventory>,
): Product['variants'][number] {
  const variantId = getNumericShopifyId(variant.id)
  const legacyInventory = variantId
    ? legacyInventoryByVariantId.get(variantId)
    : undefined

  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    currentlyNotInStock: variant.currentlyNotInStock,
    quantityAvailable: legacyInventory?.quantityAvailable ?? null,
    quantityRule: {
      minimum: variant.quantityRule.minimum,
      maximum: variant.quantityRule.maximum ?? null,
      increment: variant.quantityRule.increment,
    },
    price: reshapeMoney(variant.price),
    quantityPriceBreaks: reshapeQuantityPriceBreaks(variant),
    image: variant.image ? reshapeImage(variant.image) : null,
  }
}

function reshapeProduct(
  p: ShopifyProductNode,
  variants: ShopifyVariantNode[],
  legacyInventoryByVariantId: Map<string, LegacyVariantInventory>,
): Product {
  // SPR rating metafield stores a JSON object: { "value": "4.8", "scale_min": "1.0", "scale_max": "5.0" }
  let rating: number | undefined
  let reviewCount: number | undefined
  if (p.ratingMetafield?.value) {
    try {
      const parsed = JSON.parse(p.ratingMetafield.value) as { value?: unknown }
      const n = parseFloat(typeof parsed.value === 'string' ? parsed.value : '')
      if (!isNaN(n)) rating = n
    } catch {
      // metafield not present or malformed — leave undefined
    }
  }
  if (p.ratingCountMetafield?.value) {
    const n = parseInt(p.ratingCountMetafield.value, 10)
    if (!isNaN(n)) reviewCount = n
  }

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    descriptionHtml: String(p.descriptionHtml),
    tags: [...p.tags],
    images: p.images.edges.map((e) => reshapeImage(e.node)),
    priceRange: {
      minVariantPrice: reshapeMoney(p.priceRange.minVariantPrice),
    },
    options: p.options.map<ProductOption>((option) => ({
      name: option.name,
      values: [...option.values],
    })),
    variants: variants.map((variant) =>
      reshapeVariant(variant, legacyInventoryByVariantId),
    ),
    rating,
    reviewCount,
  }
}

function reshapeProductSummary(p: ShopifyProductSummaryNode): ProductSummary {
  const { rating, reviewCount } = parseProductRating(p)

  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    ...(p.updatedAt && { updatedAt: String(p.updatedAt) }),
    featuredImage: p.featuredImage ? reshapeImage(p.featuredImage) : null,
    priceRange: {
      minVariantPrice: reshapeMoney(p.priceRange.minVariantPrice),
    },
    rating,
    reviewCount,
  }
}

async function getLegacyProductInventory(
  handle: string,
  variants: ShopifyVariantNode[],
): Promise<Map<string, LegacyVariantInventory>> {
  const needsLegacyInventory = variants.some(
    (variant) => variant.quantityRule.maximum === null,
  )

  if (!needsLegacyInventory) return new Map()

  const storeDomain = getShopifyStoreDomain()
  if (!storeDomain) return new Map()

  try {
    const response = await fetch(`https://${storeDomain}/products/${handle}.js`)

    if (!response.ok) return new Map()

    const data: unknown = await response.json()
    return parseLegacyProductInventory(data)
  } catch {
    return new Map()
  }
}

async function getProductVariantNodes(
  handle: string,
  firstPage: ShopifyProductNode['variants'],
): Promise<ShopifyVariantNode[]> {
  const variants = firstPage.edges.map((edge) => edge.node)
  let pageInfo = firstPage.pageInfo

  while (pageInfo.hasNextPage && pageInfo.endCursor) {
    const data = await shopifyFetch({
      query: GetProductVariantsDocument,
      variables: {
        handle,
        first: SHOPIFY_PAGE_SIZE,
        after: pageInfo.endCursor,
      },
    })

    const nextPage = data.product?.variants
    if (!nextPage) break

    variants.push(...nextPage.edges.map((edge) => edge.node))
    pageInfo = nextPage.pageInfo
  }

  return variants
}

async function fetchProductSummaryPages(
  limit?: number,
): Promise<ProductSummary[]> {
  const products: ProductSummary[] = []
  let after: string | null | undefined
  let hasNextPage = true

  while (hasNextPage && (limit === undefined || products.length < limit)) {
    const pageSize =
      limit === undefined
        ? SHOPIFY_PAGE_SIZE
        : Math.min(SHOPIFY_PAGE_SIZE, limit - products.length)

    const data = await shopifyFetch({
      query: GetProductsDocument,
      variables: { first: pageSize, after },
    })

    products.push(
      ...data.products.edges.map((edge) => reshapeProductSummary(edge.node)),
    )
    hasNextPage = data.products.pageInfo.hasNextPage
    after = data.products.pageInfo.endCursor
  }

  return products
}

export async function getProduct(
  handle: string,
  cacheVersion = 'default',
): Promise<Product | null> {
  'use cache'
  cacheTag('product', `product-${handle}`, `product-${handle}-${cacheVersion}`)

  const data = await shopifyFetch({
    query: GetProductDocument,
    variables: {
      handle,
      variantFirst: SHOPIFY_PAGE_SIZE,
      variantAfter: null,
    },
  })

  if (!data.product) {
    cacheLife('minutes')
    return null
  }

  const variants = await getProductVariantNodes(handle, data.product.variants)
  const legacyInventoryByVariantId = await getLegacyProductInventory(
    handle,
    variants,
  )
  cacheLife('hours')
  return reshapeProduct(data.product, variants, legacyInventoryByVariantId)
}

export async function getProducts(first = 24): Promise<ProductSummary[]> {
  'use cache'
  cacheTag('product')
  cacheLife('hours')

  return fetchProductSummaryPages(first)
}

export async function getAllProducts(): Promise<ProductSummary[]> {
  'use cache'
  cacheTag('product')
  cacheLife('hours')

  return fetchProductSummaryPages()
}

export async function getProductRecommendations(
  productId: string,
  intent: 'RELATED' | 'COMPLEMENTARY' = 'RELATED',
): Promise<ProductSummary[]> {
  'use cache'
  cacheTag('product', `product-recommendations-${productId}`)
  cacheLife('hours')

  const recommendationIntent =
    intent === 'RELATED'
      ? ProductRecommendationIntent.Related
      : ProductRecommendationIntent.Complementary

  const data = await shopifyFetch({
    query: GetProductRecommendationsDocument,
    variables: { productId, intent: recommendationIntent },
  })

  return (data.productRecommendations ?? []).map(reshapeProductSummary)
}
