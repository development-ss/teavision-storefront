import 'server-only'

import sanitizeHtml from 'sanitize-html'

import { searchanisePublicConfig } from '@/lib/env/public'
import { logEvent } from '@/lib/observability/logger'
import { shopifyFetch } from '@/lib/shopify/client'
import {
  parseProductRating,
  reshapeImage,
  reshapeMoney,
  type MoneyLike,
  type ShopifyImageLike,
} from '@/lib/shopify/operations/mappers'
import type {
  CollectionProductSummary,
  Money,
  ProductVariant,
  ShopifyImage,
} from '@/lib/shopify/types'

import {
  SEARCH_RESULTS_PAGE_SIZE,
  type SearchFilterSelection,
  type SearchSortValue,
  type SearchaniseFacet,
  type SearchaniseFacetType,
  type SearchaniseFacetValue,
  type SearchanisePagination,
  type SearchaniseSearchInput,
  type SearchaniseSearchResult,
  type SearchaniseSearchStatus,
} from './types'

const SEARCHANISE_RESULTS_ENDPOINT = 'https://searchserverapi1.com/getresults'
const MAX_SEARCHANISE_RESULTS = 48
const SEARCHANISE_CURRENCY_CODE = 'AUD'
const SHOPIFY_SEARCH_PAGE_SIZE = 250
const MAX_FALLBACK_FACET_VALUES = 40

const SHOPIFY_SEARCH_QUERY = `
  query SearchProducts(
    $first: Int!
    $after: String
    $query: String!
    $sortKey: ProductSortKeys!
    $reverse: Boolean!
  ) {
    products(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          handle
          title
          description
          updatedAt
          availableForSale
          productType
          tags
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                availableForSale
                currentlyNotInStock
                quantityRule {
                  minimum
                  maximum
                  increment
                }
                price {
                  amount
                  currencyCode
                }
                quantityPriceBreaks(first: 10) {
                  nodes {
                    minimumQuantity
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
          ratingMetafield: metafield(namespace: "reviews", key: "rating") {
            value
          }
          ratingCountMetafield: metafield(namespace: "reviews", key: "rating_count") {
            value
          }
        }
      }
    }
  }
`

type ShopifySearchVariantNode = {
  id: string
  title: string
  availableForSale: boolean
  currentlyNotInStock: boolean
  quantityRule: {
    minimum: number
    maximum: number | null
    increment: number
  }
  price: MoneyLike
  quantityPriceBreaks?: {
    nodes: Array<{ minimumQuantity: number; price: MoneyLike }>
  }
  image?: ShopifyImageLike | null
}

type ShopifySearchProductNode = {
  id: string
  handle: string
  title: string
  description?: string | null
  updatedAt?: string | null
  availableForSale: boolean
  productType: string
  tags: string[]
  featuredImage?: ShopifyImageLike | null
  priceRange: { minVariantPrice: MoneyLike }
  variants: { edges: Array<{ node: ShopifySearchVariantNode }> }
  ratingMetafield?: { value: string } | null
  ratingCountMetafield?: { value: string } | null
}

type ShopifySearchProductsResponse = {
  products: {
    edges: Array<{ node: ShopifySearchProductNode }>
    pageInfo: { hasNextPage: boolean; endCursor?: string | null }
  }
}

const SHOPIFY_SEARCH_SORT: Record<
  SearchSortValue,
  { sortKey: string; reverse: boolean }
> = {
  relevance: { sortKey: 'RELEVANCE', reverse: false },
  'title-asc': { sortKey: 'TITLE', reverse: false },
  'title-desc': { sortKey: 'TITLE', reverse: true },
  'price-asc': { sortKey: 'PRICE', reverse: false },
  'price-desc': { sortKey: 'PRICE', reverse: true },
  newest: { sortKey: 'CREATED_AT', reverse: true },
  // Shopify's BEST_SELLING ordering is already highest-to-lowest by default.
  'best-selling': { sortKey: 'BEST_SELLING', reverse: false },
}

const SORT_PARAMS: Record<
  SearchSortValue,
  { sortBy: string; sortOrder?: 'asc' | 'desc' }
