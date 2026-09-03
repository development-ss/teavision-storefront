import { cacheLife, cacheTag } from 'next/cache'

import { shopifyFetch } from '@/lib/shopify/client'
import { getCollectionDisplayTitle } from '@/lib/shopify/collection-title'
import {
  GetCollectionCursorIndexDocument,
  GetCollectionDocument,
  GetCollectionMenuDocument,
  GetCollectionProductsDocument,
  GetCollectionSummariesDocument,
  GetCollectionsDocument,
  ProductCollectionSortKeys,
  type Collection,
  type CollectionPageIndex,
  type CollectionProductFilter,
  type CollectionProductsResult,
  type CollectionProductSummary,
  type CollectionSummary,
  type GetCollectionCursorIndexQuery,
  type GetCollectionQuery,
  type GetCollectionMenuQuery,
  type GetCollectionProductsQuery,
  type GetCollectionSummariesQuery,
  type ProductFilter,
  type ProductSummary,
  type ProductVariant,
} from '@/lib/shopify/types'

import {
  parseProductRating,
  reshapeImage,
  reshapeMoney,
  type MoneyLike,
  type ShopifyImageLike,
} from './mappers'

const SHOPIFY_PAGE_SIZE = 250
export const COLLECTION_PRODUCT_PAGE_SIZE = 24

type ShopifyProductSummaryNode = {
  id: string
  handle: string
  title: string
  featuredImage?: ShopifyImageLike | null
  priceRange: { minVariantPrice: MoneyLike }
  ratingMetafield?: { value: string } | null
  ratingCountMetafield?: { value: string } | null
}

type ShopifyCollectionProductNode = NonNullable<
  GetCollectionProductsQuery['collection']
>['products']['edges'][number]['node']

type ShopifyCollectionProductVariantNode =
  ShopifyCollectionProductNode['variants']['edges'][number]['node']

type ShopifyCollectionProductFilterNode = NonNullable<
  GetCollectionProductsQuery['collection']
>['products']['filters'][number]

type ShopifyCollectionNode = NonNullable<GetCollectionQuery['collection']>

type ShopifyCollectionSummaryNode =
  GetCollectionSummariesQuery['collections']['edges'][number]['node']

type ShopifyCollectionMenuItem = NonNullable<
  GetCollectionMenuQuery['menu']
>['items'][number]

type ShopifyCollectionMenuResource = Extract<
  NonNullable<ShopifyCollectionMenuItem['resource']>,
  { __typename?: 'Collection' }
>

type ShopifyCollectionMenuTreeItem = {
  resource?: ShopifyCollectionMenuItem['resource'] | null
  items?: ShopifyCollectionMenuTreeItem[]
}

function textFromHtml(html: string): string {
  return removeCitationMarkers(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function removeCitationMarkers(value: string): string {
  return value.replace(/:contentReference\[[^\]]+\]\{[^}]+\}/g, ' ')
}

function looksLikeCss(value: string): boolean {
  return /\/\*|--[a-z0-9-]+:|@media|#[a-z0-9_-]+\s*\{/i.test(value)
}

function cleanCollectionDescription(
  description: string,
  descriptionHtml: string,
  seoDescription: string | null | undefined,
): string {
  const trimmedSeoDescription = seoDescription
    ? removeCitationMarkers(seoDescription).replace(/\s+/g, ' ').trim()
    : undefined
  if (trimmedSeoDescription && !looksLikeCss(trimmedSeoDescription)) {
    return trimmedSeoDescription
  }

  const trimmedDescription = removeCitationMarkers(description)
    .replace(/\s+/g, ' ')
    .trim()
  if (trimmedDescription && !looksLikeCss(trimmedDescription)) {
    return trimmedDescription
  }

  const htmlText = textFromHtml(descriptionHtml)
  if (htmlText && !looksLikeCss(htmlText)) {
    return htmlText
  }

  return ''
}

