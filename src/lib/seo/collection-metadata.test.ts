import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
import type { Collection } from '@/lib/shopify/types'

import { getCollectionMetadata } from './collection-metadata'

const collection: Collection = {
  id: 'tea',
  handle: 'wholesale-white-tea',
  title: 'Wholesale White Tea',
  description: '',
  descriptionHtml: '<p>White tea for wholesale sourcing.</p>',
  featuredImage: null,
  updatedAt: '2026-09-08',
  seo: { title: 'White Tea', description: '' },
}
afterEach(() => vi.unstubAllEnvs())

describe('collection SEO metadata', () => {
  it('preserves meaningful authored bulk-sourcing search titles', () => {
    const title = 'Bulk Tea | Buy High Quality Bulk Loose Tea Online Australia'
    expect(
      getCollectionMetadata({
        ...collection,
        title: 'Wholesale Tea',
        seo: { title, description: '' },
      }).title,
    ).toEqual({ absolute: title })
  })
  it('provides nonempty metadata, preserving wholesale intent', () => {
    const metadata = getCollectionMetadata(collection)
    expect(metadata.title).toEqual({
      absolute: 'Wholesale White Tea | Teavision',
    })
    expect(metadata.description).toMatch(
      /^Browse Wholesale White Tea from Teavision/,
    )
  })
  it('replaces title-only descriptions with a collection-specific snippet', () => {
    const metadata = getCollectionMetadata({
      ...collection,
      handle: 'black-peppercorn',
      title: 'Black Peppercorn',
      descriptionHtml: '<p>Black Peppercorn</p>',
      seo: { title: '', description: 'Black Peppercorn' },
    })
    expect(metadata.description).toMatch(
      /^Browse Black Peppercorn from Teavision/,
    )
  })
  it('corrects known copied snippets while preserving subsequent Shopify edits', () => {
    const ginkgo = {
      ...collection,
      handle: 'ginkgo-biloba-tea',
      title: 'Ginkgo Biloba Tea',
      seo: {
        title: '',
        description:
          'Looking for Ginger Tea Bags? Wholesale prices on our Organic, Natural Bulk Ginger Tea Bags. Visit our site to buy tea in Australia!',
      },
    }
    expect(getCollectionMetadata(ginkgo).description).toMatch(
      /^Browse Ginkgo Biloba Tea/,
    )
    const edited =
      'Explore our ginkgo biloba tea collection and contact Teavision for wholesale supply in Australia.'
    expect(
      getCollectionMetadata({
        ...ginkgo,
        seo: { title: '', description: edited },
      }).description,
    ).toBe(edited)
  })
  it('self-canonicalizes distinct unfiltered pagination', () => {
    expect(
      getCollectionMetadata(collection, { page: '2' }).alternates?.canonical,
    ).toBe('/collections/wholesale-white-tea?page=2')
  })
  it.each([
    { sort: 'price-asc' },
    { filter: '{"tag":"organic"}' },
    { q: 'white' },
  ])(
    'noindexes filtered variants and canonicalizes the collection',
    (search) => {
      vi.stubEnv('DISABLE_INDEXING', 'false')
      const metadata = getCollectionMetadata(collection, {
        ...search,
        page: '2',
      })
      expect(metadata.robots).toEqual({ index: false, follow: true })
      expect(metadata.alternates?.canonical).toBe(
        '/collections/wholesale-white-tea',
      )
    },
  )
  it('noindexes category and test collection URLs', () => {
    vi.stubEnv('DISABLE_INDEXING', 'false')
    expect(
      getCollectionMetadata(collection, {}, 'categories_organic').robots,
    ).toEqual({ index: false, follow: true })
    expect(
      getCollectionMetadata({ ...collection, handle: 'test-green-tea' }).robots,
    ).toEqual({ index: false, follow: true })
  })
  it('supplies a useful fallback for empty collections without leaking UI labels', () => {
    const metadata = getCollectionMetadata({
      ...collection,
      handle: 'all',
      title: 'All',
      descriptionHtml: '',
      seo: { title: '', description: 'Read More About Tea' },
    })
    expect(metadata.title).toEqual({
      absolute: 'Wholesale tea, herbs & spices | Teavision',
    })
    expect(metadata.description).toMatch(
      /^Browse Wholesale tea, herbs & spices/,
    )
    expect(metadata.description?.length).toBeLessThanOrEqual(160)
  })
})