> = {
  relevance: { sortBy: 'relevance' },
  'title-asc': { sortBy: 'title', sortOrder: 'asc' },
  'title-desc': { sortBy: 'title', sortOrder: 'desc' },
  'price-asc': { sortBy: 'price', sortOrder: 'asc' },
  'price-desc': { sortBy: 'price', sortOrder: 'desc' },
  newest: { sortBy: 'created', sortOrder: 'desc' },
  'best-selling': { sortBy: 'sales_amount', sortOrder: 'desc' },
}

function createEmptyResult(
  input: SearchaniseSearchInput,
  status: SearchaniseSearchStatus,
  message?: string,
  errorCode?: string,
): SearchaniseSearchResult {
  const pageSize = clampPageSize(input.pageSize)
  const pagination: SearchanisePagination = {
    currentPage: input.page,
    pageSize,
    totalPages: 1,
    totalItems: 0,
    startIndex: (input.page - 1) * pageSize,
    hasNextPage: false,
    hasPreviousPage: input.page > 1,
  }

  return {
    status,
    query: input.query,
    message,
    errorCode,
    products: [],
    facets: [],
    pagination,
  }
}

function getSearchLogContext(
  input: SearchaniseSearchInput,
): Record<string, unknown> {
  return {
    page: input.page,
    queryLength: input.query.length,
  }
}

function clampPageSize(pageSize = SEARCH_RESULTS_PAGE_SIZE): number {
  if (!Number.isFinite(pageSize)) return SEARCH_RESULTS_PAGE_SIZE

  return Math.min(Math.max(Math.floor(pageSize), 1), MAX_SEARCHANISE_RESULTS)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getString(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key]

  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)

  return undefined
}

function getArray(record: Record<string, unknown>, key: string): unknown[] {
  const value = record[key]

  return Array.isArray(value) ? value : []
}

function getRecord(
  record: Record<string, unknown>,
  key: string,
): Record<string, unknown> | undefined {
  const value = record[key]

  return isRecord(value) ? value : undefined
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string' && value.trim()) {
    const parsed = parseFloat(value)

    if (Number.isFinite(parsed)) return parsed
  }

  return undefined
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase()

    if (['1', 'true', 'yes'].includes(normalizedValue)) return true
    if (['0', 'false', 'no'].includes(normalizedValue)) return false
  }

  return undefined
}

function parseInteger(value: unknown, fallback: number): number {
  const parsed = parseNumber(value)

  return parsed === undefined ? fallback : Math.max(0, Math.floor(parsed))
}

function cleanText(value: string | undefined): string | undefined {
  if (!value) return undefined

  const stripped = sanitizeHtml(value, {
    allowedAttributes: {},
    allowedTags: [],
  })
    // sanitize-html serializes text-safe characters as entities. Convert those
    // back to plain text so React can perform the single escaping pass at render.
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

  return stripped || undefined
}

function normalizeImageUrl(value: string | undefined): string | undefined {
  if (!value) return undefined
  if (value.startsWith('//')) return `https:${value}`
  if (value.startsWith('https://') || value.startsWith('http://')) return value

  return undefined
}

function normalizeStorefrontHref(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined

  try {
    const url = new URL(value, 'https://www.teavision.com.au')

    return `${url.pathname}${url.search}`
  } catch {
    return value.startsWith('/') ? value : undefined
  }
}

