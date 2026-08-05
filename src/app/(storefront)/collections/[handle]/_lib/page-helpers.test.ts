import { describe, expect, it } from 'vitest'

import { FilterType, type CollectionProductFilter } from '@/lib/shopify/types'

import * as pageHelpers from './page-helpers'

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

describe('parseCollectionRichHero', () => {
  it('parses the strict Shopify rich hero block into structured content', () => {
    expect(typeof pageHelpers.parseCollectionRichHero).toBe('function')

    const richHero = pageHelpers.parseCollectionRichHero(richHeroHtml)

    expect(richHero).toEqual({
      actions: [
        {
          href: 'https://cdn.shopify.com/s/files/1/0786/8339/files/Teavision_Tea_Bag_Catalogue_1.pdf?v=1640138688',
          label: 'View our Tea Bag Manufacturing Catalogue',
        },
        {
          href: 'mailto:info@teavision.com.au?subject=Custom%20Tea%20Bag%20Enquiry',
          label: 'Speak to Our Team About Custom Tea Bags',
        },
      ],
      footnote: 'Minimum Order Quantity: 6,000 Tea Bags Per Blend',
      highlightAction: {
        href: 'https://www.teavision.com.au/collections/all',
        label: 'Create Your Own White Label Tea Bag',
      },
      image: {
        altText: 'Teavision Bulk Tea Bags',
        height: 577,
        url: 'https://cdn.shopify.com/s/files/1/0786/8339/files/TeaVision-14_1.jpg?v=1761279097',
        width: 1600,
      },
      introHtml:
        "Teavision's most-loved blends in convenient <strong>biodegradable pyramid tea bags</strong>.",
      title: 'Ready-Made Bulk Tea Bags for Cafes, Hotels & Retail',
    })
  })

  it('returns null for normal collection rich text without the opt-in marker', () => {
    const normalDescriptionHtml = `
      <h1>Wholesale Tea</h1>
      <p>Browse loose leaf tea in bulk.</p>
      <img src="https://cdn.shopify.com/s/files/1/0786/8339/files/other.jpg" alt="Tea">
    `

    expect(
      pageHelpers.parseCollectionRichHero(normalDescriptionHtml),
    ).toBeNull()
  })
})

describe('normalizeHtml', () => {
  it('demotes imported collection H1 and H2 headings to H3', () => {
    const html = pageHelpers.normalizeHtml(
      '<h1>Imported title</h1><h2>Imported section</h2><p>Body copy</p>',
    )

    expect(html).toContain('<h3>Imported title</h3>')
    expect(html).toContain('<h3>Imported section</h3>')
    expect(html).not.toContain('<h1')
    expect(html).not.toContain('<h2')
  })
})

describe('getLegacyCollectionBannerImage', () => {
  it('extracts the production collection hero background image', () => {
    const descriptionHtml = `
      <div id="kk-collection-banner" style="background-image: url('https://cdn.shopify.com/s/files/1/0786/8339/files/iStock-1828083790.jpg?v=1707454172');">
        <div id="kk-collection-banner-overlay"></div>
        <h1>Aniseed Tea</h1>
      </div>
    `

    expect(pageHelpers.getLegacyCollectionBannerImage(descriptionHtml)).toEqual(
      {
        altText: null,
        height: 200,
        url: 'https://cdn.shopify.com/s/files/1/0786/8339/files/iStock-1828083790.jpg?v=1707454172',
        width: 1130,
      },
    )
  })

  it('prefers the production banner over the collection thumbnail', () => {
    const featuredImage = {
      altText: 'Aniseed thumbnail',
      height: 800,
      url: 'https://cdn.shopify.com/s/files/1/0786/8339/collections/org_aniseed.jpg',
      width: 800,
    }
    const descriptionHtml = `
      <div id="kk-collection-banner" style="background-image: url(&quot;//cdn.shopify.com/s/files/1/0786/8339/files/aniseed-banner.jpg&quot;);">
        <h1>Aniseed Tea</h1>
      </div>
    `

    expect(pageHelpers.getHeroImage(featuredImage, descriptionHtml)?.url).toBe(
      'https://cdn.shopify.com/s/files/1/0786/8339/files/aniseed-banner.jpg',
    )
  })
})

