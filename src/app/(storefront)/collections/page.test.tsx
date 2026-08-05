import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getCollectionMenuSummaries } from '@/lib/shopify/operations/collection'

import Page from './page'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/shopify/env', () => ({
  SHOPIFY_COLLECTIONS_INDEX_MENU_HANDLE: 'collections-index',
}))

vi.mock('@/lib/shopify/operations/collection', () => ({
  getCollectionMenuSummaries: vi.fn(),
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
    vi.mocked(getCollectionMenuSummaries).mockReset()
  })

  it('renders only merchant-curated collection menu entries with their images', async () => {
    vi.mocked(getCollectionMenuSummaries).mockResolvedValue([
      {
        id: 'tea',
        handle: 'wholesale-bulk-tea',
        title: 'Wholesale Tea',
        description: '',
        featuredImage: {
          url: 'https://cdn.shopify.com/tea.jpg',
          altText: 'Tea leaves',
          width: 1200,
          height: 1200,
        },
        updatedAt: '2026-08-05T00:00:00Z',
        seo: { title: null, description: null },
      },
      {
        id: 'tea-bags',
        handle: 'bulk-tea-bags',
        title: 'Bulk Tea Bags',
        description: '',
        featuredImage: {
          url: 'https://cdn.shopify.com/tea-bags.jpg',
          altText: 'Tea bags',
          width: 1200,
          height: 1200,
        },
        updatedAt: '2026-08-05T00:00:00Z',
        seo: { title: null, description: null },
      },
      {
        id: 'herbs-spices',
        handle: 'herbs-and-spices',
        title: 'Wholesale Herbs & Spices',
        description: '',
        featuredImage: {
          url: 'https://cdn.shopify.com/herbs-spices.jpg',
          altText: 'Herbs and spices',
          width: 1200,
          height: 1200,
        },
        updatedAt: '2026-08-05T00:00:00Z',
        seo: { title: null, description: null },
      },
    ])

    const html = renderToStaticMarkup(await Page())

    expect(getCollectionMenuSummaries).toHaveBeenCalledWith('collections-index')
    expect(html).toContain('href="/collections/wholesale-bulk-tea"')
    expect(html).toContain('href="/collections/bulk-tea-bags"')
    expect(html).toContain('href="/collections/herbs-and-spices"')
    expect(html).toContain('https://cdn.shopify.com/tea.jpg')
    expect(html).toContain('https://cdn.shopify.com/tea-bags.jpg')
    expect(html).toContain('https://cdn.shopify.com/herbs-spices.jpg')
    expect(html).not.toContain('Aniseed Tea')
    expect(html).not.toContain('Black Peppercorn')
  })
})