function reshapeProductSummary(
  product: ShopifyProductSummaryNode,
): ProductSummary {
  const { rating, reviewCount } = parseProductRating(product)

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    featuredImage: product.featuredImage
      ? reshapeImage(product.featuredImage)
      : null,
    priceRange: {
      minVariantPrice: reshapeMoney(product.priceRange.minVariantPrice),
    },
    rating,
    reviewCount,
  }
}

function reshapeCollectionProductSummary(
  product: ShopifyCollectionProductNode,
): CollectionProductSummary {
  return {
    ...reshapeProductSummary(product),
    availableForSale: product.availableForSale,
    productType: product.productType,
    tags: product.tags,
    variants: product.variants.edges.map((edge) =>
      reshapeCollectionProductVariant(edge.node),
    ),
  }
}

function reshapeCollectionProductVariant(
  variant: ShopifyCollectionProductVariantNode,
): ProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    currentlyNotInStock: variant.currentlyNotInStock,
    quantityAvailable: null,
    quantityRule: {
      minimum: variant.quantityRule.minimum,
      maximum: variant.quantityRule.maximum ?? null,
      increment: variant.quantityRule.increment,
    },
    price: reshapeMoney(variant.price),
    quantityPriceBreaks: [],
    image: variant.image ? reshapeImage(variant.image) : null,
  }
}

function reshapeCollectionProductFilter(
  filter: ShopifyCollectionProductFilterNode,
): CollectionProductFilter {
  return {
    id: filter.id,
    label: filter.label,
    type: filter.type,
    values: filter.values.map((value) => ({
      id: value.id,
      label: value.label,
      count: value.count,
      input: JSON.stringify(value.input),
    })),
  }
}

function reshapeCollection(collection: ShopifyCollectionNode): Collection {
  const descriptionHtml = String(collection.descriptionHtml)
  const description = cleanCollectionDescription(
    collection.description,
    descriptionHtml,
    collection.seo?.description,
  )

  return {
    id: collection.id,
    handle: collection.handle,
    title: getCollectionDisplayTitle(collection.title),
    description,
    descriptionHtml,
    featuredImage: collection.image ? reshapeImage(collection.image) : null,
    updatedAt: String(collection.updatedAt),
    seo: {
      title: collection.seo?.title ?? null,
      description: collection.seo?.description ?? null,
    },
  }
}

function reshapeCollectionSummary(
  collection: ShopifyCollectionSummaryNode,
): CollectionSummary {
  const description = cleanCollectionDescription(
    collection.description,
    '',
    collection.seo?.description,
  )

  return {
    id: collection.id,
    handle: collection.handle,
    title: getCollectionDisplayTitle(collection.title),
    description,
    featuredImage: collection.image ? reshapeImage(collection.image) : null,
    updatedAt: String(collection.updatedAt),
    seo: {
      title: collection.seo?.title ?? null,
      description: collection.seo?.description ?? null,
    },
  }
}

function isCollectionMenuResource(
  resource: ShopifyCollectionMenuTreeItem['resource'],
): resource is ShopifyCollectionMenuResource {
  return resource?.__typename === 'Collection'
}

function collectCollectionMenuSummaries(
  items: ShopifyCollectionMenuTreeItem[],
  collections: CollectionSummary[],
): void {
  items.forEach((item) => {
    if (isCollectionMenuResource(item.resource)) {
      collections.push(reshapeCollectionSummary(item.resource))
    }

    collectCollectionMenuSummaries(item.items ?? [], collections)
  })
}

function uniqueCollectionsByHandle(
  collections: CollectionSummary[],
): CollectionSummary[] {
  const seenHandles = new Set<string>()

  return collections.filter((collection) => {
    if (seenHandles.has(collection.handle)) return false

    seenHandles.add(collection.handle)
    return true
  })
}

async function fetchCollectionSummaries(
  first: number,
): Promise<CollectionSummary[]> {
  const collections: CollectionSummary[] = []
  let after: string | null | undefined
  let hasNextPage = true

  while (hasNextPage) {
    const data = await shopifyFetch({
      query: GetCollectionSummariesDocument,
      variables: { first, after },
    })

    collections.push(
      ...data.collections.edges.map((edge) =>
        reshapeCollectionSummary(edge.node),
      ),
    )
    hasNextPage = data.collections.pageInfo.hasNextPage
    after = data.collections.pageInfo.endCursor
  }

  return collections
}

