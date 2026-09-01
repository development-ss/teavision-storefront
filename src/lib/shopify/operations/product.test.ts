import type { Mock } from 'vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { shopifyFetch } from '@/lib/shopify/client'

import { getProduct } from './product'

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

vi.mock('@/lib/shopify/client', () => ({
  shopifyFetch: vi.fn(),
}))

type ShopifyFetchCall = {
  query: unknown
  variables?: unknown
}

type ShopifyFetchMock = Mock<(options: ShopifyFetchCall) => Promise<unknown>>

const shopifyFetchMock = shopifyFetch as unknown as ShopifyFetchMock
const fetchMock = vi.fn() as Mock<typeof fetch>

function makeShopifyProductPayload() {
  return {
    product: {
      id: 'gid://shopify/Product/7087161278551',
      handle: '2003y-mini-ripe-pu-erh-tea-brick-250g-box',
      title: '2003Y Mini Ripe Pu-erh Tea Brick (250g/box)',
      description: '',
      descriptionHtml: '',
      tags: [],
      collections: { nodes: [] },
      images: { edges: [] },
      priceRange: {
        minVariantPrice: { amount: '40.65', currencyCode: 'AUD' },
      },
      options: [{ name: 'Title', values: ['Default Title'] }],
      ratingMetafield: null,
      ratingCountMetafield: null,
      variants: {
        pageInfo: { hasNextPage: false, endCursor: null },
        edges: [
          {
            node: {
              id: 'gid://shopify/ProductVariant/41503540936791',
              title: 'Default Title',
              availableForSale: true,
              currentlyNotInStock: false,
              quantityRule: { minimum: 1, maximum: 100, increment: 1 },
              image: null,
              price: { amount: '40.65', currencyCode: 'AUD' },
              quantityPriceBreaks: {
                nodes: [
                  {
                    minimumQuantity: 5,
                    price: { amount: '38.62', currencyCode: 'AUD' },
                  },
                ],
              },
            },
          },
        ],
      },
    },
  }
}

describe('Shopify product operations', () => {
  beforeEach(() => {
    shopifyFetchMock.mockReset()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  test('maps Shopify-native price breaks and discount context', async () => {
    shopifyFetchMock.mockResolvedValueOnce(makeShopifyProductPayload())

    await expect(
      getProduct('2003y-mini-ripe-pu-erh-tea-brick-250g-box'),
    ).resolves.toMatchObject({
      variants: [
        {
          quantityPriceBreaks: [
            {
              minimumQuantity: 5,
              price: { amount: '38.62', currencyCode: 'AUD' },
            },
          ],
        },
      ],
      collectionIds: [],
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
