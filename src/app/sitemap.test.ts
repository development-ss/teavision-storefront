import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  DEFAULT_BLOG_HANDLE,
  getArticlePath,
  type BlogIndex,
} from '@/lib/blog/operations'
import { getLaunchSeoRouteExpectations } from '@/lib/seo/launch-route-matrix'
import { STATIC_PAGE_LAST_MODIFIED } from '@/lib/seo/static-page-dates'
import { getCollectionSummaries } from '@/lib/shopify/operations/collection'
import { getAllProducts } from '@/lib/shopify/operations/product'
import { getPages } from '@/lib/shopify/operations/storefront-page'

import sitemap from './sitemap'

const {
  getBlogMock,
  isNoindexModeEnabledMock,
  isSitemapExposureEnabledFromEnvMock,
} = vi.hoisted(() => ({
  getBlogMock: vi.fn(),
  isNoindexModeEnabledMock: vi.fn(),
  isSitemapExposureEnabledFromEnvMock: vi.fn(),
}))

vi.mock('@/lib/blog/operations', () => ({
  CANONICAL_BLOG_LISTING_PATH: '/blog',
  DEFAULT_BLOG_HANDLE: 'teavision-blogs',
  getArticlePath: (blogHandle: string, articleHandle: string) =>
    `/blogs/${blogHandle}/${articleHandle}`,
  getBlog: getBlogMock,
  isLocalCanonicalPath: (
    canonicalPath: string | null,
    localPath: string,
    baseUrl: string,
  ) =>
    !canonicalPath ||
    canonicalPath === localPath ||
    canonicalPath === `${baseUrl}${localPath}`,
}))

vi.mock('@/lib/seo/noindex', () => ({
  isNoindexModeEnabled: isNoindexModeEnabledMock,
}))

vi.mock('@/lib/env/server', () => ({
  isSitemapExposureEnabledFromEnv: isSitemapExposureEnabledFromEnvMock,
}))

vi.mock('@/lib/shopify/operations/collection', () => ({
  getCollectionSummaries: vi.fn(),
}))

vi.mock('@/lib/shopify/operations/product', () => ({
  getAllProducts: vi.fn(),
}))

