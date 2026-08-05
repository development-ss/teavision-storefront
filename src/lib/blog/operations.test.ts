import { beforeEach, describe, expect, it, vi } from 'vitest'

import { generateListingMetadata } from '@/app/(storefront)/blogs/[blog]/_lib/metadata'
import { getSanityImageUrl, sanityFetch } from '@/lib/sanity/client'
import type {
  SanityBlogListingResult,
  SanityBlogPostSummary,
  SanityDefaultBlogListingResult,
  SanityImageWithAlt,
} from '@/lib/sanity/types'

import {
  CANONICAL_BLOG_LISTING_PATH,
  DEFAULT_BLOG_HANDLE,
  formatArticleDate,
  getArticlePath,
  getBlogPath,
  getCanonicalBlogListingPath,
  getBlogSearchListing,
  getDefaultBlogListing,
  getHomepageArticles,
  getPublicArticleAuthorName,
  getTagListing,
} from './operations'

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}))

vi.mock('@/lib/sanity/client', () => ({
  getSanityImageUrl: vi.fn(),
  sanityFetch: vi.fn(),
}))

vi.mock('@/lib/seo/noindex', () => ({
  withNoindexRobots: vi.fn((metadata) => metadata),
}))

function makeImage(id: string, lqip: string | null): SanityImageWithAlt {
  return {
    alt: `${id} alt`,
    attribution: null,
    caption: null,
    image: {
      asset: {
        _id: `image-${id}`,
        url: `https://cdn.sanity.io/images/project/dataset/${id}.jpg`,
        metadata: {
          dimensions: {
            width: 1200,
            height: 800,
            aspectRatio: 1.5,
          },
          lqip,
        },
      },
    },
  }
}

function makePost(id: string): SanityBlogPostSummary {
  return {
    _id: id,
    author: { name: 'Tea Editor' },
    bodyText: null,
    categories: [{ title: 'Green Tea' }],
    excerpt: `${id} excerpt`,
    featuredImage: makeImage(id, `data:image/jpeg;base64,${id}`),
    publishedAt: '2026-06-01T00:00:00.000Z',
    seo: null,
    slug: id,
    tags: ['Wholesale'],
    title: `${id} title`,
  }
}

describe('formatArticleDate', () => {
  it('uses the numeric Australian date format', () => {
    expect(formatArticleDate('2026-06-01T00:00:00.000Z')).toBe('01/06/2026')
  })
})

describe('getPublicArticleAuthorName', () => {
  it('keeps editorial author names and removes the legacy SEO agency', () => {
    expect(getPublicArticleAuthorName(' Tea Editor ')).toBe('Tea Editor')
    expect(getPublicArticleAuthorName(' King Kong ')).toBeNull()
    expect(getPublicArticleAuthorName('King Kong SEO Agency')).toBeNull()
  })
})