function extractProductHandle(link: string | undefined): string | undefined {
  const href = normalizeStorefrontHref(link)
  const match = href?.match(/^\/products\/([^/?#]+)/)

  if (!match?.[1]) return undefined

  return decodeURIComponent(match[1])
}

function normalizePrice(value: unknown): Money {
  const parsed = parseNumber(value) ?? 0

  return {
    amount: parsed.toFixed(2),
    currencyCode: SEARCHANISE_CURRENCY_CODE,
  }
}

function normalizeShopifyVariantId(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined
  if (value.startsWith('gid://shopify/ProductVariant/')) return value

  return `gid://shopify/ProductVariant/${value}`
}

function parseAvailability(
  record: Record<string, unknown>,
): boolean | undefined {
  const quantityTotal = parseNumber(record.quantity_total)
  const quantity = parseNumber(record.quantity)
  const nextQuantity = quantityTotal ?? quantity

  if (nextQuantity === undefined) return undefined

  return nextQuantity > 0
}

function createVariantTitle(
  options: Record<string, unknown> | undefined,
): string {
  if (!options) return 'Default Title'

  const values = Object.values(options)
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean)

  return values.length > 0 ? values.join(' / ') : 'Default Title'
}

function mapVariant(value: unknown): ProductVariant | null {
  if (!isRecord(value)) return null

  const id = normalizeShopifyVariantId(getString(value, 'variant_id'))

  if (!id) return null

  const quantity = parseNumber(value.quantity_total)
  const imageUrl = normalizeImageUrl(getString(value, 'image_link'))
  const image: ShopifyImage | null = imageUrl
    ? {
        url: imageUrl,
        altText: cleanText(getString(value, 'image_alt')) ?? null,
        width: 640,
        height: 640,
      }
    : null

  return {
    id,
    title: createVariantTitle(getRecord(value, 'options')),
    availableForSale: parseBoolean(value.available) ?? (quantity ?? 0) > 0,
    quantityAvailable: quantity,
    price: normalizePrice(value.price),
    quantityPriceBreaks: [],
    image,
  }
}

function createFallbackVariant(
  record: Record<string, unknown>,
): ProductVariant | null {
  const id = normalizeShopifyVariantId(getString(record, 'add_to_cart_id'))

  if (!id) return null

  const quantity = parseNumber(record.quantity_total)

  return {
    id,
    title: 'Default Title',
    availableForSale: parseAvailability(record) ?? true,
    quantityAvailable: quantity,
    price: normalizePrice(record.price),
    quantityPriceBreaks: [],
    image: null,
  }
}

function parseTags(value: unknown): string[] {
  const rawTags = Array.isArray(value) ? value : [value]

  return rawTags
    .filter((tag): tag is string => typeof tag === 'string')
    .flatMap((tag) => tag.split('[:ATTR:]'))
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function mapProduct(value: unknown): CollectionProductSummary | null {
  if (!isRecord(value)) return null

  const title = cleanText(getString(value, 'title'))
  const handle = extractProductHandle(getString(value, 'link'))

  if (!title || !handle) return null

  const rawVariants = getArray(value, 'shopify_variants')
  const variants = rawVariants
    .map(mapVariant)
    .filter((variant): variant is ProductVariant => variant !== null)
  const fallbackVariant =
    variants.length === 0 ? createFallbackVariant(value) : null
  const productVariants = fallbackVariant ? [fallbackVariant] : variants
  const imageUrl = normalizeImageUrl(getString(value, 'image_link'))
  const featuredImage: ShopifyImage | null = imageUrl
    ? {
        url: imageUrl,
        altText: title,
        width: 640,
        height: 640,
      }
    : null

  return {
    id: getString(value, 'product_id') ?? handle,
    handle,
    title,
    description: cleanText(getString(value, 'description')),
    availableForSale:
      parseAvailability(value) ??
      productVariants.some((variant) => variant.availableForSale),
    featuredImage,
    priceRange: {
      minVariantPrice: normalizePrice(value.price),
    },
    productType: cleanText(getString(value, 'product_type')) ?? '',
    tags: parseTags(value.tags),
    variants: productVariants,
  }
}

function normalizeFacetType(value: string | undefined): SearchaniseFacetType {
  if (value === 'select' || value === 'range' || value === 'slider') {
    return value
  }

  return 'unknown'
}

function createFacetValueLabel(
  bucket: Record<string, unknown>,
  value: string,
): string {
  const title = cleanText(getString(bucket, 'title'))

  if (title) return title

  const from = getString(bucket, 'from')
  const to = getString(bucket, 'to')

  if (from && to) return `${from} - ${to}`
  if (from) return `${from}+`
  if (to) return `Up to ${to}`

  return value
}

function mapFacetValue(
  bucket: unknown,
  attribute: string,
): SearchaniseFacetValue | null {
  if (!isRecord(bucket)) return null

  const rawValue = getString(bucket, 'value')

  if (!rawValue || rawValue.toLowerCase() === 'all') return null

  return {
    id: `${attribute}:${rawValue}`,
    label: createFacetValueLabel(bucket, rawValue),
    value: rawValue,
    count: parseInteger(bucket.count, 0),
    selected: bucket.selected === true || bucket.selected === 'true',
  }
}

function mapFacet(value: unknown): SearchaniseFacet | null {
  if (!isRecord(value)) return null

  const attribute = getString(value, 'attribute')
  const label = cleanText(getString(value, 'title'))

  if (!attribute || !label) return null

  const values = getArray(value, 'buckets')
    .map((bucket) => mapFacetValue(bucket, attribute))
    .filter((bucket): bucket is SearchaniseFacetValue => bucket !== null)

  if (values.length === 0) return null

  return {
    attribute,
    label,
    type: normalizeFacetType(getString(value, 'type')),
    values,
  }
}

function escapeRestrictValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/,/g, '\\,')
}

function groupFilters(filters: SearchFilterSelection[]): Map<string, string[]> {
  const groupedFilters = new Map<string, string[]>()

  filters.forEach((filter) => {
    const currentValues = groupedFilters.get(filter.attribute) ?? []

    if (!currentValues.includes(filter.value)) {
      groupedFilters.set(filter.attribute, [...currentValues, filter.value])
    }
  })

  return groupedFilters
}

function buildSearchaniseUrl(
  input: SearchaniseSearchInput,
  apiKey: string,
): URL {
  const pageSize = clampPageSize(input.pageSize)
  const startIndex = Math.max(0, (input.page - 1) * pageSize)
  const sortParams = SORT_PARAMS[input.sort]
  const url = new URL(SEARCHANISE_RESULTS_ENDPOINT)

  url.searchParams.set('apiKey', apiKey)
  url.searchParams.set('q', input.query)
  url.searchParams.set('output', 'json')
  url.searchParams.set('items', 'true')
  url.searchParams.set('facets', 'true')
  url.searchParams.set('categories', 'false')
  url.searchParams.set('pages', 'false')
  url.searchParams.set('facetsShowUnavailableOptions', 'false')
  url.searchParams.set('maxResults', String(pageSize))
  url.searchParams.set('startIndex', String(startIndex))
  url.searchParams.set('sortBy', sortParams.sortBy)

  if (sortParams.sortOrder) {
    url.searchParams.set('sortOrder', sortParams.sortOrder)
  }

  groupFilters(input.filters).forEach((values, attribute) => {
    url.searchParams.set(
      `restrictBy[${attribute}]`,
      values.map(escapeRestrictValue).join('|'),
    )
  })

  return url
}

function parsePagination(
  response: Record<string, unknown>,
  input: SearchaniseSearchInput,
): SearchanisePagination {
  const pageSize = clampPageSize(input.pageSize)
  const totalItems = parseInteger(response.totalItems, 0)
  const startIndex = parseInteger(
    response.startIndex,
    (input.page - 1) * pageSize,
  )
  const itemsPerPage = parseInteger(response.itemsPerPage, pageSize) || pageSize
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const currentPage = Math.min(
    Math.max(1, Math.floor(startIndex / itemsPerPage) + 1),
    totalPages,
  )

  return {
    currentPage,
    pageSize: itemsPerPage,
    totalPages,
    totalItems,
    startIndex,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }
}

function mapResponse(
  response: unknown,
  input: SearchaniseSearchInput,
): SearchaniseSearchResult {
  if (!isRecord(response)) {
    return createEmptyResult(
      input,
      'error',
      'Search results are unavailable right now.',
    )
  }

  const errorCode = getString(response, 'error')

  if (errorCode) {
    logEvent('warn', 'searchanise_failed', {
      ...getSearchLogContext(input),
      errorCode,
      status: 'provider-error',
    })

    return createEmptyResult(
      input,
      'error',
      'Search results are unavailable right now.',
      errorCode,
    )
  }

  return {
    status: 'success',
    query: input.query,
    correctedQuery: getString(response, 'correctedQuery'),
    products: getArray(response, 'items')
      .map(mapProduct)
      .filter(
        (product): product is CollectionProductSummary => product !== null,
      ),
    facets: getArray(response, 'facets')
      .map(mapFacet)
      .filter((facet): facet is SearchaniseFacet => facet !== null),
    pagination: parsePagination(response, input),
  }
}

function reshapeShopifySearchVariant(
  variant: ShopifySearchVariantNode,
): ProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    currentlyNotInStock: variant.currentlyNotInStock,
    quantityAvailable: null,
    quantityRule: {
      minimum: variant.quantityRule.minimum,
      maximum: variant.quantityRule.maximum,
      increment: variant.quantityRule.increment,
    },
    price: reshapeMoney(variant.price),
    quantityPriceBreaks: (variant.quantityPriceBreaks?.nodes ?? []).map(
      (tier) => ({
        minimumQuantity: tier.minimumQuantity,
        price: reshapeMoney(tier.price),
      }),
    ),
    image: variant.image ? reshapeImage(variant.image) : null,
  }
}