describe('parsePageParam', () => {
  it('returns 1 for undefined', () => {
    expect(pageHelpers.parsePageParam(undefined)).toBe(1)
  })

  it('returns 1 for empty string', () => {
    expect(pageHelpers.parsePageParam('')).toBe(1)
  })

  it('returns 1 for non-numeric string', () => {
    expect(pageHelpers.parsePageParam('abc')).toBe(1)
  })

  it('returns 1 for zero', () => {
    expect(pageHelpers.parsePageParam('0')).toBe(1)
  })

  it('returns 1 for negative number', () => {
    expect(pageHelpers.parsePageParam('-5')).toBe(1)
  })

  it('returns 1 for decimal number', () => {
    expect(pageHelpers.parsePageParam('2.5')).toBe(1)
  })

  it('returns valid positive integer', () => {
    expect(pageHelpers.parsePageParam('3')).toBe(3)
  })

  it('returns 1 for large invalid-looking decimal', () => {
    expect(pageHelpers.parsePageParam('1.0')).toBe(1)
  })

  it('handles array param — uses first value', () => {
    expect(pageHelpers.parsePageParam(['4', '5'])).toBe(4)
  })

  it('handles array with invalid first value', () => {
    expect(pageHelpers.parsePageParam(['abc', '2'])).toBe(1)
  })

  it('returns large valid page number', () => {
    expect(pageHelpers.parsePageParam('999')).toBe(999)
  })
})

describe('getPaginationHref', () => {
  it('generates page 1 URL without page param (clean base URL)', () => {
    const href = pageHelpers.getPaginationHref({
      category: undefined,
      handle: 'all',
      page: 1,
      selectedFilters: [],
      sort: 'featured',
    })
    expect(href).toBe('/collections/all')
  })

  it('generates page 2 URL with page param', () => {
    const href = pageHelpers.getPaginationHref({
      category: undefined,
      handle: 'all',
      page: 2,
      selectedFilters: [],
      sort: 'featured',
    })
    expect(href).toBe('/collections/all?page=2')
  })

  it('generates page URL for category collection', () => {
    const href = pageHelpers.getPaginationHref({
      category: 'categories_all-herbs',
      handle: 'all',
      page: 3,
      selectedFilters: [],
      sort: 'featured',
    })
    expect(href).toBe('/collections/all/categories_all-herbs?page=3')
  })

  it('normalizes raw category segments to the safe charset', () => {
    const href = pageHelpers.getPaginationHref({
      category: 'Categories_All-Herbs',
      handle: 'all',
      page: 2,
      selectedFilters: [],
      sort: 'featured',
    })
    expect(href).toBe('/collections/all/categories_all-herbs?page=2')
  })

  it('strips path traversal characters from category segments', () => {
    const href = pageHelpers.getPaginationHref({
      category: '../%2F..%2Fadmin',
      handle: 'all',
      page: 2,
      selectedFilters: [],
      sort: 'featured',
    })
    expect(href).not.toContain('..')
    expect(href).not.toContain('//')
    expect(href).toMatch(/^\/collections\/all\/[a-z0-9_-]*\?page=2$/)
  })

  it('preserves sort param alongside page', () => {
    const href = pageHelpers.getPaginationHref({
      category: undefined,
      handle: 'all',
      page: 2,
      selectedFilters: [],
      sort: 'title-asc',
    })
    expect(href).toBe('/collections/all?sort=title-asc&page=2')
  })

  it('preserves filter params alongside page', () => {
    const href = pageHelpers.getPaginationHref({
      category: undefined,
      handle: 'all',
      page: 2,
      selectedFilters: ['{"productVendor":"test"}'],
      sort: 'featured',
    })
    expect(href).toContain('page=2')
    expect(href).toContain('filter=')
  })
})

