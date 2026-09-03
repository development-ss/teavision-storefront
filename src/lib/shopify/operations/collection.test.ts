import type { Mock } from 'vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { shopifyFetch } from '@/lib/shopify/client'
import {
  GetCollectionCursorIndexDocument,
  GetCollectionProductsDocument,
  ProductCollectionSortKeys,
} from '@/lib/shopify/types'

import {
  COLLECTION_PRODUCT_PAGE_SIZE,
  getCollectionPageIndex,
  getCollectionProductsPage,
  getCollectionTagCounts,
} from './collection'

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

function makeCursorPayload({
  cursors,
  endCursor,
  hasNextPage,
  tagsByCursor = {},
}: {
  cursors: string[]
  endCursor: string | null
  hasNextPage: boolean
  tagsByCursor?: Record<string, string[]>
}) {
  return {
    collection: {
      products: {
        edges: cursors.map((cursor) => ({
          cursor,
          node: { tags: tagsByCursor[cursor] ?? [] },
        })),
        pageInfo: { endCursor, hasNextPage },
      },
    },
  }
}

function makeProductsPayload(
  productHandles: string[],
  tagsByHandle: Record<string, string[]> = {},
) {
  return {
    collection: {
      products: {
        filters: [],
        pageInfo: {
          endCursor: productHandles.at(-1) ?? null,
          hasNextPage: false,
        },
        edges: productHandles.map((handle, index) => ({
          node: {
            id: `gid://shopify/Product/${index + 1}`,
            handle,
            title: `Test Product ${index + 1}`,
            availableForSale: true,
            productType: 'Tea',
            tags: tagsByHandle[handle] ?? [],
            featuredImage: null,
            priceRange: {
              minVariantPrice: {
                amount: '12.00',
                currencyCode: 'AUD',
              },
            },
            ratingMetafield: null,
            ratingCountMetafield: null,
            variants: {
              edges: [
                {
                  node: {
                    id: `gid://shopify/ProductVariant/${index + 1}`,
                    title: 'Default Title',
                    availableForSale: true,
                    currentlyNotInStock: false,
                    quantityRule: {
                      minimum: 1,
                      maximum: null,
                      increment: 1,
                    },
                    price: {
                      amount: '12.00',
                      currencyCode: 'AUD',
                    },
                    image: null,
                  },
                },
              ],
            },
          },
        })),
      },
    },
  }
}