export async function getCollection(
  handle: string,
): Promise<Collection | null> {
  'use cache'
  cacheTag('collection', `collection-${handle}`)
  cacheLife('hours')

  const data = await shopifyFetch({
    query: GetCollectionDocument,
    variables: { handle },
  })

  return data.collection ? reshapeCollection(data.collection) : null
}

export async function getCollections(
  first = SHOPIFY_PAGE_SIZE,
): Promise<string[]> {
  'use cache'
  cacheTag('collections')
  cacheLife('days')

  const handles: string[] = []
  let after: string | null | undefined
  let hasNextPage = true

  while (hasNextPage) {
    const data = await shopifyFetch({
      query: GetCollectionsDocument,
      variables: { first, after },
    })

    handles.push(...data.collections.edges.map((edge) => edge.node.handle))
    hasNextPage = data.collections.pageInfo.hasNextPage
    after = data.collections.pageInfo.endCursor
  }

  return handles
}

export async function getCollectionSummaries(
  first = SHOPIFY_PAGE_SIZE,
): Promise<CollectionSummary[]> {
  'use cache'
  cacheTag('collections')
  cacheLife('days')

  return fetchCollectionSummaries(first)
}

export async function getCollectionMenuSummaries(
  handle: string,
): Promise<CollectionSummary[]> {
  'use cache'
  cacheTag('collections', `collection-menu-${handle}`)
  cacheLife('days')

  const data = await shopifyFetch({
    query: GetCollectionMenuDocument,
    variables: { handle },
  })

  if (!data.menu) return []

  const collections: CollectionSummary[] = []
  collectCollectionMenuSummaries(data.menu.items, collections)

  return uniqueCollectionsByHandle(collections)
}

export async function getCollectionProducts(
  handle: string,
  first = COLLECTION_PRODUCT_PAGE_SIZE,
  sortKey = ProductCollectionSortKeys.CollectionDefault,
  reverse = false,
): Promise<ProductSummary[]> {
  const result = await getCollectionProductsWithFilters(
    handle,
    first,
    sortKey,
    reverse,
  )

  return result.products
}

export async function getCollectionProductsWithFilters(
  handle: string,
  first = COLLECTION_PRODUCT_PAGE_SIZE,
  sortKey = ProductCollectionSortKeys.CollectionDefault,
  reverse = false,
  filters: ProductFilter[] = [],
  after?: string | null,
): Promise<CollectionProductsResult> {
  'use cache'
  cacheTag('collection', `collection-${handle}`)
  cacheLife('hours')

  const data = await shopifyFetch({
    query: GetCollectionProductsDocument,
    variables: { handle, first, after, sortKey, reverse, filters },
  })

  if (!data.collection) {
    return {
      products: [],
      filters: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    }
  }

  const products = data.collection.products.edges.map((edge) =>
    reshapeCollectionProductSummary(edge.node),
  )
  const productFilters = data.collection.products.filters.map(
    reshapeCollectionProductFilter,
  )

  return {
    products,
    filters: productFilters,
    pageInfo: {
      hasNextPage: data.collection.products.pageInfo.hasNextPage,
      endCursor: data.collection.products.pageInfo.endCursor ?? null,
    },
  }
}

type CollectionCursorIndexEntry = {
  cursor: string
  tags: string[]
}

function getMatchingEntryIndexes(
  entries: CollectionCursorIndexEntry[],
  matchTag: string,
): number[] {
  return entries.reduce<number[]>((indexes, entry, index) => {
    if (entry.tags.includes(matchTag)) indexes.push(index)
    return indexes
  }, [])
}

