import { isPublicCollection } from '@/lib/shopify/collection-content'
import {
  CANONICAL_BLOG_LISTING_PATH,
  DEFAULT_BLOG_HANDLE,
  getArticlePath,
  isLocalCanonicalPath,
  type BlogIndex,
} from '@/lib/blog/operations'
import { LEGAL_POLICIES } from '@/lib/legal/policies'
import { getLaunchSeoRouteExpectations } from '@/lib/seo/launch-route-matrix'
import { isShopifyPageEligibleForSitemap } from '@/lib/seo/shopify-page-eligibility'
import { getSiteUrl, SITE_URL } from '@/lib/seo/site-url'
import {
  getPagePath,
  type ShopifyPageSummary,
} from '@/lib/shopify/operations/storefront-page'
import type { CollectionSummary, ProductSummary } from '@/lib/shopify/types'

type UrlInventoryType =
  | 'static'
  | 'legal'
  | 'page'
  | 'product'
  | 'collection'
  | 'blog'
  | 'article'

export type UrlInventoryRow = {
  url: string
  type: UrlInventoryType
  lastModified: string
  shouldAppearInSitemap: boolean
  shouldIndexWhenEnabled: boolean
}

export type UrlInventorySources = {
  products: readonly ProductSummary[]
  collections: readonly CollectionSummary[]
  pages: readonly ShopifyPageSummary[]
  blog: BlogIndex
}

const CANONICAL_URL_INVENTORY_ORIGIN = 'https://www.teavision.com.au'

const ADDITIONAL_ROUTE_OWNED_PATHS = [
  '/collections',
  '/pages/certifications',
  '/pages/download-catalogues',
  '/pages/how-long-does-bulk-tea-last',
] as const

const CSV_HEADER = [
  'url',
  'type',
  'lastModified',
  'shouldAppearInSitemap',
  'shouldIndexWhenEnabled',
] as const

function normalizeDate(value: string | null | undefined): string {
  if (!value) return ''

  return new Date(value).toISOString()
}

function normalizeUrl(url: string): string {
  return new URL(url).toString()
}

function rowsHaveIdenticalMetadata(
  left: UrlInventoryRow,
  right: UrlInventoryRow,
): boolean {
  return (
    left.type === right.type &&
    left.lastModified === right.lastModified &&
    left.shouldAppearInSitemap === right.shouldAppearInSitemap &&
    left.shouldIndexWhenEnabled === right.shouldIndexWhenEnabled
  )
}

function deduplicateRows(rows: readonly UrlInventoryRow[]): UrlInventoryRow[] {
  const rowsByUrl = new Map<string, UrlInventoryRow>()

  for (const row of rows) {
    const normalizedRow = { ...row, url: normalizeUrl(row.url) }
    const existing = rowsByUrl.get(normalizedRow.url)

    if (!existing) {
      rowsByUrl.set(normalizedRow.url, normalizedRow)
      continue
    }

    if (!rowsHaveIdenticalMetadata(existing, normalizedRow)) {
      throw new Error(
        `Conflicting URL inventory metadata: ${normalizedRow.url}`,
      )
    }
  }

  return [...rowsByUrl.values()].sort((left, right) =>
    left.url < right.url ? -1 : left.url > right.url ? 1 : 0,
  )
}

function createDynamicRow(
  path: string,
  type: Exclude<UrlInventoryType, 'static' | 'legal'>,
  lastModified: string | null | undefined,
): UrlInventoryRow {
  return {
    url: getSiteUrl(path),
    type,
    lastModified: normalizeDate(lastModified),
    shouldAppearInSitemap: true,
    shouldIndexWhenEnabled: true,
  }
}

export function buildUrlInventoryRows(
  sources: UrlInventorySources,
): UrlInventoryRow[] {
  if (new URL(getSiteUrl()).origin !== CANONICAL_URL_INVENTORY_ORIGIN) {
    throw new Error('URL inventory requires the canonical production origin')
  }

  const legalPoliciesByPath = new Map<string, (typeof LEGAL_POLICIES)[number]>(
    LEGAL_POLICIES.map((policy) => [policy.href, policy]),
  )
  const launchExpectations = getLaunchSeoRouteExpectations().filter(
    (expectation) =>
      expectation.expectedStatus === 200 && expectation.shouldAppearInSitemap,
  )
  const routeOwnedPaths = new Set<string>([
    ...launchExpectations.map((expectation) => expectation.path),
    ...ADDITIONAL_ROUTE_OWNED_PATHS,
  ])

  const routeOwnedRows: UrlInventoryRow[] = launchExpectations.map(
    (expectation) => {
      const legalPolicy = legalPoliciesByPath.get(expectation.path)

      return {
        url: getSiteUrl(expectation.path),
        type: legalPolicy ? 'legal' : 'static',
        lastModified: normalizeDate(legalPolicy?.lastReviewed),
        shouldAppearInSitemap: expectation.shouldAppearInSitemap,
        shouldIndexWhenEnabled: expectation.shouldIndexWhenEnabled,
      }
    },
  )

  const additionalRouteOwnedRows: UrlInventoryRow[] =
    ADDITIONAL_ROUTE_OWNED_PATHS.map((path) => ({
      url: getSiteUrl(path),
      type: 'static',
      lastModified: '',
      shouldAppearInSitemap: true,
      shouldIndexWhenEnabled: true,
    }))

  const pageRows = sources.pages
    .filter(
      (page) =>
        isShopifyPageEligibleForSitemap(page.handle) &&
        !routeOwnedPaths.has(getPagePath(page.handle)),
    )
    .map((page) =>
      createDynamicRow(getPagePath(page.handle), 'page', page.updatedAt),
    )
  const productRows = sources.products.map((product) =>
    createDynamicRow(
      `/products/${product.handle}`,
      'product',
      product.updatedAt,
    ),
  )
  const collectionRows = sources.collections
    .filter((collection) => isPublicCollection(collection.handle))
    .map((collection) =>
      createDynamicRow(
        `/collections/${collection.handle}`,
        'collection',
        collection.updatedAt,
      ),
    )
  const eligibleArticles = sources.blog.articles.filter((article) => {
    const localPath = getArticlePath(DEFAULT_BLOG_HANDLE, article.handle)

    return (
      !article.seo.noIndex &&
      isLocalCanonicalPath(article.seo.canonicalPath, localPath, SITE_URL)
    )
  })
  const blogRows = sources.blog.seo.noIndex
    ? []
    : [
        createDynamicRow(
          CANONICAL_BLOG_LISTING_PATH,
          'blog',
          eligibleArticles[0]?.publishedAt,
        ),
      ]
  const articleRows = eligibleArticles.map((article) =>
    createDynamicRow(
      getArticlePath(DEFAULT_BLOG_HANDLE, article.handle),
      'article',
      article.publishedAt,
    ),
  )

  return deduplicateRows([
    ...routeOwnedRows,
    ...additionalRouteOwnedRows,
    ...pageRows,
    ...productRows,
    ...collectionRows,
    ...blogRows,
    ...articleRows,
  ])
}

function quoteCsvField(value: string | boolean): string {
  return `"${String(value).replaceAll('"', '""')}"`
}

export function serializeUrlInventoryCsv(
  rows: readonly UrlInventoryRow[],
): string {
  const records = [
    CSV_HEADER.map(quoteCsvField).join(','),
    ...rows.map((row) =>
      [
        row.url,
        row.type,
        row.lastModified,
        row.shouldAppearInSitemap,
        row.shouldIndexWhenEnabled,
      ]
        .map(quoteCsvField)
        .join(','),
    ),
  ]

  return `${records.join('\r\n')}\r\n`
}
