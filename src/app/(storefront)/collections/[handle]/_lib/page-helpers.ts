import { isPublicCollection } from '@/lib/shopify/collection-content'
import {
  FilterType,
  type CollectionFilterValue,
  type CollectionProductFilter,
  type CollectionProductSummary,
  type CollectionSummary,
  ProductCollectionSortKeys,
  type ProductFilter,
} from '@/lib/shopify/types'

export {
  cleanHeroDescription,
  getDescriptionHeroImage,
  getHeroImage,
  getLegacyCollectionBannerImage,
  normalizeHtml,
  parseCollectionRichHero,
  shouldRenderRichDescription,
  truncateMetaDescription,
} from '@/lib/shopify/collection-content'
export type {
  HeroImage,
  CollectionRichHero,
} from '@/lib/shopify/collection-content'

const CATEGORY_TAG_PREFIX = 'categories_'

export const SORT_MAP: Record<
  string,
  { sortKey: ProductCollectionSortKeys; reverse: boolean }
> = {
  featured: {
    sortKey: ProductCollectionSortKeys.CollectionDefault,
    reverse: false,
  },
  'best-selling': {
    sortKey: ProductCollectionSortKeys.BestSelling,
    reverse: false,
  },
  'title-asc': { sortKey: ProductCollectionSortKeys.Title, reverse: false },
  'title-desc': { sortKey: ProductCollectionSortKeys.Title, reverse: true },
  'price-asc': { sortKey: ProductCollectionSortKeys.Price, reverse: false },
  'price-desc': { sortKey: ProductCollectionSortKeys.Price, reverse: true },
  newest: { sortKey: ProductCollectionSortKeys.Created, reverse: true },
  oldest: { sortKey: ProductCollectionSortKeys.Created, reverse: false },
}

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export function paramValues(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value
  return value ? [value] : []
}