function reshapeShopifySearchProduct(
  product: ShopifySearchProductNode,
): CollectionProductSummary {
  const { rating, reviewCount } = parseProductRating(product)

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description ?? undefined,
    updatedAt: product.updatedAt ?? undefined,
    availableForSale: product.availableForSale,
    productType: product.productType,
    tags: product.tags,
    featuredImage: product.featuredImage
      ? reshapeImage(product.featuredImage)
      : null,
    priceRange: {
      minVariantPrice: reshapeMoney(product.priceRange.minVariantPrice),
    },
    variants: product.variants.edges.map((edge) =>
      reshapeShopifySearchVariant(edge.node),
    ),
    rating,
    reviewCount,
  }
}

function normalizeFilterAttribute(attribute: string): string {
  return attribute
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s-]+/g, '_')
}

function matchesFallbackFilter(
  product: CollectionProductSummary,
  filter: SearchFilterSelection,
): boolean {
  const attribute = normalizeFilterAttribute(filter.attribute)
  const value = filter.value.trim().toLocaleLowerCase()

  if (!value) return true

  if (attribute === 'product_type' || attribute === 'producttype') {
    return product.productType.toLocaleLowerCase() === value
  }

  if (attribute === 'tag' || attribute === 'tags') {
    return product.tags.some((tag) => tag.toLocaleLowerCase() === value)
  }

  if (attribute === 'available' || attribute === 'availability') {
    const available = ['1', 'true', 'yes', 'in_stock'].includes(value)
    return product.availableForSale === available
  }

  // Unknown provider-specific filters stay visible rather than making the
  // fallback silently claim that no products match.
  return true
}