/**
 * Fetch cursor index for a collection (cursor + tags per edge, no other
 * product fields). Chunks at SHOPIFY_PAGE_SIZE (250) to handle collections
 * larger than 250 products. Returns all entries so that any page's `after`
 * cursor can be resolved in O(1). Tags ride along because Shopify silently
 * ignores `{ tag }` ProductFilters when the store has no tag facets enabled —
 * category views must derive their page set client-side from this index.
 *
 * This is the single cached index entry shared by `getCollectionPageIndex`,
 * `getCollectionTagCounts`, and `getCollectionProductsPage`, so total-pages
 * and cursor resolution come from one snapshot and cannot diverge mid-render.
 * Cached with the same policy as product fetches (D-11).
 */
async function fetchCollectionCursorIndex(
  handle: string,
  sortKey: ProductCollectionSortKeys,
  reverse: boolean,
  filters: ProductFilter[],
): Promise<CollectionCursorIndexEntry[]> {
  'use cache'
  cacheTag('collection', `collection-${handle}`)
  cacheLife('hours')

  const entries: CollectionCursorIndexEntry[] = []
  let after: string | null | undefined
  let hasNextPage = true

  while (hasNextPage) {
    const data: GetCollectionCursorIndexQuery = await shopifyFetch({
      query: GetCollectionCursorIndexDocument,
      variables: {
        handle,
        first: SHOPIFY_PAGE_SIZE,
        after,
        sortKey,
        reverse,
        filters,
      },
    })

    if (!data.collection) break

    const edges = data.collection.products.edges
    entries.push(
      ...edges.map((edge) => ({ cursor: edge.cursor, tags: edge.node.tags })),
    )
    hasNextPage = data.collection.products.pageInfo.hasNextPage
    after = data.collection.products.pageInfo.endCursor
  }

  return entries
}

/**
 * Returns total product count, true total pages, and the `after` cursor
 * for page N (i.e. the cursor at position `(N-1) * pageSize - 1`).
 *
 * When `matchTag` is given, page math runs over the products carrying that
 * tag: `totalPages` is based on matching products (not raw collection pages),
 * and `displayPageToRawPage` maps each display page to the raw page containing
 * its first matching product.
 * Needed because Shopify ignores `{ tag }` filters without tag facets, so
 * the raw index spans the whole collection while the view shows a subset.
 *
 * Thin derivation over the cached cursor index — caching lives on
 * `fetchCollectionCursorIndex` so this and `getCollectionProductsPage`
 * always read the same index snapshot (D-11).
 */
export async function getCollectionPageIndex(
  handle: string,
  pageSize = COLLECTION_PRODUCT_PAGE_SIZE,
  sortKey = ProductCollectionSortKeys.CollectionDefault,
  reverse = false,
  filters: ProductFilter[] = [],
  matchTag: string | null = null,
): Promise<CollectionPageIndex> {
  const entries = await fetchCollectionCursorIndex(
    handle,
    sortKey,
    reverse,
    filters,
  )

  if (matchTag) {
    const matchingIndexes = getMatchingEntryIndexes(entries, matchTag)
    const totalCount = matchingIndexes.length
    const totalPages = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)
    const displayPageToRawPage = matchingIndexes.length
      ? Array.from(
          { length: totalPages },
          (_, pageIndex) =>
            Math.floor(matchingIndexes[pageIndex * pageSize] / pageSize) + 1,
        )
      : []

    return {
      totalCount,
      totalPages,
      afterCursor: null,
      displayPageToRawPage: displayPageToRawPage.length
        ? displayPageToRawPage
        : [1],
    }
  }

  const totalCount = entries.length
  const totalPages = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize)

  return {
    totalCount,
    totalPages,
    // afterCursor for page N is the cursor at index (N-1)*pageSize - 1
    // This is resolved by getCollectionProductsPage per call
    afterCursor: null,
    displayPageToRawPage: null,
  }
}

/**
 * Tag → product count across the entire collection index. Derived from the
 * same cached cursor index as `getCollectionPageIndex`, so calling both with
 * identical arguments costs no extra Shopify requests. Used for category
 * facet counts because Shopify returns no tag facet for this store and
 * per-page counting undercounts multi-page collections.
 */