describe('getDefaultBlogListing', () => {
  beforeEach(() => {
    vi.mocked(sanityFetch).mockReset()
    vi.mocked(getSanityImageUrl).mockReset()
    vi.mocked(getSanityImageUrl).mockImplementation((_source, options = {}) => {
      const width = options.width ? `w=${options.width}` : null
      const quality = options.quality ? `q=${options.quality}` : null
      const fit = options.fit ? `fit=${options.fit}` : null

      return ['https://cdn.sanity.io/generated.jpg', width, quality, fit]
        .filter((part): part is string => Boolean(part))
        .join('?')
    })
  })

  it('carries LQIP and uses bounded image options by listing use case', async () => {
    const result: SanityDefaultBlogListingResult = {
      allTagArrays: [{ categories: ['Green Tea'], tags: ['Wholesale'] }],
      articles: [makePost('latest')],
      blog: {
        _id: 'blog',
        description: 'Tea journal',
        featuredPosts: [makePost('featured')],
        heroImage: makeImage('hero', 'data:image/jpeg;base64,hero'),
        seo: null,
        slug: 'teavision-blogs',
        title: 'Tea Journal',
      },
      totalCount: 1,
    }
    vi.mocked(sanityFetch).mockResolvedValue(result)

    const listing = await getDefaultBlogListing('teavision-blogs', 1)

    expect(listing?.heroImage).toMatchObject({
      lqip: 'data:image/jpeg;base64,hero',
      url: expect.stringContaining('w=1920'),
    })
    expect(listing?.featuredArticles[0]?.featuredImage).toMatchObject({
      lqip: 'data:image/jpeg;base64,featured',
      url: expect.stringContaining('w=900'),
    })
    expect(listing?.paginated.articles[0]?.featuredImage).toMatchObject({
      lqip: 'data:image/jpeg;base64,latest',
      url: expect.stringContaining('w=960'),
    })

    expect(vi.mocked(getSanityImageUrl)).toHaveBeenCalledWith(
      expect.objectContaining({
        asset: expect.objectContaining({ _id: 'image-hero' }),
      }),
      { fit: 'max', quality: 75, width: 1920 },
    )
    expect(vi.mocked(getSanityImageUrl)).toHaveBeenCalledWith(
      expect.objectContaining({
        asset: expect.objectContaining({ _id: 'image-featured' }),
      }),
      { fit: 'max', quality: 75, width: 900 },
    )
    expect(vi.mocked(getSanityImageUrl)).toHaveBeenCalledWith(
      expect.objectContaining({
        asset: expect.objectContaining({ _id: 'image-latest' }),
      }),
      { fit: 'max', quality: 75, width: 960 },
    )
  })

  it('removes the legacy SEO agency attribution from article summaries', async () => {
    const agencyPost = makePost('agency-authored')
    agencyPost.author = { name: '  King Kong  ' }

    const result: SanityDefaultBlogListingResult = {
      allTagArrays: [],
      articles: [agencyPost],
      blog: {
        _id: 'blog',
        description: 'Tea journal',
        featuredPosts: [],
        heroImage: null,
        seo: null,
        slug: 'teavision-blogs',
        title: 'Tea Journal',
      },
      totalCount: 1,
    }
    vi.mocked(sanityFetch).mockResolvedValue(result)

    const listing = await getDefaultBlogListing('teavision-blogs', 1)

    expect(listing?.paginated.articles[0]?.authorName).toBeNull()
  })

  it('clamps an out-of-range page and refetches the last page of articles', async () => {
    const emptyWindow: SanityDefaultBlogListingResult = {
      allTagArrays: [],
      articles: [],
      blog: {
        _id: 'blog',
        description: 'Tea journal',
        featuredPosts: [],
        heroImage: null,
        seo: null,
        slug: 'teavision-blogs',
        title: 'Tea Journal',
      },
      totalCount: 7,
    }
    const lastPageWindow: SanityDefaultBlogListingResult = {
      ...emptyWindow,
      articles: [makePost('last-page')],
    }
    vi.mocked(sanityFetch)
      .mockResolvedValueOnce(emptyWindow)
      .mockResolvedValueOnce(lastPageWindow)

    const listing = await getDefaultBlogListing('teavision-blogs', 999)

    expect(listing?.paginated.currentPage).toBe(2)
    expect(listing?.paginated.totalPages).toBe(2)
    expect(listing?.paginated.articles[0]?.title).toBe('last-page title')
    expect(vi.mocked(sanityFetch)).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({ offset: 6, limit: 12 }),
    )
  })
})

describe('getHomepageArticles', () => {
  beforeEach(() => {
    vi.mocked(sanityFetch).mockReset()
    vi.mocked(getSanityImageUrl).mockReset()
    vi.mocked(getSanityImageUrl).mockImplementation((_source, options = {}) => {
      const width = options.width ? `w=${options.width}` : null
      const quality = options.quality ? `q=${options.quality}` : null
      const fit = options.fit ? `fit=${options.fit}` : null

      return ['https://cdn.sanity.io/generated.jpg', width, quality, fit]
        .filter((part): part is string => Boolean(part))
        .join('?')
    })
  })

  it('uses a configurable max post count while preserving the default of 3', async () => {
    vi.mocked(sanityFetch)
      .mockResolvedValueOnce([makePost('first'), makePost('second')])
      .mockResolvedValueOnce([makePost('default')])

    const twoArticles = await getHomepageArticles(DEFAULT_BLOG_HANDLE, 2)
    const defaultArticles = await getHomepageArticles()

    expect(twoArticles).toHaveLength(2)
    expect(defaultArticles).toHaveLength(1)
    expect(vi.mocked(sanityFetch)).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      { blogHandle: DEFAULT_BLOG_HANDLE, limit: 2 },
    )
    expect(vi.mocked(sanityFetch)).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      { blogHandle: DEFAULT_BLOG_HANDLE, limit: 3 },
    )
  })

  it('normalizes legacy handles and clamps the homepage article limit', async () => {
    vi.mocked(sanityFetch).mockResolvedValueOnce([makePost('clamped')])

    await getHomepageArticles('journal', 99)

    expect(vi.mocked(sanityFetch)).toHaveBeenCalledWith(expect.any(String), {
      blogHandle: DEFAULT_BLOG_HANDLE,
      limit: 3,
    })
  })
})

