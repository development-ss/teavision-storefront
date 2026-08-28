import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  Collection,
  CollectionPageIndex,
  CollectionProductsResult,
  CollectionProductSummary,
  CollectionSummary,
} from '@/lib/shopify/types'

import { DefaultResults } from './default-results'
import { HeroContent } from './hero-content'
import { PageContent } from './page-content'
import { CollectionStory } from './story'

const shopifyMocks = vi.hoisted(() => ({
  getCollection: vi.fn<() => Promise<Collection | null>>(),
  getCollectionProductsPage: vi.fn<() => Promise<CollectionProductsResult>>(),
  getCollectionPageIndex: vi.fn<() => Promise<CollectionPageIndex>>(),
  getCollectionSummaries: vi.fn<() => Promise<CollectionSummary[]>>(),
  getCollectionTagCounts: vi.fn<() => Promise<Record<string, number>>>(),
}))

const htmlContentMocks = vi.hoisted(() => ({
  sanitizeShopifyCollectionStoryHtml: vi.fn(),
}))

const reviewsMocks = vi.hoisted(() => ({
  getTrustooProductRatings: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/shopify/html-content', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/shopify/html-content')>()
  htmlContentMocks.sanitizeShopifyCollectionStoryHtml.mockImplementation(
    actual.sanitizeShopifyCollectionStoryHtml,
  )

  return {
    ...actual,
    sanitizeShopifyCollectionStoryHtml:
      htmlContentMocks.sanitizeShopifyCollectionStoryHtml,
  }
})

vi.mock('@/lib/shopify/operations/collection', () => ({
  COLLECTION_PRODUCT_PAGE_SIZE: 24,
  getCollection: shopifyMocks.getCollection,
  getCollectionProductsPage: shopifyMocks.getCollectionProductsPage,
  getCollectionPageIndex: shopifyMocks.getCollectionPageIndex,
  getCollectionSummaries: shopifyMocks.getCollectionSummaries,
  getCollectionTagCounts: shopifyMocks.getCollectionTagCounts,
}))