describe('Shopify collection pagination operations', () => {
  beforeEach(() => {
    shopifyFetchMock.mockReset()
  })

  test('getCollectionPageIndex chunks cursor-only requests and computes true totals', async () => {
    const firstChunk = Array.from(
      { length: 250 },
      (_, index) => `cursor-${index + 1}`,
    )
    const secondChunk = Array.from(
      { length: 13 },
      (_, index) => `cursor-${index + 251}`,
    )
    shopifyFetchMock
      .mockResolvedValueOnce(
        makeCursorPayload({
          cursors: firstChunk,
          endCursor: 'cursor-250',
          hasNextPage: true,
        }),
      )
      .mockResolvedValueOnce(
        makeCursorPayload({
          cursors: secondChunk,
          endCursor: 'cursor-263',
          hasNextPage: false,
        }),
      )

    await expect(getCollectionPageIndex('all')).resolves.toMatchObject({
      totalCount: 263,
      totalPages: 11,
    })

    expect(shopifyFetchMock).toHaveBeenCalledTimes(2)
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(1, {
      query: GetCollectionCursorIndexDocument,
      variables: {
        handle: 'all',
        first: 250,
        after: undefined,
        sortKey: ProductCollectionSortKeys.CollectionDefault,
        reverse: false,
        filters: [],
      },
    })
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(2, {
      query: GetCollectionCursorIndexDocument,
      variables: {
        handle: 'all',
        first: 250,
        after: 'cursor-250',
        sortKey: ProductCollectionSortKeys.CollectionDefault,
        reverse: false,
        filters: [],
      },
    })
  })

  test('getCollectionPageIndex paginates category matches, not raw collection pages', async () => {
    const cursors = Array.from(
      { length: 72 },
      (_, index) => `cursor-${index + 1}`,
    )
    shopifyFetchMock.mockResolvedValueOnce(
      makeCursorPayload({
        cursors,
        endCursor: 'cursor-72',
        hasNextPage: false,
        tagsByCursor: {
          // raw page 1 (positions 1-24) and raw page 3 (positions 49-72)
          'cursor-10': ['categories_Australian Tea'],
          'cursor-60': ['categories_Australian Tea', 'categories_All Herbs'],
        },
      }),
    )

    await expect(
      getCollectionPageIndex(
        'dried-herbs',
        COLLECTION_PRODUCT_PAGE_SIZE,
        ProductCollectionSortKeys.CollectionDefault,
        false,
        [],
        'categories_Australian Tea',
      ),
    ).resolves.toMatchObject({
      totalCount: 2,
      totalPages: 1,
      displayPageToRawPage: [1],
    })
  })

  test('getCollectionProductsPage merges sparse category matches into one display page', async () => {
    const cursors = Array.from(
      { length: 48 },
      (_, index) => `cursor-${index + 1}`,
    )
    const firstRawPageHandles = Array.from({ length: 24 }, (_, index) =>
      index === 9 ? 'match-one' : `first-${index}`,
    )
    const secondRawPageHandles = Array.from({ length: 24 }, (_, index) =>
      index === 5 ? 'match-two' : `second-${index}`,
    )
    const categoryTag = 'categories_Kombucha'

    shopifyFetchMock
      .mockResolvedValueOnce(
        makeCursorPayload({
          cursors,
          endCursor: 'cursor-48',
          hasNextPage: false,
          tagsByCursor: {
            'cursor-10': [categoryTag],
            'cursor-30': [categoryTag],
          },
        }),
      )
      .mockResolvedValueOnce(
        makeProductsPayload(firstRawPageHandles, {
          'match-one': [categoryTag],
        }),
      )
      .mockResolvedValueOnce(
        makeProductsPayload(secondRawPageHandles, {
          'match-two': [categoryTag],
        }),
      )

    await expect(
      getCollectionProductsPage(
        'all',
        1,
        COLLECTION_PRODUCT_PAGE_SIZE,
        ProductCollectionSortKeys.CollectionDefault,
        false,
        [{ tag: categoryTag }],
        categoryTag,
      ),
    ).resolves.toMatchObject({
      products: [{ handle: 'match-one' }, { handle: 'match-two' }],
      pageInfo: { hasNextPage: false },
    })
  })

  test('getCollectionProductsPage offsets matches when a display page starts mid-raw-page', async () => {
    const cursors = Array.from(
      { length: 48 },
      (_, index) => `cursor-${index + 1}`,
    )
    const categoryTag = 'categories_Kombucha'
    const secondRawPageHandles = Array.from({ length: 24 }, (_, index) =>
      index === 0 ? 'match-24' : `other-${index}`,
    )

    shopifyFetchMock
      .mockResolvedValueOnce(
        makeCursorPayload({
          cursors,
          endCursor: 'cursor-48',
          hasNextPage: false,
          tagsByCursor: Object.fromEntries(
            cursors.slice(0, 25).map((cursor) => [cursor, [categoryTag]]),
          ),
        }),
      )
      .mockResolvedValueOnce(
        makeProductsPayload(secondRawPageHandles, {
          'match-24': [categoryTag],
        }),
      )

    const result = await getCollectionProductsPage(
      'all',
      2,
      COLLECTION_PRODUCT_PAGE_SIZE,
      ProductCollectionSortKeys.CollectionDefault,
      false,
      [{ tag: categoryTag }],
      categoryTag,
    )
    expect(shopifyFetchMock).toHaveBeenLastCalledWith({
      query: GetCollectionProductsDocument,
      variables: expect.objectContaining({ after: 'cursor-24' }),
    })
    expect(result).toMatchObject({
      products: [{ handle: 'match-24' }],
      pageInfo: { hasNextPage: false },
    })
  })

  test('getCollectionPageIndex falls back to a single display page when no products match the tag', async () => {
    const cursors = Array.from(
      { length: 30 },
      (_, index) => `cursor-${index + 1}`,
    )
    shopifyFetchMock.mockResolvedValueOnce(
      makeCursorPayload({
        cursors,
        endCursor: 'cursor-30',
        hasNextPage: false,
      }),
    )

    await expect(
      getCollectionPageIndex(
        'dried-herbs',
        COLLECTION_PRODUCT_PAGE_SIZE,
        ProductCollectionSortKeys.CollectionDefault,
        false,
        [],
        'categories_Missing',
      ),
    ).resolves.toMatchObject({
      totalCount: 0,
      totalPages: 1,
      displayPageToRawPage: [1],
    })
  })

  test('getCollectionTagCounts aggregates tag counts across the full cursor index', async () => {
    const cursors = Array.from(
      { length: 26 },
      (_, index) => `cursor-${index + 1}`,
    )
    const tagsByCursor = Object.fromEntries(
      cursors.map((cursor) => [cursor, ['categories_All Herbs']]),
    )
    tagsByCursor['cursor-26'] = [
      'categories_All Herbs',
      'categories_Australian Tea',
    ]
    shopifyFetchMock.mockResolvedValueOnce(
      makeCursorPayload({
        cursors,
        endCursor: 'cursor-26',
        hasNextPage: false,
        tagsByCursor,
      }),
    )

    await expect(getCollectionTagCounts('dried-herbs')).resolves.toEqual({
      'categories_All Herbs': 26,
      'categories_Australian Tea': 1,
    })
  })

  test('getCollectionProductsPage fetches page 1 with one bounded product payload query', async () => {
    shopifyFetchMock.mockResolvedValueOnce(makeProductsPayload(['first-tea']))

    await expect(getCollectionProductsPage('all', 1)).resolves.toMatchObject({
      products: [{ handle: 'first-tea' }],
    })

    expect(shopifyFetchMock).toHaveBeenCalledTimes(1)
    expect(shopifyFetchMock).toHaveBeenCalledWith({
      query: GetCollectionProductsDocument,
      variables: {
        handle: 'all',
        first: COLLECTION_PRODUCT_PAGE_SIZE,
        after: null,
        sortKey: ProductCollectionSortKeys.CollectionDefault,
        reverse: false,
        filters: [],
      },
    })
  })

  test('getCollectionProductsPage resolves page N from cursor index before one bounded product query', async () => {
    const cursors = Array.from(
      { length: 72 },
      (_, index) => `cursor-${index + 1}`,
    )
    shopifyFetchMock
      .mockResolvedValueOnce(
        makeCursorPayload({
          cursors,
          endCursor: 'cursor-72',
          hasNextPage: false,
        }),
      )
      .mockResolvedValueOnce(makeProductsPayload(['page-three-tea']))

    await expect(getCollectionProductsPage('all', 3)).resolves.toMatchObject({
      products: [{ handle: 'page-three-tea' }],
    })

    expect(shopifyFetchMock).toHaveBeenCalledTimes(2)
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(1, {
      query: GetCollectionCursorIndexDocument,
      variables: {
        handle: 'all',
        first: 250,
        after: undefined,
        sortKey: ProductCollectionSortKeys.CollectionDefault,
        reverse: false,
        filters: [],
      },
    })
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(2, {
      query: GetCollectionProductsDocument,
      variables: {
        handle: 'all',
        first: COLLECTION_PRODUCT_PAGE_SIZE,
        after: 'cursor-48',
        sortKey: ProductCollectionSortKeys.CollectionDefault,
        reverse: false,
        filters: [],
      },
    })
  })
})