describe('getHref (sort/filter hrefs drop page param)', () => {
  it('generates base collection href without page', () => {
    const href = pageHelpers.getHref('all', 'featured')
    expect(href).toBe('/collections/all')
    expect(href).not.toContain('page')
  })

  it('generates sorted href without page', () => {
    const href = pageHelpers.getHref('all', 'title-asc')
    expect(href).toBe('/collections/all?sort=title-asc')
    expect(href).not.toContain('page')
  })

  it('generates filtered href without page (page-reset on sort/filter change per D-25)', () => {
    const href = pageHelpers.getHref('all', 'featured', [
      '{"productVendor":"test"}',
    ])
    expect(href).not.toContain('page')
  })
})

describe('matchCategoryTag', () => {
  it('matches a category path segment to its raw Shopify tag', () => {
    expect(
      pageHelpers.matchCategoryTag('categories_australian-tea', [
        'categories_All Herbs',
        'categories_Australian Tea',
      ]),
    ).toBe('categories_Australian Tea')
  })

  it('returns null when no tag maps to the segment', () => {
    expect(
      pageHelpers.matchCategoryTag('categories_missing', [
        'categories_All Herbs',
      ]),
    ).toBeNull()
  })
})

describe('buildCategoryFilter index tag counts', () => {
  it('prefers full-index tag counts over first-page product counting', () => {
    const filter = pageHelpers.buildCategoryFilter({
      products: [],
      sourceFilter: null,
      handle: 'dried-herbs',
      selectedCategoryTag: null,
      sort: 'featured',
      selectedFilters: [],
      indexTagCounts: {
        'categories_All Herbs': 48,
        'categories_Australian Tea': 1,
        organic: 12,
      },
    })

    expect(filter?.values).toEqual([
      expect.objectContaining({ label: 'All Herbs', count: 48 }),
      expect.objectContaining({ label: 'Australian Tea', count: 1 }),
    ])
  })

  it('falls back to first-page product counting without index counts', () => {
    const filter = pageHelpers.buildCategoryFilter({
      products: [
        {
          id: 'gid://shopify/Product/1',
          handle: 'lemon-myrtle',
          title: 'Lemon Myrtle',
          availableForSale: true,
          productType: 'Herb',
          tags: ['categories_All Herbs'],
          featuredImage: null,
          priceRange: {
            minVariantPrice: { amount: '16.42', currencyCode: 'AUD' },
          },
          rating: undefined,
          reviewCount: undefined,
          variants: [],
        },
      ],
      sourceFilter: null,
      handle: 'dried-herbs',
      selectedCategoryTag: null,
      sort: 'featured',
      selectedFilters: [],
    })

    expect(filter?.values).toEqual([
      expect.objectContaining({ label: 'All Herbs', count: 1 }),
    ])
  })
})

describe('price filter exclusion', () => {
  it('identifies Shopify price-range filters', () => {
    const priceFilter: CollectionProductFilter = {
      id: 'filter.v.price',
      label: 'Price',
      type: FilterType.PriceRange,
      values: [
        {
          id: 'filter.v.price',
          label: 'Price',
          count: 0,
          input: JSON.stringify({ price: { min: 0, max: 100 } }),
        },
      ],
    }

    expect(pageHelpers.isPriceFilter(priceFilter)).toBe(true)
  })

  it('drops incoming price filter params from product filters', () => {
    const priceInput = JSON.stringify({ price: { min: 0, max: 100 } })
    const tagInput = JSON.stringify({ tag: 'organic' })

    expect(
      pageHelpers.parseSelectedFilterParams([priceInput, tagInput]),
    ).toEqual({
      selectedFilters: [tagInput],
      productFilters: [{ tag: 'organic' }],
    })
  })
})
