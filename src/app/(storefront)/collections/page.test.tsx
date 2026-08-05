import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCollectionSummaries } from '@/lib/shopify/operations/collection'
import type { CollectionSummary } from '@/lib/shopify/types'

import Page from './page'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/shopify/operations/collection', () => ({
  getCollectionSummaries: vi.fn(),
}))

vi.mock('@/lib/contact/actions', () => ({
  submitContactFormAction: vi.fn(),
}))

vi.mock('@/components/contact', () => ({
  ContactSection: () => <div>Contact section</div>,
}))

vi.mock('./_components/collection-card-image', () => ({
  CollectionCardImage: ({
    collection,
  }: {
    collection: {
      featuredImage: { url: string } | null
      title: string
    }
  }) =>
    collection.featuredImage ? (
      <span
        data-image-src={collection.featuredImage.url}
        data-image-alt={collection.title}
      />
    ) : null,
}))

describe('Collections index page', () => {
  beforeEach(() => {
    vi.mocked(getCollectionSummaries).mockReset()
  })

  it('renders the genuine production collections in production order', async () => {
    const expectedHandles = [
      'australian-native-ingredients',
      'black-tea',
      'bulk-tea-bags',
      'chai',
      'dessert-cocktail-inspired-blends',
      'green-tea',
      'matcha-tea',
      'organic-tea',
      'speciality-tea',
      'superfood-extract-powders-proteins-supplements',
      'tea-masters-selection-worlds-best-teas',
      'wellness-functional-tea',
      'white-tea',
      'cafe-range',
      'herbs-and-spices',
      'wholesale-bulk-tea',
    ]
    const ingredientCollections = [
      collectionSummary('aniseed-tea', 'Aniseed Tea'),
      collectionSummary('black-peppercorn', 'Black Peppercorn'),
    ]
    const curatedCollections = expectedHandles.map((handle) =>
      collectionSummary(handle, handle),
    )

    vi.mocked(getCollectionSummaries).mockResolvedValue([
      ...ingredientCollections,
      ...curatedCollections.toReversed(),
    ])
    const html = renderToStaticMarkup(await Page())
    const renderedHandles = Array.from(
      html.matchAll(/href="\/collections\/([^"]+)"/g),
      (match) => match[1],
    )

    expect(getCollectionSummaries).toHaveBeenCalledOnce()
    expect(renderedHandles).toEqual(expectedHandles)
    expect(html).not.toContain('Aniseed Tea')
    expect(html).not.toContain('Black Peppercorn')
  })
})

function collectionSummary(handle: string, title: string): CollectionSummary {
  return {
    id: handle,
    handle,
    title,
    description: '',
    featuredImage: {
      url: `https://cdn.shopify.com/${handle}.jpg`,
      altText: title,
      width: 1200,
      height: 1200,
    },
    updatedAt: '2026-08-05T00:00:00Z',
    seo: { title: null, description: null },
  }
}
