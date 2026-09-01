import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getSearchaniseSearchResults } from './search'

vi.mock('server-only', () => ({}))

const { searchanisePublicConfigMock, shopifyFetchMock } = vi.hoisted(() => ({
  searchanisePublicConfigMock: {
    apiKey: 'test-api-key',
    enabled: true,
  },
  shopifyFetchMock: vi.fn(),
}))

vi.mock('@/lib/env/public', () => ({
  searchanisePublicConfig: searchanisePublicConfigMock,
}))

vi.mock('@/lib/shopify/client', () => ({
  shopifyFetch: shopifyFetchMock,
}))

vi.mock('@/lib/observability/logger', () => ({
  logEvent: vi.fn(),
}))

const fetchMock = vi.fn() as Mock<typeof fetch>

describe('getSearchaniseSearchResults', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    shopifyFetchMock.mockReset()
    searchanisePublicConfigMock.enabled = true
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('returns decoded plain text after stripping provider markup', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        items: [
          {
            product_id: 'licorice-mint',
            link: '/products/organic-licorice-mint-tea',
            title: 'Organic Licorice &amp; Mint Tea',
            description:
              '<strong>Caffeine-free.</strong> Calming &amp; uplifting &lt;blend&gt;.',
            price: '42.88',
          },
        ],
        itemsPerPage: 10,
        startIndex: 0,
        totalItems: 1,
      }),
    )

    const result = await getSearchaniseSearchResults({
      query: 'licorice mint',
      page: 1,
      sort: 'relevance',
      filters: [],
      pageSize: 10,
    })

    expect(result.status).toBe('success')
    expect(result.products[0]).toMatchObject({
      title: 'Organic Licorice & Mint Tea',
      description: 'Caffeine-free. Calming & uplifting <blend>.',
    })
  })

  test('falls back to Shopify with filters and pagination when Searchanise is disabled', async () => {
    searchanisePublicConfigMock.enabled = false
    shopifyFetchMock.mockResolvedValue({
      products: {
        edges: [
          { node: makeShopifySearchProduct('Black Tea', 'Black Tea', ['Tea']) },
          {
            node: makeShopifySearchProduct('Organic Green Tea', 'Green Tea', [
              'Tea',
              'Organic',
            ]),
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    })

    const result = await getSearchaniseSearchResults({
      query: 'tea',
      page: 1,
      sort: 'title-asc',
      filters: [{ attribute: 'tag', value: 'Organic' }],
      pageSize: 10,
    })

    expect(result).toMatchObject({
      status: 'success',
      pagination: {
        currentPage: 1,
        totalItems: 1,
        totalPages: 1,
      },
    })
    expect(result.products.map((product) => product.title)).toEqual([
      'Organic Green Tea',
    ])
    expect(result.facets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attribute: 'product_type' }),
        expect.objectContaining({ attribute: 'tag' }),
      ]),
    )
    expect(shopifyFetchMock).toHaveBeenCalledOnce()
  })

  test('preserves sorted page state in the Shopify fallback', async () => {
    searchanisePublicConfigMock.enabled = false
    shopifyFetchMock.mockResolvedValue({
      products: {
        edges: [
          { node: makeShopifySearchProduct('Black Tea', 'Tea', ['Tea']) },
          {
            node: makeShopifySearchProduct('Organic Green Tea', 'Tea', ['Tea']),
          },
        ],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    })

    const result = await getSearchaniseSearchResults({
      query: 'tea',
      page: 2,
      sort: 'title-asc',
      filters: [],
      pageSize: 1,
    })

    expect(result.products.map((product) => product.title)).toEqual([
      'Organic Green Tea',
    ])
    expect(result.pagination).toMatchObject({
      currentPage: 2,
      totalItems: 2,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false,
    })
  })
})

function makeShopifySearchProduct(
  title: string,
  productType: string,
  tags: string[],
) {
  return {
    id: `gid://shopify/Product/${title.toLocaleLowerCase().replaceAll(' ', '-')}`,
    handle: title.toLocaleLowerCase().replaceAll(' ', '-'),
    title,
    description: `${title} description`,
    updatedAt: '2026-08-01T00:00:00Z',
    availableForSale: true,
    productType,
    tags,
    featuredImage: null,
    priceRange: {
      minVariantPrice: { amount: '24.00', currencyCode: 'AUD' },
    },
    variants: {
      edges: [
        {
          node: {
            id: `gid://shopify/ProductVariant/${title.toLocaleLowerCase().replaceAll(' ', '-')}`,
            title: 'Default Title',
            availableForSale: true,
            currentlyNotInStock: false,
            quantityRule: { minimum: 1, maximum: 20, increment: 1 },
            price: { amount: '24.00', currencyCode: 'AUD' },
            quantityPriceBreaks: { nodes: [] },
            image: null,
          },
        },
      ],
    },
    ratingMetafield: null,
    ratingCountMetafield: null,
  }
}
