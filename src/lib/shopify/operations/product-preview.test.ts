import { beforeEach, describe, expect, test, vi } from 'vitest'

import { shopifyAdminFetch } from '@/lib/shopify/admin-client'

import { getProductPreview } from './product-preview'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/shopify/admin-client', () => ({
  shopifyAdminFetch: vi.fn(),
}))

const adminFetchMock = vi.mocked(shopifyAdminFetch)

describe('getProductPreview', () => {
  beforeEach(() => {
    adminFetchMock.mockReset()
  })

  test('rejects non-numeric IDs before calling Admin API', async () => {
    await expect(
      getProductPreview('gid://shopify/Product/123'),
    ).resolves.toBeNull()
    expect(adminFetchMock).not.toHaveBeenCalled()
  })

  test('maps Admin product data into the shared product shape', async () => {
    adminFetchMock.mockResolvedValueOnce({
      shop: { currencyCode: 'AUD' },
      product: {
        id: 'gid://shopify/Product/123',
        handle: 'draft-matcha',
        title: 'Draft Matcha',
        description: 'Preview description',
        descriptionHtml: '<p>Preview description</p>',
        status: 'DRAFT',
        tags: ['categories: Tea', 'Package_Internal'],
        collections: { nodes: [{ id: 'gid://shopify/Collection/4' }] },
        media: {
          nodes: [
            {
              image: {
                url: 'https://cdn.test/product.jpg',
                altText: 'Matcha',
                width: 800,
                height: 800,
              },
            },
          ],
        },
        options: [{ name: 'Size', values: ['1kg'] }],
        variants: {
          nodes: [
            {
              id: 'gid://shopify/ProductVariant/456',
              title: '1kg',
              availableForSale: false,
              inventoryQuantity: 0,
              price: '42.00',
              media: { nodes: [] },
            },
          ],
        },
        priceRangeV2: {
          minVariantPrice: { amount: '42.00', currencyCode: 'AUD' },
        },
        ratingMetafield: { value: '{"value":"4.5"}' },
        ratingCountMetafield: { value: '12' },
      },
    })

    await expect(getProductPreview('123')).resolves.toEqual({
      status: 'DRAFT',
      product: {
        id: 'gid://shopify/Product/123',
        handle: 'draft-matcha',
        title: 'Draft Matcha',
        description: 'Preview description',
        descriptionHtml: '<p>Preview description</p>',
        tags: ['categories: Tea', 'Package_Internal'],
        collectionIds: ['gid://shopify/Collection/4'],
        images: [
          {
            url: 'https://cdn.test/product.jpg',
            altText: 'Matcha',
            width: 800,
            height: 800,
          },
        ],
        priceRange: {
          minVariantPrice: { amount: '42.00', currencyCode: 'AUD' },
        },
        variants: [
          {
            id: 'gid://shopify/ProductVariant/456',
            title: '1kg',
            availableForSale: false,
            currentlyNotInStock: false,
            quantityAvailable: 0,
            quantityRule: { minimum: 1, maximum: null, increment: 1 },
            price: { amount: '42.00', currencyCode: 'AUD' },
            quantityPriceBreaks: [],
            image: null,
          },
        ],
        options: [{ name: 'Size', values: ['1kg'] }],
        rating: 4.5,
        reviewCount: 12,
      },
    })

    expect(adminFetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { id: 'gid://shopify/Product/123' },
        query: expect.stringContaining('query ProductPreview'),
      }),
    )
  })

  test('returns null when Admin product is missing', async () => {
    adminFetchMock.mockResolvedValueOnce({
      shop: { currencyCode: 'AUD' },
      product: null,
    })

    await expect(getProductPreview('999')).resolves.toBeNull()
  })
})