vi.mock('@/lib/shopify/operations/storefront-page', () => ({
  getPagePath: (handle: string) => `/pages/${handle}`,
  getPages: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function createBlog(): BlogIndex {
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
    articles: [
      {
        id: 'article',
        handle: 'selecting-wholesale-tea',
        title: 'Selecting wholesale tea',
        excerpt: '',
        featuredImage: null,
        publishedAt: '2026-07-01T00:00:00.000Z',
        tags: [],
        authorName: null,
        seo: {
          title: null,
          description: null,
          canonicalPath: null,
          noIndex: false,
          ogImage: null,
        },
        readingTimeMinutes: 1,
      },
    ],
    featuredArticles: [],
  }
}

describe('sitemap blog paths', () => {
  beforeEach(() => {
    isNoindexModeEnabledMock.mockReturnValue(false)
    isSitemapExposureEnabledFromEnvMock.mockReturnValue(false)
    getBlogMock.mockResolvedValue(createBlog())
    vi.mocked(getAllProducts).mockResolvedValue([])
    vi.mocked(getCollectionSummaries).mockResolvedValue([])
    vi.mocked(getPages).mockResolvedValue([])
  })

  test('uses /blog for the listing and preserves article URLs', async () => {
    const entries = await sitemap()
    const paths = entries.map((entry) => new URL(entry.url).pathname)

    expect(paths).toContain('/blog')
    expect(paths).not.toContain('/blogs/teavision-blogs')
    expect(paths).toContain(
      getArticlePath(DEFAULT_BLOG_HANDLE, 'selecting-wholesale-tea'),
    )
  })
})

describe('sitemap staging exposure', () => {
  beforeEach(() => {
    getBlogMock.mockResolvedValue(createBlog())
    vi.mocked(getAllProducts).mockResolvedValue([])
    vi.mocked(getCollectionSummaries).mockResolvedValue([])
    vi.mocked(getPages).mockResolvedValue([])
  })

  test('stays empty when indexing and sitemap exposure are disabled', async () => {
    isNoindexModeEnabledMock.mockReturnValue(true)
    isSitemapExposureEnabledFromEnvMock.mockReturnValue(false)

    await expect(sitemap()).resolves.toEqual([])
    expect(getAllProducts).not.toHaveBeenCalled()
    expect(getCollectionSummaries).not.toHaveBeenCalled()
    expect(getPages).not.toHaveBeenCalled()
    expect(getBlogMock).not.toHaveBeenCalled()
  })

  test('shows canonical URLs while staging pages remain in noindex mode', async () => {
    isNoindexModeEnabledMock.mockReturnValue(true)
    isSitemapExposureEnabledFromEnvMock.mockReturnValue(true)

    const entries = await sitemap()
    const urls = entries.map((entry) => entry.url)

    expect(urls).toContain('https://www.teavision.com.au')
    expect(urls).toContain('https://www.teavision.com.au/blog')
    expect(
      urls.every(
        (url) => new URL(url).origin === 'https://www.teavision.com.au',
      ),
    ).toBe(true)
  })
})

describe('sitemap Shopify page coverage', () => {
  beforeEach(() => {
    isNoindexModeEnabledMock.mockReturnValue(false)
    isSitemapExposureEnabledFromEnvMock.mockReturnValue(false)
    getBlogMock.mockResolvedValue(createBlog())
    vi.mocked(getAllProducts).mockResolvedValue([])
    vi.mocked(getCollectionSummaries).mockResolvedValue([])
  })

  test('includes eligible Shopify pages without app-owned or utility pages', async () => {
    vi.mocked(getPages).mockResolvedValue([
      {
        id: 'gid://shopify/Page/custom',
        handle: 'custom-shopify-page',
        title: 'Custom Shopify Page',
        bodySummary: 'Custom page summary',
        updatedAt: '2026-07-20T00:00:00.000Z',
        seo: { title: null, description: null },
      },
      {
        id: 'gid://shopify/Page/privacy',
        handle: 'privacy-policy',
        title: 'Privacy Policy',
        bodySummary: 'Privacy policy summary',
        updatedAt: '2026-07-21T00:00:00.000Z',
        seo: { title: null, description: null },
      },
      {
        id: 'gid://shopify/Page/test',
        handle: 'test-page',
        title: 'Test Page',
        bodySummary: '',
        updatedAt: '2026-07-22T00:00:00.000Z',
        seo: { title: null, description: null },
      },
    ])

    const entries = await sitemap()
    const paths = entries.map((entry) => new URL(entry.url).pathname)

    expect(paths).toContain('/pages/custom-shopify-page')
    expect(
      paths.filter((path) => path === '/pages/privacy-policy'),
    ).toHaveLength(1)
    expect(paths).not.toContain('/pages/test-page')
  })
})

describe('sitemap product coverage', () => {
  beforeEach(() => {
    isNoindexModeEnabledMock.mockReturnValue(false)
    isSitemapExposureEnabledFromEnvMock.mockReturnValue(false)
    getBlogMock.mockResolvedValue(createBlog())
    vi.mocked(getCollectionSummaries).mockResolvedValue([])
    vi.mocked(getPages).mockResolvedValue([])
  })

  test('lists real products but leaves out the checkout-only freight product', async () => {
    vi.mocked(getAllProducts).mockResolvedValue([
      { handle: 'cats-claw-cut' },
      { handle: 'freight' },
    ] as Awaited<ReturnType<typeof getAllProducts>>)

    const entries = await sitemap()
    const paths = entries.map((entry) => new URL(entry.url).pathname)

    expect(paths).toContain('/products/cats-claw-cut')
    expect(paths).not.toContain('/products/freight')
  })
})

describe('sitemap static page dates', () => {
  beforeEach(() => {
    isNoindexModeEnabledMock.mockReturnValue(false)
    isSitemapExposureEnabledFromEnvMock.mockReturnValue(false)
    getBlogMock.mockResolvedValue(createBlog())
    vi.mocked(getAllProducts).mockResolvedValue([])
    vi.mocked(getCollectionSummaries).mockResolvedValue([])
    vi.mocked(getPages).mockResolvedValue([])
  })

  test('gives every app-owned sitemap page its own recorded date', async () => {
    const staticPaths = getLaunchSeoRouteExpectations()
      .filter(
        (expectation) =>
          expectation.expectedStatus === 200 &&
          expectation.shouldAppearInSitemap,
      )
      .map((expectation) => expectation.path)

    expect(staticPaths.length).toBeGreaterThan(0)

    for (const path of staticPaths) {
      const date = STATIC_PAGE_LAST_MODIFIED[path]

      expect(date, `add a last-changed date for ${path}`).toMatch(
        /^\d{4}-\d{2}-\d{2}$/,
      )
      expect(Number.isNaN(Date.parse(date ?? ''))).toBe(false)
    }

    const entries = await sitemap()
    const byPath = new Map(
      entries.map((entry) => [new URL(entry.url).pathname, entry]),
    )

    for (const path of staticPaths) {
      const pathname = new URL(path, 'https://www.teavision.com.au').pathname

      expect(byPath.get(pathname)?.lastModified).toBe(
        STATIC_PAGE_LAST_MODIFIED[path],
      )
    }
  })

  test('does not reuse one shared date for every page', () => {
    const dates = new Set(Object.values(STATIC_PAGE_LAST_MODIFIED))

    expect(dates.size).toBeGreaterThan(1)
  })

  test('leaves the date out when a product has no update date', async () => {
    vi.mocked(getAllProducts).mockResolvedValue([
      { handle: 'cats-claw-cut' },
    ] as Awaited<ReturnType<typeof getAllProducts>>)

    const entries = await sitemap()
    const product = entries.find((entry) =>
      entry.url.endsWith('/products/cats-claw-cut'),
    )

    expect(product).toBeDefined()
    expect(product?.lastModified).toBeUndefined()
  })
})
