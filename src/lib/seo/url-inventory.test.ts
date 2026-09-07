import { afterEach, describe, expect, test, vi } from 'vitest'

import {
  DEFAULT_BLOG_HANDLE,
  getArticlePath,
  type BlogArticleSummary,
  type BlogIndex,
} from '@/lib/blog/operations'
import type { ShopifyPageSummary } from '@/lib/shopify/operations/storefront-page'
import type { CollectionSummary, ProductSummary } from '@/lib/shopify/types'

import {
  buildUrlInventoryRows,
  serializeUrlInventoryCsv,
  type UrlInventoryRow,
  type UrlInventorySources,
} from './url-inventory'

vi.mock('server-only', () => ({}))

const CANONICAL_ORIGIN = 'https://www.teavision.com.au'
const PREVIEW_ORIGIN = 'https://phase24-preview.vercel.app'

function createProduct(handle: string, updatedAt?: string): ProductSummary {
  return {
    id: `gid://shopify/Product/${handle}`,
    handle,
    title: handle,
    ...(updatedAt && { updatedAt }),
    featuredImage: null,
    priceRange: {
      minVariantPrice: { amount: '10.00', currencyCode: 'AUD' },
    },
  }
}

function createCollection(
  handle: string,
  updatedAt: string,
): CollectionSummary {
  return {
    id: `gid://shopify/Collection/${handle}`,
    handle,
    title: handle,
    description: '',
    featuredImage: null,
    updatedAt,
    seo: { title: null, description: null },
  }
}

function createPage(handle: string, updatedAt: string): ShopifyPageSummary {
  return {
    id: `gid://shopify/Page/${handle}`,
    handle,
    title: handle,
    bodySummary: '',
    updatedAt,
    seo: { title: null, description: null },
  }
}

function createArticle(
  handle: string,
  options: {
    publishedAt?: string
    noIndex?: boolean
    canonicalPath?: string | null
  } = {},
): BlogArticleSummary {
  return {
    id: handle,
    handle,
    title: handle,
    excerpt: '',
    featuredImage: null,
    publishedAt: options.publishedAt ?? '2026-07-09T04:30:00+10:00',
    tags: [],
    authorName: null,
    seo: {
      title: null,
      description: null,
      canonicalPath: options.canonicalPath ?? null,
      noIndex: options.noIndex ?? false,
      ogImage: null,
    },
    readingTimeMinutes: 1,
  }
}

function createBlog(articles: BlogArticleSummary[]): BlogIndex {
  return {
    id: 'blog',
    handle: DEFAULT_BLOG_HANDLE,
    title: 'Tea Journal',
    description: '',
    heroImage: null,
    seo: {
      title: null,
      description: null,
      canonicalPath: null,
      noIndex: false,
      ogImage: null,
    },
    articles,
    featuredArticles: [],
  }
}

function createSources(): UrlInventorySources {
  const pathCanonicalArticle = createArticle('path-canonical', {
    publishedAt: '2026-07-09T04:30:00+10:00',
    canonicalPath: getArticlePath(DEFAULT_BLOG_HANDLE, 'path-canonical'),
  })
  const absoluteCanonicalArticle = createArticle('absolute-canonical', {
    publishedAt: '2026-07-08',
    canonicalPath: `${CANONICAL_ORIGIN}${getArticlePath(
      DEFAULT_BLOG_HANDLE,
      'absolute-canonical',
    )}`,
  })

  return {
    products: [
      createProduct('first-product', '2026-07-01'),
      createProduct('last-product'),
    ],
    collections: [
      createCollection('first-collection', '2026-07-02'),
      createCollection('last-collection', '2026-07-03'),
    ],
    pages: [
      createPage('consultant-page', '2026-07-04'),
      createPage('download-catalogues', '2026-07-05'),
      createPage('search-results', '2026-07-06'),
      createPage('test-page', '2026-07-07'),
    ],
    blog: createBlog([
      pathCanonicalArticle,
      absoluteCanonicalArticle,
      createArticle('implicit-canonical', { publishedAt: '2026-07-07' }),
      createArticle('noindex-article', { noIndex: true }),
      createArticle('external-canonical', {
        canonicalPath: 'https://example.com/external-canonical',
      }),
      createArticle('different-local-canonical', {
        canonicalPath: getArticlePath(DEFAULT_BLOG_HANDLE, 'other-article'),
      }),
    ]),
  }
}