function hasSelectedFilter(
  filters: SearchFilterSelection[],
  attribute: string,
  value: string,
): boolean {
  return filters.some(
    (filter) =>
      normalizeFilterAttribute(filter.attribute) === attribute &&
      filter.value.toLocaleLowerCase() === value.toLocaleLowerCase(),
  )
}

function createFallbackFacet(
  attribute: string,
  label: string,
  values: Array<{ value: string; count: number }>,
  filters: SearchFilterSelection[],
): SearchaniseFacet | null {
  const uniqueValues = new Map<string, { label: string; count: number }>()

  values.forEach(({ value, count }) => {
    const normalizedValue = value.trim()
    if (!normalizedValue) return

    const key = normalizedValue.toLocaleLowerCase()
    const current = uniqueValues.get(key)
    uniqueValues.set(key, {
      label: current?.label ?? normalizedValue,
      count: (current?.count ?? 0) + count,
    })
  })

  const facetValues = [...uniqueValues.entries()]
    .sort(([, first], [, second]) => second.count - first.count)
    .slice(0, MAX_FALLBACK_FACET_VALUES)
    .map(([key, entry]) => ({
      id: `${attribute}:${key}`,
      label: entry.label,
      value: entry.label,
      count: entry.count,
      selected: hasSelectedFilter(filters, attribute, entry.label),
    }))

  return facetValues.length > 0
    ? { attribute, label, type: 'select', values: facetValues }
    : null
}

function createFallbackFacets(
  products: CollectionProductSummary[],
  filters: SearchFilterSelection[],
): SearchaniseFacet[] {
  const productTypeValues = products.map((product) => ({
    value: product.productType,
    count: 1,
  }))
  const tagValues = products.flatMap((product) =>
    product.tags.map((tag) => ({ value: tag, count: 1 })),
  )
  const availabilityValues = products.map((product) => ({
    value: product.availableForSale ? 'true' : 'false',
    count: 1,
  }))

  return [
    createFallbackFacet(
      'product_type',
      'Product type',
      productTypeValues,
      filters,
    ),
    createFallbackFacet('tag', 'Tags', tagValues, filters),
    createFallbackFacet(
      'available',
      'Availability',
      availabilityValues,
      filters,
    ),
  ].filter((facet): facet is SearchaniseFacet => facet !== null)
}

