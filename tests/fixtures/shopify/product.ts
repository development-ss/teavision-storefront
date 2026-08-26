import type {
  Product,
  ProductSummary,
  ProductVariant,
} from '@/lib/shopify/types'

import { makeMoney } from './money'

export function makeVariant(
  overrides: Partial<ProductVariant> = {},
): ProductVariant {
  return {
    id: 'gid://shopify/ProductVariant/test-variant-1',
    title: '1kg',
    availableForSale: true,
    quantityAvailable: 20,
    quantityRule: {
      minimum: 1,
      maximum: 20,
      increment: 1,
    },
    price: makeMoney('24.00'),
    quantityPriceBreaks: [],
    image: null,
    ...overrides,
  }
}

export function makeProductSummary(
  overrides: Partial<ProductSummary> = {},
): ProductSummary {
  return {
    id: 'gid://shopify/Product/test-product',
    handle: 'test-standard-tea',
    title: 'Test Standard Tea',
    featuredImage: {
      url: 'https://cdn.shopify.com/s/files/1/0000/0001/products/test-tea.jpg',
      altText: 'Loose tea',
      width: 800,
      height: 800,
    },
    priceRange: {
      minVariantPrice: makeMoney('24.00'),
    },
    rating: 4.8,
    reviewCount: 24,
    ...overrides,
  }
}

export function makeProduct(overrides: Partial<Product> = {}): Product {
  const summary = makeProductSummary(overrides)

  return {
    ...summary,
    description: 'A reliable test tea for cart and checkout handoff coverage.',
    descriptionHtml:
      '<p>A reliable test tea for cart and checkout handoff coverage.</p>',
    tags: ['Wholesale', 'Organic'],
    images: summary.featuredImage ? [summary.featuredImage] : [],
    variants: [makeVariant()],
    options: [{ name: 'Pack size', values: ['1kg'] }],
    ...overrides,
  }
}
