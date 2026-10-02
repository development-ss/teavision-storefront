import { describe, expect, test } from 'vitest'

import type { ProductVariant } from '@/lib/shopify/types'

import { buildProductJsonLd } from './product-json-ld'

function variant(overrides: Partial<ProductVariant>): ProductVariant {
  return {
    id: 'gid://shopify/ProductVariant/1',
    title: '250g',
    sku: null,
    availableForSale: true,
    price: { amount: '20.00', currencyCode: 'AUD' },
    quantityPriceBreaks: [],
    ...overrides,
  }
}

const baseProduct = {
  title: 'Organic Raspberry Leaf',
  description: 'Cut raspberry leaf.',
  images: [
    {
      url: 'https://cdn.shopify.com/a.jpg',
      altText: null,
      width: 1,
      height: 1,
    },
    {
      url: 'https://cdn.shopify.com/b.jpg',
      altText: null,
      width: 1,
      height: 1,
    },
  ],
  priceRange: { minVariantPrice: { amount: '9.5', currencyCode: 'AUD' } },
  variants: [
    variant({
      sku: 'ORG-RASP-LF-250G',
      price: { amount: '20.00', currencyCode: 'AUD' },
    }),
    variant({
      sku: 'ORG-RASP-LF-50G',
      price: { amount: '9.50', currencyCode: 'AUD' },
    }),
  ],
}

describe('buildProductJsonLd', () => {
  test('emits the SEO brief fields from real product data', () => {
    const jsonLd = buildProductJsonLd({
      product: baseProduct,
      productUrl:
        'https://www.teavision.com.au/products/organic-raspberry-leaf',
      reviewSummary: { rating: 4.8, reviewCount: 12 },
    })

    expect(jsonLd).toMatchObject({
      '@type': 'Product',
      name: 'Organic Raspberry Leaf',
      image: ['https://cdn.shopify.com/a.jpg', 'https://cdn.shopify.com/b.jpg'],
      sku: 'ORG-RASP-LF-50G',
      brand: { '@type': 'Brand', name: 'Teavision' },
      offers: {
        '@type': 'Offer',
        url: 'https://www.teavision.com.au/products/organic-raspberry-leaf',
        price: '9.5',
        priceCurrency: 'AUD',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 4.8,
        reviewCount: 12,
      },
    })
  })

  test('omits sku and ratings instead of inventing them', () => {
    const jsonLd = buildProductJsonLd({
      product: {
        ...baseProduct,
        images: [],
        variants: [variant({ sku: null, availableForSale: false })],
      },
      productUrl: 'https://www.teavision.com.au/products/x',
      reviewSummary: null,
    })

    expect(jsonLd).not.toHaveProperty('sku')
    expect(jsonLd).not.toHaveProperty('image')
    expect(jsonLd).not.toHaveProperty('aggregateRating')
    expect(jsonLd.offers.availability).toBe('https://schema.org/OutOfStock')
  })
})
