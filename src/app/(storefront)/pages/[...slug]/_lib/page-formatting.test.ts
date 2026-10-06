import { describe, expect, it, vi } from 'vitest'

import type { ShopifyPage } from '@/lib/shopify/operations/storefront-page'

import { getMetadataTitle } from './page-formatting'

vi.mock('server-only', () => ({}))

function page(title: string, seoTitle: string | null): ShopifyPage {
  return {
    id: 'gid://shopify/Page/1',
    handle: 'example',
    title,
    body: '',
    bodySummary: '',
    updatedAt: '2026-10-06T00:00:00Z',
    seo: { title: seoTitle, description: null },
  }
}

describe('getMetadataTitle', () => {
  it('keeps an SEO title that already ends with the brand', () => {
    expect(
      getMetadataTitle(
        page('How to Store Bulk Tea', 'How to Store Bulk Tea | Teavision'),
      ),
    ).toEqual({ absolute: 'How to Store Bulk Tea | Teavision' })
  })

  it('lets the layout template add the brand to other titles', () => {
    expect(getMetadataTitle(page('Our Range', null))).toBe('Our Range')
    expect(
      getMetadataTitle(page('Teavision Reviews', 'Teavision Reviews')),
    ).toBe('Teavision Reviews')
  })
})
