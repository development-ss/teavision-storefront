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
  id: 'gid://shopify/Product/42',
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
  options: [{ name: 'Size', values: ['1kg', '250g', '50g'] }],
  variants: [
    variant({
      id: 'gid://shopify/ProductVariant/333',
      title: '1kg',
      sku: 'CON-CAT-CLAW',
      price: { amount: '34.30', currencyCode: 'AUD' },
    }),
    variant({
      id: 'gid://shopify/ProductVariant/222',
      title: '250g',
      sku: 'CON-CAT-CLAW-250G',
      availableForSale: false,
      price: { amount: '14.12', currencyCode: 'AUD' },
    }),
    variant({
      id: 'gid://shopify/ProductVariant/111',
      title: '50g',
      sku: 'CON-CAT-CLAW-50G',
      price: { amount: '9.56', currencyCode: 'AUD' },
    }),
  ],
}

const productUrl = 'https://www.teavision.com.au/products/cats-claw-cut'

describe('buildProductJsonLd', () => {
  test('marks up several pack sizes as a ProductGroup', () => {
    const jsonLd = buildProductJsonLd({
      product: baseProduct,
      productUrl,
      reviewSummary: { rating: 4.8, reviewCount: 12 },
    })

    expect(jsonLd).toMatchObject({
      '@type': 'ProductGroup',
      name: 'Organic Raspberry Leaf',
      url: productUrl,
      image: ['https://cdn.shopify.com/a.jpg', 'https://cdn.shopify.com/b.jpg'],
      brand: { '@type': 'Brand', name: 'Teavision' },
      productGroupID: '42',
      variesBy: ['https://schema.org/size'],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 4.8,
        reviewCount: 12,
      },
    })
  })

  test('gives every pack size its own SKU, price, stock and preselecting URL', () => {
    const jsonLd = buildProductJsonLd({
      product: baseProduct,
      productUrl,
      reviewSummary: null,
    })

    expect(jsonLd).toHaveProperty('hasVariant')
    const variants = 'hasVariant' in jsonLd ? jsonLd.hasVariant : []

    expect(variants).toEqual([
      expect.objectContaining({
        '@type': 'Product',
        name: 'Organic Raspberry Leaf 1kg',
        sku: 'CON-CAT-CLAW',
        size: '1kg',
        url: `${productUrl}?variant=333`,
        offers: expect.objectContaining({
          '@type': 'Offer',
          url: `${productUrl}?variant=333`,
          price: '34.30',
          priceCurrency: 'AUD',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
        }),
      }),
      expect.objectContaining({
        sku: 'CON-CAT-CLAW-250G',
        size: '250g',
        offers: expect.objectContaining({
          price: '14.12',
          availability: 'https://schema.org/OutOfStock',
        }),
      }),
      expect.objectContaining({
        sku: 'CON-CAT-CLAW-50G',
        size: '50g',
        url: `${productUrl}?variant=111`,
        offers: expect.objectContaining({ price: '9.56' }),
      }),
    ])
  })

  test('attaches the refund-policy return terms to every offer', () => {
    const jsonLd = buildProductJsonLd({
      product: baseProduct,
      productUrl,
      reviewSummary: null,
    })
    const variants = 'hasVariant' in jsonLd ? jsonLd.hasVariant : []

    expect(variants).toHaveLength(3)
    for (const item of variants) {
      expect(item.offers.hasMerchantReturnPolicy).toMatchObject({
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'AU',
        returnPolicyCountry: 'AU',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
      })
    }
  })

  test('keeps a single-size product as a plain Product with one Offer', () => {
    const jsonLd = buildProductJsonLd({
      product: {
        ...baseProduct,
        options: [{ name: 'Title', values: ['Default Title'] }],
        variants: [
          variant({
            title: 'Default Title',
            sku: 'ORG-RASP-LF',
            price: { amount: '20.00', currencyCode: 'AUD' },
          }),
        ],
      },
      productUrl,
      reviewSummary: null,
    })

    expect(jsonLd).toMatchObject({
      '@type': 'Product',
      sku: 'ORG-RASP-LF',
      offers: {
        '@type': 'Offer',
        url: productUrl,
        price: '20.00',
        hasMerchantReturnPolicy: { merchantReturnDays: 14 },
      },
    })
    expect(jsonLd).not.toHaveProperty('hasVariant')
  })

  test('omits sku, images, sizes and ratings instead of inventing them', () => {
    const jsonLd = buildProductJsonLd({
      product: {
        ...baseProduct,
        images: [],
        options: [{ name: 'Blend', values: ['A', 'B'] }],
        variants: [
          variant({ id: 'gid://shopify/ProductVariant/1', title: 'A' }),
          variant({ id: 'gid://shopify/ProductVariant/2', title: 'B' }),
        ],
      },
      productUrl,
      reviewSummary: null,
    })
    const variants = 'hasVariant' in jsonLd ? jsonLd.hasVariant : []

    expect(jsonLd).not.toHaveProperty('image')
    expect(jsonLd).not.toHaveProperty('variesBy')
    expect(jsonLd).not.toHaveProperty('aggregateRating')
    expect(variants[0]).not.toHaveProperty('sku')
    expect(variants[0]).not.toHaveProperty('size')
  })
})