describe('generateListingMetadata', () => {
  beforeEach(() => {
    vi.mocked(sanityFetch).mockReset()
    vi.mocked(getSanityImageUrl).mockReset()
    vi.mocked(getSanityImageUrl).mockReturnValue(
      'https://cdn.sanity.io/generated.jpg',
    )
  })

  it('noindexes tagged blog listings while allowing crawlers to follow links', async () => {
    const result: SanityBlogListingResult = {
      articles: [makePost('article')],
      blog: {
        _id: 'blog',
        description: 'Tea journal',
        featuredPosts: [],
        heroImage: null,
        seo: {
          canonicalPath: null,
          metaDescription: 'Tea journal metadata',
          metaTitle: 'Tea Journal',
          noIndex: false,
          ogImage: null,
        },
        slug: 'teavision-blogs',
        title: 'Tea Journal',
      },
    }
    vi.mocked(sanityFetch).mockResolvedValue(result)

    const metadata = await generateListingMetadata({ tag: 'green-tea' })

    expect(metadata.robots).toEqual({ index: false, follow: true })
    expect(metadata.alternates?.canonical).toBe(
      '/blogs/teavision-blogs/tagged/green-tea',
    )
  })

  it('builds a path-based canonical for deeper default pages', async () => {
    const result: SanityBlogListingResult = {
      articles: [makePost('article')],
      blog: {
        _id: 'blog',
        description: 'Tea journal',
        featuredPosts: [],
        heroImage: null,
        seo: {
          canonicalPath: null,
          metaDescription: 'Tea journal metadata',
          metaTitle: 'Tea Journal',
          noIndex: false,
          ogImage: null,
        },
        slug: 'teavision-blogs',
        title: 'Tea Journal',
      },
    }
    vi.mocked(sanityFetch).mockResolvedValue(result)

    const metadata = await generateListingMetadata({ page: 3 })

    expect(metadata.robots).toBeUndefined()
    expect(metadata.alternates?.canonical).toBe('/blogs/teavision-blogs/page/3')
  })

  it('uses /blog as the canonical for the main Tea Journal listing', async () => {
    const result: SanityBlogListingResult = {
      articles: [makePost('article')],
      blog: {
        _id: 'blog',
        description: 'Tea journal',
        featuredPosts: [],
        heroImage: null,
        seo: {
          canonicalPath: '/blogs/teavision-blogs',
          metaDescription: 'Tea journal metadata',
          metaTitle: 'Tea Journal',
          noIndex: false,
          ogImage: null,
        },
        slug: 'teavision-blogs',
        title: 'Tea Journal',
      },
    }
    vi.mocked(sanityFetch).mockResolvedValue(result)

    const metadata = await generateListingMetadata({ page: 1 })

    expect(metadata.alternates?.canonical).toBe(CANONICAL_BLOG_LISTING_PATH)
    expect(metadata.openGraph?.url).toBe(CANONICAL_BLOG_LISTING_PATH)
  })
})

describe('getTagListing', () => {
  beforeEach(() => {
    vi.mocked(sanityFetch).mockReset()
    vi.mocked(getSanityImageUrl).mockReturnValue(
      'https://cdn.sanity.io/generated.jpg',
    )
  })

  it('returns the tag-filtered, paginated articles', async () => {
    const result: SanityBlogListingResult = {
      articles: [makePost('a1')],
      blog: {
        _id: 'blog',
        description: 'Tea journal',
        featuredPosts: [],
        heroImage: null,
        seo: null,
        slug: 'teavision-blogs',
        title: 'Tea Journal',
      },
    }
    vi.mocked(sanityFetch).mockResolvedValue(result)

    const listing = await getTagListing('teavision-blogs', 'green-tea', 1)

    expect(listing?.activeTag).toBe('Green Tea')
    expect(listing?.paginated.articles.map((article) => article.id)).toEqual([
      'a1',
    ])
  })

  it('returns null for an unknown tag', async () => {
    const result: SanityBlogListingResult = {
      articles: [makePost('a1')],
      blog: {
        _id: 'blog',
        description: 'Tea journal',
        featuredPosts: [],
        heroImage: null,
        seo: null,
        slug: 'teavision-blogs',
        title: 'Tea Journal',
      },
    }
    vi.mocked(sanityFetch).mockResolvedValue(result)

    expect(await getTagListing('teavision-blogs', 'no-such-tag', 1)).toBeNull()
  })
})

describe('getBlogSearchListing', () => {
  beforeEach(() => {
    vi.mocked(sanityFetch).mockReset()
    vi.mocked(getSanityImageUrl).mockReturnValue(
      'https://cdn.sanity.io/generated.jpg',
    )
  })

  it('returns query matches collapsed onto a single page', async () => {
    const result: SanityBlogListingResult = {
      articles: [makePost('match'), makePost('other')],
      blog: {
        _id: 'blog',
        description: 'Tea journal',
        featuredPosts: [],
        heroImage: null,
        seo: null,
        slug: 'teavision-blogs',
        title: 'Tea Journal',
      },
    }
    vi.mocked(sanityFetch).mockResolvedValue(result)

    const listing = await getBlogSearchListing('teavision-blogs', 'match')

    expect(listing?.paginated.totalPages).toBe(1)
    expect(listing?.paginated.articles.map((article) => article.id)).toEqual([
      'match',
    ])
  })
})

describe('blog listing URL handoff', () => {
  it('moves only the main listing while preserving article paths', () => {
    expect(CANONICAL_BLOG_LISTING_PATH).toBe('/blog')
    expect(getCanonicalBlogListingPath(DEFAULT_BLOG_HANDLE)).toBe('/blog')
    expect(getBlogPath(DEFAULT_BLOG_HANDLE)).toBe('/blogs/teavision-blogs')
    expect(getArticlePath(DEFAULT_BLOG_HANDLE, 'selecting-wholesale-tea')).toBe(
      '/blogs/teavision-blogs/selecting-wholesale-tea',
    )
  })
})