vi.mock('@/lib/reviews/trustoo', () => ({
  getTrustooProductRatings: reviewsMocks.getTrustooProductRatings,
}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('notFound')
  },
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`)
  },
  usePathname: () => '/collections/bulk-tea-bags',
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/lib/cart/actions', () => ({
  addToCartAction: vi.fn(),
}))

const richHeroHtml = `
<section class="bulk-header">
  <h1>Ready-Made Bulk Tea Bags for Cafes, Hotels &amp; Retail</h1>
  <p>Teavision's most-loved blends in convenient <strong>biodegradable pyramid tea bags</strong>.</p>
  <img src="https://cdn.shopify.com/s/files/1/0786/8339/files/TeaVision-14_1.jpg?v=1761279097" alt="Teavision Bulk Tea Bags">
  <div>
    <a href="https://cdn.shopify.com/s/files/1/0786/8339/files/Teavision_Tea_Bag_Catalogue_1.pdf?v=1640138688">View our Tea Bag Manufacturing Catalogue</a>
    <a href="mailto:info@teavision.com.au?subject=Custom%20Tea%20Bag%20Enquiry">Speak to Our Team About Custom Tea Bags</a>
  </div>
  <a href="https://www.teavision.com.au/collections/all">Create Your Own White Label Tea Bag</a>
  <p>Minimum Order Quantity: <strong>6,000 Tea Bags Per Blend</strong></p>
</section>
`

function collectionFixture(overrides: Partial<Collection> = {}): Collection {
  return {
    id: 'gid://shopify/Collection/test',
    handle: 'bulk-tea-bags',
    title: 'Bulk Tea Bags',
    description: 'Bulk Tea Bags',
    descriptionHtml: '',
    featuredImage: null,
    updatedAt: '2026-06-11T00:00:00Z',
    seo: { title: null, description: null },
    ...overrides,
  }
}

function emptyProductsResult(): CollectionProductsResult {
  return {
    filters: [],
    pageInfo: { endCursor: null, hasNextPage: false },
    products: [],
  }
}

function pageIndexFixture(
  overrides: Partial<CollectionPageIndex> = {},
): CollectionPageIndex {
  return {
    totalCount: 0,
    totalPages: 1,
    afterCursor: null,
    displayPageToRawPage: null,
    ...overrides,
  }
}

function productFixture(
  overrides: Partial<CollectionProductSummary> = {},
): CollectionProductSummary {
  return {
    id: 'gid://shopify/Product/masters-sencha',
    handle: 'tea-masters-sencha',
    title: 'Tea Masters Sencha Green Tea',
    availableForSale: true,
    productType: 'Green tea',
    tags: [],
    featuredImage: null,
    priceRange: {
      minVariantPrice: { amount: '12.00', currencyCode: 'AUD' },
    },
    rating: 4.8,
    reviewCount: 37,
    variants: [
      {
        id: 'gid://shopify/ProductVariant/masters-sencha-50g',
        title: '50g Sample',
        availableForSale: true,
        quantityAvailable: 10,
        quantityRule: { minimum: 1, maximum: 10, increment: 1 },
        price: { amount: '12.00', currencyCode: 'AUD' },
        quantityPriceBreaks: [],
        image: null,
      },
    ],
    ...overrides,
  }
}

function getImagePreloads(html: string): string[] {
  return (
    html.match(/<link(?=[^>]*rel="preload")(?=[^>]*as="image")[^>]*>/g) ?? []
  )
}

beforeEach(() => {
  htmlContentMocks.sanitizeShopifyCollectionStoryHtml.mockClear()
  reviewsMocks.getTrustooProductRatings.mockReset()
  reviewsMocks.getTrustooProductRatings.mockResolvedValue({})
})

describe('PageContent out-of-range and stale-cursor handling', () => {
  beforeEach(() => {
    shopifyMocks.getCollection.mockResolvedValue(
      collectionFixture({ handle: 'all', title: 'All Products' }),
    )
    shopifyMocks.getCollectionSummaries.mockResolvedValue([])
    shopifyMocks.getCollectionTagCounts.mockResolvedValue({})
  })

  it('redirects to last valid page when requested page exceeds totalPages', async () => {
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 24, totalPages: 3 }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue(
      emptyProductsResult(),
    )

    await expect(
      PageContent({
        params: Promise.resolve({ handle: 'all' }),
        // page=999 is out-of-range for a 3-page collection
        searchParams: Promise.resolve({ page: '999' }),
      }),
    ).rejects.toThrow('redirect:/collections/all?page=3')
  })

  it('redirects stale-cursor result (empty products on in-range page > 1) strictly downward', async () => {
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 48, totalPages: 2 }),
    )
    // page 2 returns empty (stale cursor): the index says 2 pages exist but
    // the collection has shrunk. Redirecting back to page 2 would loop forever,
    // so the fallback must step down to page 1 (the clean URL).
    shopifyMocks.getCollectionProductsPage.mockResolvedValue(
      emptyProductsResult(),
    )

    await expect(
      PageContent({
        params: Promise.resolve({ handle: 'all' }),
        searchParams: Promise.resolve({ page: '2' }),
      }),
    ).rejects.toThrow(/^redirect:\/collections\/all$/)
  })

  it('redirects an empty last page downward — never to the URL being served', async () => {
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 72, totalPages: 3 }),
    )
    // Requested page IS the last page (3 of 3) and comes back empty:
    // the redirect target must strictly decrease (page 2), not self-redirect.
    shopifyMocks.getCollectionProductsPage.mockResolvedValue(
      emptyProductsResult(),
    )

    await expect(
      PageContent({
        params: Promise.resolve({ handle: 'all' }),
        searchParams: Promise.resolve({ page: '3' }),
      }),
    ).rejects.toThrow(/^redirect:\/collections\/all\?page=2$/)
  })

  it('renders the empty state on page 1 with genuinely empty results — no redirect', async () => {
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 0, totalPages: 1 }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue(
      emptyProductsResult(),
    )

    const element = await PageContent({
      params: Promise.resolve({ handle: 'all' }),
      searchParams: Promise.resolve({}),
    })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('No matches')
  })

  it('renders normally for in-range page with products', async () => {
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 48, totalPages: 2 }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue(
      emptyProductsResult(),
    )

    // page 1 of 2 — within range, products returned (emptyProductsResult is page 1 so no stale-cursor trigger)
    const element = await PageContent({
      params: Promise.resolve({ handle: 'all' }),
      searchParams: Promise.resolve({ page: '1' }),
    })
    expect(element).toBeTruthy()
  })

  it('uses the same Trustoo rating on collection cards as the product page', async () => {
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 1, totalPages: 1 }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue({
      filters: [],
      pageInfo: { endCursor: null, hasNextPage: false },
      products: [productFixture({ rating: 4.8, reviewCount: 37 })],
    })
    reviewsMocks.getTrustooProductRatings.mockResolvedValue({
      'tea-masters-sencha': { rating: 5, reviewCount: 2 },
    })

    const element = await PageContent({
      params: Promise.resolve({ handle: 'all' }),
      searchParams: Promise.resolve({}),
    })
    const html = renderToStaticMarkup(element)

    expect(reviewsMocks.getTrustooProductRatings).toHaveBeenCalledWith([
      'tea-masters-sencha',
    ])
    expect(html).toContain('aria-label="5.0 out of 5 stars, 2 reviews"')
    expect(html).not.toContain('aria-label="4.8 out of 5 stars, 37 reviews"')
  })

  it('treats invalid page param as page 1 (no redirect)', async () => {
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 24, totalPages: 1 }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue(
      emptyProductsResult(),
    )

    // page='abc' → parsePageParam returns 1, page 1 <= totalPages 1 → no redirect
    const element = await PageContent({
      params: Promise.resolve({ handle: 'all' }),
      searchParams: Promise.resolve({ page: 'abc' }),
    })
    expect(element).toBeTruthy()
  })
})

describe('PageContent category pagination hrefs', () => {
  it('emits category pager and prev/next hrefs without a redundant filter param (WR-01)', async () => {
    shopifyMocks.getCollection.mockResolvedValue(
      collectionFixture({ handle: 'all', title: 'All Products' }),
    )
    shopifyMocks.getCollectionSummaries.mockResolvedValue([])
    shopifyMocks.getCollectionTagCounts.mockResolvedValue({})
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 72, totalPages: 3 }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue({
      filters: [],
      pageInfo: { endCursor: null, hasNextPage: true },
      products: [productFixture({ tags: ['categories_herbs'] })],
    })

    const element = await PageContent({
      params: Promise.resolve({ handle: 'all', category: 'categories_herbs' }),
      searchParams: Promise.resolve({ page: '2' }),
    })
    const html = renderToStaticMarkup(element)

    // The category lives in the URL path — pagination hrefs must not
    // re-serialise it as a ?filter= query param (two URL variants).
    expect(html).toContain('/collections/all/categories_herbs?page=3')
    expect(html).not.toContain('filter=')
  })

  it('preloads the first product image when the category route does not render the collection hero', async () => {
    shopifyMocks.getCollection.mockResolvedValue(
      collectionFixture({
        handle: 'all',
        title: 'All Products',
        featuredImage: {
          url: 'https://cdn.shopify.com/s/files/1/0000/0001/collections/all.jpg',
          altText: 'All products',
          width: 1440,
          height: 640,
        },
      }),
    )
    shopifyMocks.getCollectionSummaries.mockResolvedValue([])
    shopifyMocks.getCollectionTagCounts.mockResolvedValue({})
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 1, totalPages: 1 }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue({
      filters: [],
      pageInfo: { endCursor: null, hasNextPage: false },
      products: [
        productFixture({
          tags: ['categories_herbs'],
          featuredImage: {
            url: 'https://cdn.shopify.com/s/files/1/0000/0001/products/herbs.jpg',
            altText: 'Dried herbs',
            width: 900,
            height: 900,
          },
        }),
      ],
    })

    const element = await PageContent({
      params: Promise.resolve({ handle: 'all', category: 'categories_herbs' }),
      searchParams: Promise.resolve({}),
    })
    const html = renderToStaticMarkup(element)

    expect(getImagePreloads(html)).toHaveLength(1)
  })
})

describe('PageContent category page mapping', () => {
  beforeEach(() => {
    shopifyMocks.getCollection.mockResolvedValue(
      collectionFixture({ handle: 'dried-herbs', title: 'Dried Herbs' }),
    )
    shopifyMocks.getCollectionSummaries.mockResolvedValue([])
    shopifyMocks.getCollectionTagCounts.mockResolvedValue({})
  })

  it('caps the category pager at display pages that contain matching products', async () => {
    // 48-product collection (2 raw pages) where only one product carries the
    // category tag — the pager must show 1 page, not the raw 2.
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({
        totalCount: 1,
        totalPages: 1,
        displayPageToRawPage: [1],
      }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue({
      filters: [],
      pageInfo: { endCursor: null, hasNextPage: true },
      products: [
        productFixture({ tags: ['categories_Australian Tea'] }),
        productFixture({
          id: 'gid://shopify/Product/peppermint',
          handle: 'peppermint',
          tags: ['categories_All Herbs'],
        }),
      ],
    })

    const element = await PageContent({
      params: Promise.resolve({
        handle: 'dried-herbs',
        category: 'categories_australian-tea',
      }),
      searchParams: Promise.resolve({}),
    })
    const html = renderToStaticMarkup(element)

    expect(html).not.toContain('?page=2')
    expect(shopifyMocks.getCollectionPageIndex).toHaveBeenCalledWith(
      'dried-herbs',
      24,
      'COLLECTION_DEFAULT',
      false,
      [{ tag: 'categories_Australian Tea' }],
      'categories_Australian Tea',
    )
  })

  it('fetches the mapped raw page for category display pages', async () => {
    // Matches live on raw pages 1 and 3 — display page 2 must fetch raw page 3.
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({
        totalCount: 2,
        totalPages: 2,
        displayPageToRawPage: [1, 3],
      }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue({
      filters: [],
      pageInfo: { endCursor: null, hasNextPage: false },
      products: [productFixture({ tags: ['categories_Australian Tea'] })],
    })

    await PageContent({
      params: Promise.resolve({
        handle: 'dried-herbs',
        category: 'categories_australian-tea',
      }),
      searchParams: Promise.resolve({ page: '2' }),
    })

    expect(shopifyMocks.getCollectionProductsPage).toHaveBeenLastCalledWith(
      'dried-herbs',
      3,
      24,
      'COLLECTION_DEFAULT',
      false,
      [{ tag: 'categories_Australian Tea' }],
    )
  })

  it('redirects a category page with no visible products strictly downward', async () => {
    shopifyMocks.getCollectionTagCounts.mockResolvedValue({
      'categories_Australian Tea': 2,
    })
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({
        totalCount: 2,
        totalPages: 2,
        displayPageToRawPage: [1, 2],
      }),
    )
    // Raw page has products, but none carry the selected category tag —
    // the visible list is empty, so display page 2 must step down to page 1.
    shopifyMocks.getCollectionProductsPage.mockResolvedValue({
      filters: [],
      pageInfo: { endCursor: null, hasNextPage: false },
      products: [productFixture({ tags: ['categories_All Herbs'] })],
    })

    await expect(
      PageContent({
        params: Promise.resolve({
          handle: 'dried-herbs',
          category: 'categories_australian-tea',
        }),
        searchParams: Promise.resolve({ page: '2' }),
      }),
    ).rejects.toThrow(
      /^redirect:\/collections\/dried-herbs\/categories_australian-tea$/,
    )
  })

  it('resolves a category whose products sit beyond page 1 via the index tag counts', async () => {
    // No page-1 product carries the tag, but the full-index tag counts do —
    // the route must resolve instead of 404ing.
    shopifyMocks.getCollectionTagCounts.mockResolvedValue({
      categories_Most_Popular: 1,
    })
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({
        totalCount: 1,
        totalPages: 1,
        displayPageToRawPage: [2],
      }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue({
      filters: [],
      pageInfo: { endCursor: null, hasNextPage: false },
      products: [productFixture({ tags: ['categories_Most_Popular'] })],
    })

    const element = await PageContent({
      params: Promise.resolve({
        handle: 'dried-herbs',
        category: 'categories_most_popular',
      }),
      searchParams: Promise.resolve({}),
    })

    expect(element).toBeTruthy()
  })
})

describe('Collection hero and page content rendering', () => {
  beforeEach(() => {
    shopifyMocks.getCollectionProductsPage.mockResolvedValue(
      emptyProductsResult(),
    )
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(pageIndexFixture())
    shopifyMocks.getCollectionSummaries.mockResolvedValue([])
    shopifyMocks.getCollectionTagCounts.mockResolvedValue({})
  })

  it('renders the strict rich hero block when Shopify description opts in', async () => {
    const collection = collectionFixture({
      description: 'Ready-Made Bulk Tea Bags',
      descriptionHtml: richHeroHtml,
    })
    shopifyMocks.getCollection.mockResolvedValue(collection)

    const params = Promise.resolve({ handle: 'bulk-tea-bags' })
    const [heroElement, storyElement] = await Promise.all([
      HeroContent({ params }),
      CollectionStory({ collection }),
    ])
    const html = renderToStaticMarkup(heroElement)

    expect(html).toContain('data-testid="collection-rich-hero"')
    expect(html).toContain('Ready-Made Bulk Tea Bags for Cafes')
    expect(html).toContain('View our Tea Bag Manufacturing Catalogue')
    expect(html).toContain('Minimum Order Quantity: 6,000 Tea Bags Per Blend')
    expect(html).toMatch(
      /<img(?=[^>]*class="h-auto max-h-90 w-full object-cover")(?=[^>]*fetchPriority="high")(?=[^>]*loading="eager")[^>]*>/,
    )
    expect(html).toMatch(
      /<link(?=[^>]*rel="preload")(?=[^>]*as="image")(?=[^>]*fetchPriority="high")[^>]*>/,
    )
    expect(html).not.toContain('Read more about Bulk Tea Bags')
    expect(storyElement).toBeNull()
    expect(
      htmlContentMocks.sanitizeShopifyCollectionStoryHtml,
    ).not.toHaveBeenCalled()
  })

  it('renders normal collection stories separately from the hero', async () => {
    const collection = collectionFixture({
      handle: 'wholesale-bulk-tea',
      title: 'Wholesale Bulk Tea',
      description: 'Browse loose leaf teas.',
      descriptionHtml:
        '<h2>Wholesale Bulk Tea</h2><p>Browse loose leaf teas.</p><ul><li>Black tea</li></ul>',
    })
    shopifyMocks.getCollection.mockResolvedValue(collection)

    const params = Promise.resolve({ handle: 'wholesale-bulk-tea' })
    const [heroElement, storyElement] = await Promise.all([
      HeroContent({ params }),
      CollectionStory({ collection }),
    ])
    const heroHtml = renderToStaticMarkup(heroElement)
    const storyHtml = renderToStaticMarkup(storyElement)

    expect(heroHtml).not.toContain('data-testid="collection-rich-hero"')
    expect(heroHtml).toContain('aria-label="Breadcrumb"')
    expect(heroHtml).toContain('Wholesale collection')
    expect(heroHtml).not.toContain('Read more about Wholesale Bulk Tea')
    expect(storyHtml).toContain('Read more about Wholesale Bulk Tea')
    expect(storyHtml).toContain(
      '<div class="mt-10" role="region" aria-label="About Wholesale Bulk Tea">',
    )
  })

  it('uses the production image without dropping the collection hero content', async () => {
    shopifyMocks.getCollection.mockResolvedValue(
      collectionFixture({
        handle: 'aniseed-tea',
        title: 'Aniseed Tea',
        description: 'Aniseed collection description.',
        descriptionHtml: `
          <div id="kk-collection-banner" style="background-image: url('https://cdn.shopify.com/s/files/1/0786/8339/files/iStock-1828083790.jpg?v=1707454172');">
            <div id="kk-collection-banner-overlay"></div>
            <h1>Aniseed Tea</h1>
          </div>
        `,
      }),
    )

    const heroElement = await HeroContent({
      params: Promise.resolve({ handle: 'aniseed-tea' }),
    })
    const html = renderToStaticMarkup(heroElement)

    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('>Aniseed Tea</h1>')
    expect(html).toContain('bg-brand-deep text-paper relative overflow-hidden')
    expect(html).toContain('class="object-cover"')
    expect(html).not.toContain('opacity-35')
    expect(html).toContain('collection-hero-scrim absolute inset-0 z-1')
    expect(html).toContain(
      'iStock-1828083790.jpg%3Fv%3D1707454172%26width%3D1440',
    )
    expect(html).toContain('Wholesale collection')
    expect(html).toContain('aria-label="Breadcrumb"')
    expect(html).toContain('Aniseed collection description.')
  })

  it('keeps the collection sidebar in the document scroll flow', async () => {
    shopifyMocks.getCollection.mockResolvedValue(collectionFixture())
    shopifyMocks.getCollectionSummaries.mockResolvedValue([
      {
        id: 'gid://shopify/Collection/related',
        handle: 'related-tea',
        title: 'Related Tea',
        description: 'A related collection',
        featuredImage: null,
        updatedAt: '2026-08-04T00:00:00Z',
        seo: { title: null, description: null },
      },
    ])

    const element = await PageContent({
      params: Promise.resolve({ handle: 'bulk-tea-bags' }),
      searchParams: Promise.resolve({}),
    })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('aria-label="You might like collections"')
    expect(html).not.toContain('overflow-y-auto')
    expect(html).not.toContain('overscroll-contain')
    expect(html).not.toContain('lg:sticky')
  })

  it('renders a local product filter for every collection PLP', async () => {
    shopifyMocks.getCollection.mockResolvedValue(
      collectionFixture({
        handle: 'black-tea',
        title: 'Wholesale Black Tea',
      }),
    )

    const element = await PageContent({
      params: Promise.resolve({ handle: 'black-tea' }),
      searchParams: Promise.resolve({}),
    })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('action="/collections/black-tea"')
    expect(html).toContain('method="get"')
    expect(html).toContain('name="q"')
    expect(html).toContain('Filter products on this page')
    expect(html).toContain('placeholder="Filter visible products"')
    expect(html).not.toContain('value="collections:Wholesale Black Tea"')
  })

  it('filters only the products already rendered on the collection page', async () => {
    shopifyMocks.getCollection.mockResolvedValue(
      collectionFixture({
        handle: 'black-tea',
        title: 'Wholesale Black Tea',
      }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue({
      filters: [],
      pageInfo: { endCursor: null, hasNextPage: false },
      products: [
        productFixture({ title: 'Tea Masters Sencha Green Tea' }),
        productFixture({
          id: 'gid://shopify/Product/english-breakfast',
          handle: 'english-breakfast',
          title: 'English Breakfast Black Tea',
        }),
      ],
    })
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 2, totalPages: 1 }),
    )

    const element = await PageContent({
      params: Promise.resolve({ handle: 'black-tea' }),
      searchParams: Promise.resolve({ q: 'sencha' }),
    })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('Tea Masters Sencha Green Tea')
    expect(html).not.toContain('href="/products/english-breakfast"')
    expect(html).toContain('1 product')
    expect(html).toContain('value="sencha"')
  })

  it('renders banner H1 visibly and places read-more story below the product grid', async () => {
    const collection = collectionFixture({
      handle: 'wholesale-bulk-tea',
      title: 'Wholesale Bulk Tea',
      description: 'Hero summary should not render in banner mode.',
      descriptionHtml: `
          <img src="https://cdn.shopify.com/s/files/1/0786/8339/files/Wholesale-Bulk-Tea_1440x640.jpg" alt="Wholesale Bulk Tea">
          <h2>Wholesale Bulk Tea</h2>
          <p>Browse loose leaf teas for cafes, retailers, and foodservice teams.</p>
          <h3>Why hospitality teams choose Teavision</h3>
          <h4>Flexible wholesale ordering</h4>
          <ul><li>Black tea</li><li>Green tea</li><li>Herbal tea</li></ul>
        `,
    })
    shopifyMocks.getCollection.mockResolvedValue(collection)
    shopifyMocks.getCollectionProductsPage.mockResolvedValue({
      filters: [],
      pageInfo: { endCursor: null, hasNextPage: false },
      products: [productFixture()],
    })
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 1, totalPages: 1 }),
    )

    const params = Promise.resolve({ handle: 'wholesale-bulk-tea' })
    const [heroElement, storyElement, pageElement] = await Promise.all([
      HeroContent({ params }),
      CollectionStory({ collection }),
      PageContent({ params, searchParams: Promise.resolve({}) }),
    ])
    const heroHtml = renderToStaticMarkup(heroElement)
    const storyHtml = renderToStaticMarkup(storyElement)
    const pageHtml = renderToStaticMarkup(pageElement)

    expect(heroHtml.match(/<h1\b/g)).toHaveLength(1)
    expect(heroHtml).not.toContain('<h1 class="sr-only"')
    expect(heroHtml).not.toContain('type-display')
    expect(heroHtml).toContain(
      '<h1 aria-current="page" class="type-mono-meta text-gold-deep m-0 inline">Wholesale Bulk Tea</h1>',
    )
    expect(heroHtml).not.toContain(
      '<span aria-current="page" class="text-gold-deep">Wholesale Bulk Tea</span>',
    )
    expect(heroHtml).not.toContain(
      '<p class="type-body text-ink-soft mt-4 max-w-[58ch]">Hero summary should not render',
    )
    expect(heroHtml).toMatch(
      /<img(?=[^>]*class="w-full object-cover")(?=[^>]*fetchPriority="high")(?=[^>]*loading="eager")[^>]*>/,
    )
    expect(heroHtml).toMatch(
      /<link(?=[^>]*rel="preload")(?=[^>]*as="image")(?=[^>]*fetchPriority="high")[^>]*>/,
    )
    expect(heroHtml.indexOf('aria-label="Breadcrumb"')).toBeGreaterThan(-1)
    expect(heroHtml).toContain('aria-label="Breadcrumb"')
    expect(heroHtml).not.toContain('Read more about Wholesale Bulk Tea')
    expect(storyHtml).toContain(
      '<div class="mt-10" role="region" aria-label="About Wholesale Bulk Tea">',
    )
    expect(storyHtml).toContain(
      '<h2 class="type-heading-05 text-ink mt-5">Why hospitality teams choose Teavision</h2>',
    )
    expect(storyHtml).toContain(
      '<h3 class="type-label text-ink mt-5">Flexible wholesale ordering</h3>',
    )
    expect(pageHtml.indexOf('id="product-grid"')).toBeGreaterThan(-1)
    expect(pageHtml).toContain('Read more about Wholesale Bulk Tea')
    expect(
      pageHtml.indexOf('Read more about Wholesale Bulk Tea'),
    ).toBeGreaterThan(pageHtml.indexOf('id="product-grid"'))
  })

  it('preloads the first product image when incomplete hero dimensions prevent the hero from rendering', async () => {
    shopifyMocks.getCollection.mockResolvedValue(
      collectionFixture({
        featuredImage: {
          url: 'https://cdn.shopify.com/s/files/1/0000/0001/collections/incomplete.jpg',
          altText: 'Incomplete collection image',
          width: null,
          height: null,
        },
      }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue({
      filters: [],
      pageInfo: { endCursor: null, hasNextPage: false },
      products: [
        productFixture({
          featuredImage: {
            url: 'https://cdn.shopify.com/s/files/1/0000/0001/products/first.jpg',
            altText: 'First product',
            width: 900,
            height: 900,
          },
        }),
      ],
    })
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 1, totalPages: 1 }),
    )

    const element = await PageContent({
      params: Promise.resolve({ handle: 'bulk-tea-bags' }),
      searchParams: Promise.resolve({}),
    })
    const html = renderToStaticMarkup(element)

    expect(getImagePreloads(html)).toHaveLength(1)
  })
})

describe('DefaultResults fallback', () => {
  beforeEach(() => {
    shopifyMocks.getCollection.mockResolvedValue(collectionFixture())
    shopifyMocks.getCollectionSummaries.mockResolvedValue([])
    shopifyMocks.getCollectionTagCounts.mockResolvedValue({})
    shopifyMocks.getCollectionPageIndex.mockResolvedValue(
      pageIndexFixture({ totalCount: 1, totalPages: 1 }),
    )
    shopifyMocks.getCollectionProductsPage.mockResolvedValue({
      filters: [],
      pageInfo: { endCursor: null, hasNextPage: false },
      products: [productFixture()],
    })
  })

  it('renders the real default grid without page-level metadata', async () => {
    const fallbackHtml = renderToStaticMarkup(
      await DefaultResults({
        params: Promise.resolve({ handle: 'bulk-tea-bags' }),
      }),
    )
    const resolvedHtml = renderToStaticMarkup(
      await PageContent({
        params: Promise.resolve({ handle: 'bulk-tea-bags' }),
        searchParams: Promise.resolve({}),
      }),
    )

    // Real content, identical to the resolved no-query grid
    expect(fallbackHtml).toContain('Tea Masters Sencha Green Tea')
    expect(fallbackHtml).toContain('href="/products/tea-masters-sencha"')

    // Metadata singletons stay exclusive to the resolved copy
    expect(fallbackHtml).not.toContain('application/ld+json')
    expect(resolvedHtml).toContain('application/ld+json')
    expect(fallbackHtml).not.toContain('rel="prev"')
    expect(fallbackHtml).not.toContain('rel="next"')
  })

  it('renders the category-filtered grid from the path param alone', async () => {
    shopifyMocks.getCollectionProductsPage.mockResolvedValue({
      filters: [],
      pageInfo: { endCursor: null, hasNextPage: false },
      products: [
        productFixture({ tags: ['categories_herbs'] }),
        productFixture({
          id: 'gid://shopify/Product/other',
          handle: 'other-product',
          title: 'Unrelated Product',
          tags: [],
        }),
      ],
    })

    const html = renderToStaticMarkup(
      await DefaultResults({
        params: Promise.resolve({
          handle: 'bulk-tea-bags',
          category: 'categories_herbs',
        }),
      }),
    )

    expect(html).toContain('Tea Masters Sencha Green Tea')
    expect(html).not.toContain('Unrelated Product')
    expect(html).toContain(
      'action="/collections/bulk-tea-bags/categories_herbs"',
    )
    expect(html).not.toContain('value="collections:Bulk Tea Bags"')
  })
})
