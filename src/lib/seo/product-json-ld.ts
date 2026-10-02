import type { ProductReviewSummary } from '@/lib/reviews/summary'
import type { Product } from '@/lib/shopify/types'

import { ORGANIZATION_ID } from './homepage-json-ld'

type ProductJsonLdInput = {
  product: Pick<
    Product,
    'title' | 'description' | 'images' | 'priceRange' | 'variants'
  >
  productUrl: string
  reviewSummary: ProductReviewSummary | null
}

// The offer advertises the lowest variant price, so report the SKU of the
// variant that actually carries that price (preferring one that is in stock).
function getOfferSku(
  product: ProductJsonLdInput['product'],
): string | undefined {
  const minPrice = Number(product.priceRange.minVariantPrice.amount)
  const withSku = product.variants.filter((variant) => variant.sku)
  const atMinPrice = withSku.filter(
    (variant) => Number(variant.price.amount) === minPrice,
  )
  const match =
    atMinPrice.find((variant) => variant.availableForSale) ??
    atMinPrice[0] ??
    withSku[0]

  return match?.sku ?? undefined
}

export function buildProductJsonLd({
  product,
  productUrl,
  reviewSummary,
}: ProductJsonLdInput) {
  const sku = getOfferSku(product)
  const hasAvailableVariant = product.variants.some(
    (variant) => variant.availableForSale,
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    ...(product.images.length > 0 && {
      image: product.images.map((image) => image.url),
    }),
    ...(sku && { sku }),
    brand: { '@type': 'Brand', name: 'Teavision' },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      price: product.priceRange.minVariantPrice.amount,
      availability: hasAvailableVariant
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': ORGANIZATION_ID },
    },
    ...(reviewSummary && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: reviewSummary.rating,
        reviewCount: reviewSummary.reviewCount,
      },
    }),
  }
}