async function fetchShopifySearchProducts(
  input: SearchaniseSearchInput,
): Promise<CollectionProductSummary[]> {
  const sort = SHOPIFY_SEARCH_SORT[input.sort]
  const products: CollectionProductSummary[] = []
  let after: string | null = null

  while (true) {
    const response: ShopifySearchProductsResponse =
      await shopifyFetch<ShopifySearchProductsResponse>({
        query: SHOPIFY_SEARCH_QUERY,
        variables: {
          after,
          first: SHOPIFY_SEARCH_PAGE_SIZE,
          query: input.query,
          reverse: sort.reverse,
          sortKey: sort.sortKey,
        },
      })
    const page: ShopifySearchProductsResponse['products'] = response.products

    products.push(
      ...page.edges.map((edge) => reshapeShopifySearchProduct(edge.node)),
    )

    if (!page.pageInfo.hasNextPage || !page.pageInfo.endCursor) break

    if (page.pageInfo.endCursor === after) {
      logEvent('warn', 'searchanise_failed', {
        ...getSearchLogContext(input),
        status: 'shopify-fallback-repeated-cursor',
      })
      break
    }

    after = page.pageInfo.endCursor
  }

  return products
}

async function getShopifyFallbackResult(
  input: SearchaniseSearchInput,
): Promise<SearchaniseSearchResult> {
  try {
    const allProducts = await fetchShopifySearchProducts(input)
    const filteredProducts = allProducts.filter((product) =>
      input.filters.every((filter) => matchesFallbackFilter(product, filter)),
    )
    const pageSize = clampPageSize(input.pageSize)
    const totalItems = filteredProducts.length
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
    const currentPage = Math.min(Math.max(1, input.page), totalPages)
    const startIndex = (currentPage - 1) * pageSize

    return {
      status: 'success',
      query: input.query,
      products: filteredProducts.slice(startIndex, startIndex + pageSize),
      facets: createFallbackFacets(allProducts, input.filters),
      pagination: {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        startIndex,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    }
  } catch {
    logEvent('warn', 'searchanise_failed', {
      ...getSearchLogContext(input),
      status: 'shopify-fallback-failed',
    })

    return createEmptyResult(
      input,
      'error',
      'Search results are unavailable right now.',
    )
  }
}

async function getProviderOrFallbackResult(
  input: SearchaniseSearchInput,
  providerResult: SearchaniseSearchResult,
): Promise<SearchaniseSearchResult> {
  const fallbackResult = await getShopifyFallbackResult(input)

  return fallbackResult.status === 'success' ? fallbackResult : providerResult
}

export async function getSearchaniseSearchResults(
  input: SearchaniseSearchInput,
): Promise<SearchaniseSearchResult> {
  if (!input.query) {
    return createEmptyResult(input, 'idle')
  }

  if (!searchanisePublicConfig.enabled || !searchanisePublicConfig.apiKey) {
    return getShopifyFallbackResult(input)
  }

  try {
    const response = await fetch(
      buildSearchaniseUrl(input, searchanisePublicConfig.apiKey),
      {
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      logEvent('warn', 'searchanise_failed', {
        ...getSearchLogContext(input),
        status: response.status,
      })

      return getProviderOrFallbackResult(
        input,
        createEmptyResult(
          input,
          'error',
          'Search results are unavailable right now.',
        ),
      )
    }

    const data: unknown = await response.json()

    const providerResult = mapResponse(data, input)

    return providerResult.status === 'error'
      ? getProviderOrFallbackResult(input, providerResult)
      : providerResult
  } catch {
    logEvent('warn', 'searchanise_failed', {
      ...getSearchLogContext(input),
      status: 'exception',
    })

    return getProviderOrFallbackResult(
      input,
      createEmptyResult(
        input,
        'error',
        'Search results are unavailable right now.',
      ),
    )
  }
}