function isProductFilterInput(value: unknown): value is ProductFilter {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isVendorProductFilter(value: ProductFilter): boolean {
  return typeof value.productVendor === 'string' && value.productVendor !== ''
}

function isAvailabilityProductFilter(value: ProductFilter): boolean {
  return typeof value.available === 'boolean'
}

function isPriceProductFilter(value: ProductFilter): boolean {
  return typeof value.price === 'object' && value.price !== null
}

function isCategoryTag(value: string): boolean {
  return value.startsWith(CATEGORY_TAG_PREFIX)
}

function isCategoryProductFilter(value: ProductFilter): boolean {
  return typeof value.tag === 'string' && isCategoryTag(value.tag)
}

function isSerializedVendorFilter(value: string): boolean {
  try {
    const parsed: unknown = JSON.parse(value)
    return isProductFilterInput(parsed) && isVendorProductFilter(parsed)
  } catch {
    return false
  }
}

function isSerializedAvailabilityFilter(value: string): boolean {
  try {
    const parsed: unknown = JSON.parse(value)
    return isProductFilterInput(parsed) && isAvailabilityProductFilter(parsed)
  } catch {
    return false
  }
}

export function isVendorFilter(filter: CollectionProductFilter): boolean {
  return (
    filter.id.toLowerCase().includes('vendor') ||
    filter.label.trim().toLowerCase() === 'vendor' ||
    filter.values.some((value) => isSerializedVendorFilter(value.input))
  )
}

export function isAvailabilityFilter(filter: CollectionProductFilter): boolean {
  return (
    filter.id.toLowerCase().includes('availability') ||
    filter.label.trim().toLowerCase() === 'availability' ||
    filter.values.some((value) => isSerializedAvailabilityFilter(value.input))
  )
}

export function isCategoryFilter(filter: CollectionProductFilter): boolean {
  return filter.values.some((value) => {
    try {
      const parsed: unknown = JSON.parse(value.input)
      return isProductFilterInput(parsed) && isCategoryProductFilter(parsed)
    } catch {
      return false
    }
  })
}

export function isPriceFilter(filter: CollectionProductFilter): boolean {
  return (
    filter.type === FilterType.PriceRange ||
    filter.id.toLowerCase().includes('price') ||
    filter.label.trim().toLowerCase() === 'price' ||
    filter.values.some((value) => {
      try {
        const parsed: unknown = JSON.parse(value.input)
        return isProductFilterInput(parsed) && isPriceProductFilter(parsed)
      } catch {
        return false
      }
    })
  )
}

export function getCategoryFilterInput(tag: string): string {
  return JSON.stringify({ tag })
}

function formatCategoryLabel(tag: string): string {
  return tag
    .slice(CATEGORY_TAG_PREFIX.length)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toFilterId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function toCategoryPathSegment(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getPath(handle: string): string {
  return `/collections/${handle}`
}

/**
 * Parse a `page` query-param value into a valid 1-based page number.
 * Returns 1 for missing, invalid, zero, negative, decimal, or NaN values.
 */
export { getCollectionPageNumber as parsePageParam } from '@/lib/shopify/collection-content'

function withQuery(
  href: string,
  sort: string,
  selectedFilters: string[] = [],
  page?: number | null,
  query?: string,
): string {
  const params = new URLSearchParams()
  if (sort !== 'featured') params.set('sort', sort)
  selectedFilters.forEach((filter) => params.append('filter', filter))
  if (query) params.set('q', query)
  // Omit page=1 from URLs (clean base URL == page 1)
  if (page && page > 1) params.set('page', String(page))
  const queryString = params.toString()

  return queryString ? `${href}?${queryString}` : href
}

export function getHref(
  handle: string,
  sort: string,
  selectedFilters: string[] = [],
  query?: string,
): string {
  // Sort/filter hrefs always drop the page param (D-25)
  return withQuery(getPath(handle), sort, selectedFilters, undefined, query)
}

function getCategoryHref(
  handle: string,
  tag: string,
  sort: string,
  selectedFilters: string[],
  query?: string,
): string {
  // Sort/filter/category hrefs always drop the page param (D-25)
  return withQuery(
    `${getPath(handle)}/${toCategoryPathSegment(tag)}`,
    sort,
    selectedFilters,
    undefined,
    query,
  )
}

export function getPaginationHref({
  category,
  handle,
  page,
  selectedFilters,
  sort,
  query,
}: {
  category: string | undefined
  handle: string
  page: number
  selectedFilters: string[]
  sort: string
  query?: string
}): string {
  // category is a raw route param and these hrefs become redirect targets —
  // normalize to the safe [a-z0-9_-] segment charset like getCategoryHref does
  const path = category
    ? `${getPath(handle)}/${toCategoryPathSegment(normalizeCategoryPathSegment(category))}`
    : getPath(handle)

  return withQuery(path, sort, selectedFilters, page, query)
}

function compareSidebarCollections(
  first: CollectionSummary,
  second: CollectionSummary,
): number {
  if (first.handle === 'all') return -1
  if (second.handle === 'all') return 1
  return first.title.localeCompare(second.title)
}

export function getSidebarCollections(
  collections: CollectionSummary[],
): CollectionSummary[] {
  return collections
    .filter((collection) => isPublicCollection(collection.handle))
    .sort(compareSidebarCollections)
}

function getCategoryTags(products: CollectionProductSummary[]): string[] {
  return Array.from(
    new Set(products.flatMap((product) => product.tags.filter(isCategoryTag))),
  )
}

function getCategoryTagFromFilterValue(
  value: CollectionFilterValue,
): string | null {
  try {
    const parsed: unknown = JSON.parse(value.input)
    if (!isProductFilterInput(parsed) || !isCategoryProductFilter(parsed)) {
      return null
    }

    return parsed.tag ?? null
  } catch {
    return null
  }
}

function getCategoryTagsFromFilters(
  filters: CollectionProductFilter[],
): string[] {
  return Array.from(
    new Set(
      filters.flatMap((filter) =>
        filter.values
          .map(getCategoryTagFromFilterValue)
          .filter((tag): tag is string => tag !== null),
      ),
    ),
  )
}

function normalizeCategoryPathSegment(value: string): string {
  try {
    return decodeURIComponent(value).toLowerCase()
  } catch {
    return value.toLowerCase()
  }
}

export function matchCategoryTag(
  category: string,
  tags: string[],
): string | null {
  const normalizedCategory = normalizeCategoryPathSegment(category)

  return (
    tags.find((tag) => toCategoryPathSegment(tag) === normalizedCategory) ??
    null
  )
}

export function findCategoryTagForPath(
  category: string | undefined,
  filters: CollectionProductFilter[],
  products: CollectionProductSummary[] = [],
): string | null {
  if (!category) return null
  const categoryTags = getCategoryTagsFromFilters(filters)
  const tags =
    categoryTags.length > 0 ? categoryTags : getCategoryTags(products)

  return matchCategoryTag(category, tags)
}

export function buildCategoryFilter({
  products,
  sourceFilter,
  handle,
  selectedCategoryTag,
  sort,
  selectedFilters,
  query,
  indexTagCounts,
}: {
  products: CollectionProductSummary[]
  sourceFilter?: CollectionProductFilter | null
  handle: string
  selectedCategoryTag: string | null
  sort: string
  selectedFilters: string[]
  query?: string
  /** Full-collection tag counts from the cursor index — see getCollectionTagCounts */
  indexTagCounts?: Record<string, number>
}): CollectionProductFilter | null {
  const sourceValues =
    sourceFilter?.values
      .map((value) => {
        const tag = getCategoryTagFromFilterValue(value)
        if (!tag) return null

        return {
          count: value.count,
          id: value.id,
          label: value.label || formatCategoryLabel(tag),
          tag,
        }
      })
      .filter((value): value is NonNullable<typeof value> => value !== null) ??
    []

  const fallbackCounts = new Map<string, number>()

  if (sourceValues.length === 0) {
    // Prefer full-index counts: per-page counting only sees the current page,
    // which undercounts (and can entirely miss) categories on later pages.
    const indexCategoryEntries = Object.entries(indexTagCounts ?? {}).filter(
      ([tag]) => isCategoryTag(tag),
    )

    if (indexCategoryEntries.length > 0) {
      indexCategoryEntries.forEach(([tag, count]) => {
        fallbackCounts.set(tag, count)
      })
    } else {
      products.forEach((product) => {
        product.tags.filter(isCategoryTag).forEach((tag) => {
          fallbackCounts.set(tag, (fallbackCounts.get(tag) ?? 0) + 1)
        })
      })
    }
  }

  const categoryValues =
    sourceValues.length > 0
      ? sourceValues
      : Array.from(fallbackCounts.entries()).map(([tag, count]) => ({
          count,
          id: `filter.p.tag.${toFilterId(tag)}`,
          label: formatCategoryLabel(tag),
          tag,
        }))

  const values = categoryValues
    .map(({ count, id, label, tag }) => ({
      id,
      label,
      count,
      input: getCategoryFilterInput(tag),
      href:
        tag === selectedCategoryTag
          ? getHref(handle, sort, selectedFilters, query)
          : getCategoryHref(handle, tag, sort, selectedFilters, query),
    }))
    .sort((first, second) => first.label.localeCompare(second.label))

  if (values.length === 0) return null

  return {
    id: 'filter.p.tag.categories',
    label: 'Category',
    type: FilterType.List,
    values,
  }
}

export function filterProductsByCategoryTags(
  products: CollectionProductSummary[],
  selectedCategoryTag: string | null,
): CollectionProductSummary[] {
  if (!selectedCategoryTag) return products

  return products.filter((product) =>
    product.tags.some((tag) => tag === selectedCategoryTag),
  )
}

export function parseSelectedFilterParams(values: string[]): {
  selectedFilters: string[]
  productFilters: ProductFilter[]
} {
  const selectedFilters: string[] = []
  const productFilters: ProductFilter[] = []

  values.forEach((value) => {
    try {
      const parsed: unknown = JSON.parse(value)
      if (!isProductFilterInput(parsed)) return
      if (
        isVendorProductFilter(parsed) ||
        isAvailabilityProductFilter(parsed) ||
        isPriceProductFilter(parsed) ||
        isCategoryProductFilter(parsed)
      )
        return
      selectedFilters.push(value)
      productFilters.push(parsed)
    } catch {
      return
    }
  })

  return { selectedFilters, productFilters }
}