export async function getCollectionTagCounts(
  handle: string,
  sortKey = ProductCollectionSortKeys.CollectionDefault,
  reverse = false,
  filters: ProductFilter[] = [],
): Promise<Record<string, number>> {
  const entries = await fetchCollectionCursorIndex(
    handle,
    sortKey,
    reverse,
    filters,
  )
  const counts: Record<string, number> = {}

  for (const entry of entries) {
    for (const tag of entry.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1
    }
  }

  return counts
}

/**
 * Returns the `after` cursor to use for fetching page N.
 * For page 1 returns null (fetch from the start).
 * For page N returns the cursor at position (N-1)*pageSize - 1 in the full index.
 */
function resolveAfterCursor(
  entries: CollectionCursorIndexEntry[],
  page: number,
  pageSize: number,
): string | null {
  if (page <= 1) return null
  const cursorIndex = (page - 1) * pageSize - 1
  return (
    entries[cursorIndex]?.cursor ?? entries[entries.length - 1]?.cursor ?? null
  )
}

/**
 * Fetch a single page of products for a collection, using the cursor index
 * to resolve the `after` cursor for page N without sequential product-payload requests.
 *
 * Caching lives on the underlying `fetchCollectionCursorIndex` and
 * `getCollectionProductsWithFilters` entries, so cursor resolution here uses
 * the same index snapshot as `getCollectionPageIndex` (D-11). Page 1 never
 * needs a cursor, so it skips index resolution entirely.
 */
export async function getCollectionProductsPage(
  handle: string,
  page = 1,
  first = COLLECTION_PRODUCT_PAGE_SIZE,
  sortKey = ProductCollectionSortKeys.CollectionDefault,
  reverse = false,
  filters: ProductFilter[] = [],
  matchTag: string | null = null,
): Promise<CollectionProductsResult> {
  if (matchTag) {
    const entries = await fetchCollectionCursorIndex(
      handle,
      sortKey,
      reverse,
      filters,
    )
    const matchingIndexes = getMatchingEntryIndexes(entries, matchTag)
    const displayStart = (page - 1) * first
    const displayEnd = Math.min(displayStart + first, matchingIndexes.length)

    if (displayStart >= matchingIndexes.length) {
      return {
        products: [],
        filters: [],
        pageInfo: { hasNextPage: false, endCursor: null },
      }
    }

    const firstMatchingIndex = matchingIndexes[displayStart]
    const lastMatchingIndex = matchingIndexes[displayEnd - 1]
    const firstRawPage = Math.floor(firstMatchingIndex / first) + 1
    const lastRawPage = Math.floor(lastMatchingIndex / first) + 1
    const rawPages = Array.from(
      { length: lastRawPage - firstRawPage + 1 },
      (_, index) => firstRawPage + index,
    )
    const rawResults = await Promise.all(
      rawPages.map((rawPage) =>
        getCollectionProductsWithFilters(
          handle,
          first,
          sortKey,
          reverse,
          filters,
          resolveAfterCursor(entries, rawPage, first),
        ),
      ),
    )
    const matchingProducts = rawResults
      .flatMap((result) => result.products)
      .filter((product) => product.tags.includes(matchTag))
    const firstRawPageStartIndex = (firstRawPage - 1) * first
    const matchingOffset = matchingIndexes
      .slice(0, displayStart)
      .filter((index) => index >= firstRawPageStartIndex).length

    return {
      products: matchingProducts.slice(matchingOffset, matchingOffset + first),
      filters: rawResults[0]?.filters ?? [],
      pageInfo: {
        hasNextPage: displayEnd < matchingIndexes.length,
        endCursor: rawResults.at(-1)?.pageInfo.endCursor ?? null,
      },
    }
  }

  // Resolve cursor for page N via the index (id-only, no product fields)
  const after =
    page <= 1
      ? null
      : resolveAfterCursor(
          await fetchCollectionCursorIndex(handle, sortKey, reverse, filters),
          page,
          first,
        )

  return getCollectionProductsWithFilters(
    handle,
    first,
    sortKey,
    reverse,
    filters,
    after,
  )
}