function rowPaths(rows: readonly UrlInventoryRow[]): string[] {
  return rows.map((row) => new URL(row.url).pathname)
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('buildUrlInventoryRows', () => {
  test('assembles the complete finite public content universe', () => {
    const rows = buildUrlInventoryRows(createSources())
    const paths = rowPaths(rows)
    const countsByType = Object.fromEntries(
      [
        'static',
        'legal',
        'page',
        'product',
        'collection',
        'blog',
        'article',
      ].map((type) => [type, rows.filter((row) => row.type === type).length]),
    )

    expect(countsByType).toEqual({
      static: 16,
      legal: 5,
      page: 1,
      product: 2,
      collection: 2,
      blog: 1,
      article: 3,
    })
    expect(rows).toHaveLength(30)
    expect(paths).toEqual(
      expect.arrayContaining([
        '/',
        '/collections',
        '/pages/privacy-policy',
        '/pages/certifications',
        '/pages/download-catalogues',
        '/pages/services',
        '/pages/how-long-does-bulk-tea-last',
        '/pages/consultant-page',
        '/products/first-product',
        '/products/last-product',
        '/collections/first-collection',
        '/collections/last-collection',
        '/blog',
        '/blogs/teavision-blogs/path-canonical',
        '/blogs/teavision-blogs/absolute-canonical',
        '/blogs/teavision-blogs/implicit-canonical',
      ]),
    )
  })

  test('excludes every locked noncanonical or private route category', () => {
    const paths = rowPaths(buildUrlInventoryRows(createSources()))

    expect(paths).not.toEqual(
      expect.arrayContaining([
        '/blogs/teavision-blogs',
        '/api/seo/url-inventory',
        '/account',
        '/account/orders/example',
        '/cart',
        '/search',
        '/blogs/teavision-blogs/search',
        '/blogs/teavision-blogs/tagged/green-tea',
        '/blogs/teavision-blogs/page/2',
        '/collections/first-collection/green-tea',
        '/collections/first-collection/products/first-product',
        '/policies/privacy-policy',
        '/blogs/teavision-blogs/noindex-article',
        '/blogs/teavision-blogs/external-canonical',
        '/blogs/teavision-blogs/different-local-canonical',
        '/pages/search-results',
        '/pages/test-page',
      ]),
    )
    expect(
      paths.filter((path) => path === '/pages/download-catalogues'),
    ).toHaveLength(1)
  })

  test('returns unique canonically hosted rows in code-point order', () => {
    const rows = buildUrlInventoryRows(createSources())
    const urls = rows.map((row) => row.url)

    expect(new Set(urls).size).toBe(urls.length)
    expect(urls).toEqual(
      [...urls].sort((left, right) =>
        left < right ? -1 : left > right ? 1 : 0,
      ),
    )
    expect(
      rows.every((row) => new URL(row.url).origin === CANONICAL_ORIGIN),
    ).toBe(true)
    expect(urls.join('\n')).not.toContain(PREVIEW_ORIGIN)
  })

  test('fails closed when the configured site origin is noncanonical', async () => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SITE_URL', PREVIEW_ORIGIN)

    const { buildUrlInventoryRows: buildWithPreviewOrigin } =
      await import('./url-inventory')

    expect(() => buildWithPreviewOrigin(createSources())).toThrow(
      'canonical production origin',
    )
  })

  test('normalizes dates, preserves missing dates, and rejects malformed dates', () => {
    const rows = buildUrlInventoryRows(createSources())
    const firstProduct = rows.find(
      (row) => new URL(row.url).pathname === '/products/first-product',
    )
    const lastProduct = rows.find(
      (row) => new URL(row.url).pathname === '/products/last-product',
    )
    const blog = rows.find((row) => row.type === 'blog')

    expect(firstProduct?.lastModified).toBe('2026-07-01T00:00:00.000Z')
    expect(lastProduct?.lastModified).toBe('')
    expect(blog?.lastModified).toBe('2026-07-08T18:30:00.000Z')

    const malformed = createSources()
    malformed.products = [createProduct('bad-date', 'not-a-date')]
    expect(() => buildUrlInventoryRows(malformed)).toThrow('Invalid time value')
  })

  test('collapses identical duplicates and rejects conflicting metadata', () => {
    const identical = createSources()
    identical.products = [
      ...identical.products,
      createProduct('first-product', '2026-07-01'),
    ]
    const rows = buildUrlInventoryRows(identical)

    expect(
      rows.filter(
        (row) => new URL(row.url).pathname === '/products/first-product',
      ),
    ).toHaveLength(1)

    const conflicting = createSources()
    conflicting.products = [
      ...conflicting.products,
      createProduct('first-product', '2026-07-02'),
    ]
    expect(() => buildUrlInventoryRows(conflicting)).toThrow(
      'Conflicting URL inventory metadata',
    )
  })
})

describe('serializeUrlInventoryCsv', () => {
  test('emits deterministic quoted five-column CRLF CSV', () => {
    const rows: UrlInventoryRow[] = [
      {
        url: `${CANONICAL_ORIGIN}/products/tea`,
        type: 'product',
        lastModified: 'comma, newline\nquote "value"',
        shouldAppearInSitemap: true,
        shouldIndexWhenEnabled: false,
      },
    ]

    const first = serializeUrlInventoryCsv(rows)
    const second = serializeUrlInventoryCsv(rows)

    expect(first).toBe(second)
    expect(first).toMatch(
      /^"url","type","lastModified","shouldAppearInSitemap","shouldIndexWhenEnabled"\r\n/,
    )
    expect(first).toContain('"comma, newline\nquote ""value""","true","false"')
    expect(first.endsWith('\r\n')).toBe(true)
    expect(first.replaceAll('\r\n', '')).not.toContain('\r')
    expect(first.replaceAll('\r\n', '')).not.toContain('\nline')
  })
})
