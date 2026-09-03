import {
  FilterType,
  type CollectionFilterValue,
  type CollectionProductFilter,
  type CollectionProductSummary,
  type CollectionSummary,
  ProductCollectionSortKeys,
  type ProductFilter,
} from '@/lib/shopify/types'

export type HeroImage = {
  url: string
  altText: string | null
  width: number | null
  height: number | null
}

export type CollectionRichHeroAction = {
  href: string
  label: string
}

export type CollectionRichHero = {
  title: string
  introHtml: string
  image: HeroImage
  actions: CollectionRichHeroAction[]
  highlightAction: CollectionRichHeroAction
  footnote: string | null
}

const LEGACY_COLLECTION_BANNER_BLOCK_PATTERN =
  /<div\b[^>]*\bid=["']kk-collection-banner["'][^>]*>[\s\S]*?<h1\b[\s\S]*?<\/h1>\s*<\/div>/gi

const LEGACY_COLLECTION_BANNER_OPENING_TAG_PATTERN =
  /<div\b(?=[^>]*\bid=["']kk-collection-banner["'])[^>]*>/i

const CSS_BACKGROUND_IMAGE_URL_PATTERN =
  /background-image\s*:\s*url\(\s*(?:"([^"]+)"|'([^']+)'|([^)\s]+))\s*\)/i

const LEGACY_READ_MORE_LINK_PATTERN =
  /<a\b(?=[^>]*(?:\bid=["']show-(?:more|less)["']|\bhref=["']#read-(?:more|less)["']))[^>]*>[\s\S]*?<\/a>/gi

const RICH_HERO_MARKER_CLASS = ['bulk', 'header'].join('-')
const CATEGORY_TAG_PREFIX = 'categories_'
const IMAGE_TAG_PATTERN = /<img\b[^>]*>/i
const ATTRIBUTE_PATTERN =
  /\s([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
const DEFAULT_DESCRIPTION_HERO_IMAGE = {
  width: 1600,
  height: 577,
}
const DEFAULT_LEGACY_COLLECTION_BANNER_IMAGE = {
  width: 1130,
  height: 200,
}

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

export function truncateMetaDescription(value: string): string {
  return value.length > 160 ? `${value.slice(0, 157).trimEnd()}…` : value
}

function plainTextFromHtml(html: string): string {
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

function decodeHtmlAttribute(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function decodeHtmlText(value: string): string {
  return decodeHtmlAttribute(value).replace(/\u00a0/g, ' ')
}

function getHtmlAttribute(tag: string, name: string): string | null {
  ATTRIBUTE_PATTERN.lastIndex = 0

  for (const match of tag.matchAll(ATTRIBUTE_PATTERN)) {
    if (match[1]?.toLowerCase() !== name.toLowerCase()) continue

    return decodeHtmlAttribute(match[2] ?? match[3] ?? match[4] ?? '')
  }

  return null
}

function getClassNames(tag: string): string[] {
  return (getHtmlAttribute(tag, 'class') ?? '')
    .split(/\s+/)
    .map((className) => className.trim())
    .filter(Boolean)
}

function getRichHeroSectionHtml(descriptionHtml: string): string | null {
  const sectionPattern = /<section\b[^>]*>[\s\S]*?<\/section>/gi

  for (const match of descriptionHtml.matchAll(sectionPattern)) {
    const sectionHtml = match[0]
    const openingTag = sectionHtml.match(/<section\b[^>]*>/i)?.[0]
    if (!openingTag) continue
    if (getClassNames(openingTag).includes(RICH_HERO_MARKER_CLASS)) {
      return sectionHtml
    }
  }

  return null
}

function getTagInnerHtml(html: string, tagName: string): string[] {
  const tagPattern = new RegExp(
    `<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`,
    'gi',
  )

  return Array.from(html.matchAll(tagPattern), (match) => match[1] ?? '')
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function textFromInlineHtml(html: string): string {
  return decodeHtmlText(stripHtmlTags(html))
}

function sanitizeInlineHtml(html: string): string {
  const allowedInlineTags = new Set(['b', 'em', 'i', 'strong'])

  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?([a-z0-9]+)\b[^>]*>/gi, (tag, tagName: string) => {
      const normalizedTagName = tagName.toLowerCase()
      if (!allowedInlineTags.has(normalizedTagName)) return ''

      return tag.startsWith('</')
        ? `</${normalizedTagName}>`
        : `<${normalizedTagName}>`
    })
    .replace(/\s+/g, ' ')
    .trim()
}

function getRichHeroActions(sectionHtml: string): CollectionRichHeroAction[] {
  const linkPattern = /<a\b[^>]*>[\s\S]*?<\/a>/gi

  return Array.from(sectionHtml.matchAll(linkPattern), (match) => {
    const linkHtml = match[0]
    const openingTag = linkHtml.match(/<a\b[^>]*>/i)?.[0] ?? ''
    const href = getHtmlAttribute(openingTag, 'href') ?? ''
    const label = textFromInlineHtml(linkHtml)

    return { href, label }
  }).filter((action) => action.href && action.label)
}

function isFootnoteText(value: string): boolean {
  return value.toLowerCase().startsWith('minimum order quantity:')
}

function normalizeImageSource(source: string): string {
  if (source.startsWith('//')) return `https:${source}`
  if (source.startsWith('/cdn/shop/'))
    return `https://www.teavision.com.au${source}`

  return source
}

function parsePositiveInteger(value: string | null): number | null {
  if (!value) return null

  const parsedValue = Number.parseInt(value, 10)
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null
}

function parseImageSizeFromSource(
  source: string,
): Pick<HeroImage, 'width' | 'height'> {
  const sizeMatch = source.match(/(?:^|[-_/])(\d{3,5})x(\d{3,5})(?:[._/?-]|$)/i)

  return {
    width: parsePositiveInteger(sizeMatch?.[1] ?? null),
    height: parsePositiveInteger(sizeMatch?.[2] ?? null),
  }
}

export function getDescriptionHeroImage(
  descriptionHtml: string,
): HeroImage | null {
  const imageTag = descriptionHtml.match(IMAGE_TAG_PATTERN)?.[0]
  if (!imageTag) return null

  const source = getHtmlAttribute(imageTag, 'src')
  if (!source) return null

  const sourceSize = parseImageSizeFromSource(source)

  return {
    url: normalizeImageSource(source),
    altText: getHtmlAttribute(imageTag, 'alt'),
    width:
      parsePositiveInteger(getHtmlAttribute(imageTag, 'width')) ??
      sourceSize.width ??
      DEFAULT_DESCRIPTION_HERO_IMAGE.width,
    height:
      parsePositiveInteger(getHtmlAttribute(imageTag, 'height')) ??
      sourceSize.height ??
      DEFAULT_DESCRIPTION_HERO_IMAGE.height,
  }
}

export function getLegacyCollectionBannerImage(
  descriptionHtml: string,
): HeroImage | null {
  const openingTag = descriptionHtml.match(
    LEGACY_COLLECTION_BANNER_OPENING_TAG_PATTERN,
  )?.[0]
  if (!openingTag) return null

  const style = getHtmlAttribute(openingTag, 'style')
  if (!style) return null

  const backgroundImage = style.match(CSS_BACKGROUND_IMAGE_URL_PATTERN)
  const source =
    backgroundImage?.[1] ?? backgroundImage?.[2] ?? backgroundImage?.[3]
  if (!source) return null

  return {
    url: normalizeImageSource(source),
    altText: null,
    width: DEFAULT_LEGACY_COLLECTION_BANNER_IMAGE.width,
    height: DEFAULT_LEGACY_COLLECTION_BANNER_IMAGE.height,
  }
}

export function parseCollectionRichHero(
  descriptionHtml: string,
): CollectionRichHero | null {
  const sectionHtml = getRichHeroSectionHtml(descriptionHtml)
  if (!sectionHtml) return null

  const title = textFromInlineHtml(getTagInnerHtml(sectionHtml, 'h1')[0] ?? '')
  const image = getDescriptionHeroImage(sectionHtml)
  const paragraphHtml = getTagInnerHtml(sectionHtml, 'p')
  const introHtml = paragraphHtml.find(
    (paragraph) => !isFootnoteText(textFromInlineHtml(paragraph)),
  )
  const footnote =
    paragraphHtml.map(textFromInlineHtml).find(isFootnoteText) ?? null
  const actions = getRichHeroActions(sectionHtml)
  const primaryActions = actions.slice(0, 2)
  const highlightAction = actions[2]

  if (
    !title ||
    !introHtml ||
    !image ||
    primaryActions.length !== 2 ||
    !highlightAction
  ) {
    return null
  }

  return {
    title,
    introHtml: sanitizeInlineHtml(introHtml),
    image,
    actions: primaryActions,
    highlightAction,
    footnote,
  }
}

function truncateHeroDescription(value: string): string {
  if (value.length <= 280) return value
  return `${value.slice(0, 277).trimEnd()}…`
}

export function cleanHeroDescription(value: string): string {
  const withoutMarkers = removeCitationMarkers(value)
    .replace(/\s+/g, ' ')
    .trim()
  const lowerValue = withoutMarkers.toLowerCase()
  const discoverIndex = lowerValue.indexOf('discover ')
  const cleaned =
    lowerValue.startsWith('read more about') && discoverIndex > -1
      ? withoutMarkers.slice(discoverIndex)
      : withoutMarkers

  return truncateHeroDescription(cleaned)
}

export function normalizeHtml(html: string): string {
  return removeCitationMarkers(html)
    .replace(LEGACY_COLLECTION_BANNER_BLOCK_PATTERN, '')
    .replace(LEGACY_READ_MORE_LINK_PATTERN, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<figure\b[\s\S]*?<\/figure>/gi, '')
    .replace(/<picture\b[\s\S]*?<\/picture>/gi, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<summary\b[\s\S]*?<\/summary>/gi, '')
    .replace(/<\/?details\b[^>]*>/gi, '')
    .replace(/\s(?:style|class|id|data-[^=]+)="[^"]*"/gi, '')
    .replace(/\s(?:style|class|id|data-[^=]+)='[^']*'/gi, '')
    .replace(/<h[12](\s[^>]*)?>/gi, '<h3>')
    .replace(/<\/h[12]>/gi, '</h3>')
}

export function shouldRenderRichDescription(
  descriptionHtml: string,
  description: string,
): boolean {
  const text = plainTextFromHtml(descriptionHtml)

  return (
    text.length > description.length + 40 ||
    /<(h[1-6]|ul|ol|table|blockquote)\b/i.test(descriptionHtml)
  )
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
export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return 1
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed < 1) return 1
  return parsed
}

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
    .filter((collection) => collection.handle !== 'frontpage')
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

export function getHeroImage(
  featuredImage: HeroImage | null,
  descriptionHtml = '',
): HeroImage | null {
  return (
    getLegacyCollectionBannerImage(descriptionHtml) ??
    getDescriptionHeroImage(descriptionHtml) ??
    featuredImage
  )
}
